/**
 * Shared helpers for the Intranet's Pages Functions that proxy to
 * Workforce-side Workers (fleet-api, config-api). All such proxies
 * follow the same shape:
 *
 *   1. Read caller email from cf-access-authenticated-user-email
 *   2. Add Authorization: Bearer <worker-bearer> server-side
 *   3. Add CF-Access-Client-Id + CF-Access-Client-Secret so we can
 *      get past CF Access on *.nightluna.com (same pattern as
 *      /api/chat already uses for ai-proxy)
 *   4. Optionally add X-User-Email + X-Admin headers for the
 *      receiving Worker's per-route logic
 *   5. Pipe the response back unchanged
 *
 * Secrets all live in the luna-intranet Pages project settings.
 */

export interface SharedEnv {
  // CF Access service token — gets us through Access on *.nightluna.com
  CF_ACCESS_CLIENT_ID?: string;
  CF_ACCESS_CLIENT_SECRET?: string;

  // Per-Worker bearers (set via wrangler pages secret put)
  FLEET_API_BEARER?: string;
  CONFIG_API_BEARER?: string;
}

export interface ProxyOptions {
  /** Override the upstream URL. */
  url: string;
  /** Worker-level bearer required by the upstream. */
  bearer: string | undefined;
  /** Optional method override (defaults to incoming request's method). */
  method?: string;
  /** Optional body override (defaults to incoming request's body). */
  body?: string | null;
  /** Email of the signed-in user — sent as X-User-Email. */
  userEmail?: string;
  /** Whether to set X-Admin: true (admin routes). */
  isAdmin?: boolean;
}

/** Read the signed-in user's email from CF Access.
 *
 * Primary source is the `Cf-Access-Authenticated-User-Email` header. As a
 * fallback we decode the `email` claim from the `Cf-Access-Jwt-Assertion`
 * header that Access forwards on every authenticated request — the request
 * has already passed Access at the edge, so the assertion is trustworthy
 * here. This keeps identity working even when the email header is absent. */
export function getCallerEmail(request: Request): string {
  const header = (request.headers.get("cf-access-authenticated-user-email") ?? "").toLowerCase();
  if (header) return header;

  // Google Cloud IAP — the gateway in front of nightluna.com. The header value
  // is "<issuer>:<email>", e.g. "accounts.google.com:jane@lunadiabetes.com".
  const iap = request.headers.get("x-goog-authenticated-user-email");
  if (iap) {
    const email = iap.includes(":") ? iap.slice(iap.indexOf(":") + 1) : iap;
    if (email) return email.toLowerCase();
  }

  const jwt = request.headers.get("cf-access-jwt-assertion");
  if (jwt) {
    try {
      const part = jwt.split(".")[1] ?? "";
      let b64 = part.replace(/-/g, "+").replace(/_/g, "/");
      b64 += "=".repeat((4 - (b64.length % 4)) % 4);
      const claims = JSON.parse(atob(b64)) as { email?: string };
      if (typeof claims.email === "string") return claims.email.toLowerCase();
    } catch {
      /* fall through */
    }
  }

  // Reality on nightluna.com: Google IAP gates the site but forwards NO identity
  // header to the Cloudflare Pages origin — the only per-user signal that reaches
  // the function is the GCP_IAP_UID cookie (a stable Google user id). Use it as
  // the identity key, namespaced so it can never collide with a real email.
  const uid = readCookie(request, "GCP_IAP_UID");
  if (uid) return `gcp-iap:${uid}`;

  return "";
}

/** Read a single cookie value from the request's Cookie header. */
function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie");
  if (!raw) return "";
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1).trim();
  }
  return "";
}

/**
 * Admins. Today only John. We match either a real email (once IAP is fixed to
 * forward one) or his IAP identity key `gcp-iap:<GCP_IAP_UID>` — which is what
 * getCallerEmail returns today. (Update the UID if his Google account changes.)
 */
const ADMIN_EMAILS = new Set([
  "john@lunadiabetes.com",
  "gcp-iap:112029539987518991636",
]);
export function isCallerAdmin(email: string): boolean {
  return ADMIN_EMAILS.has(email);
}

/**
 * Forward a request to an upstream Workforce Worker. Returns the
 * upstream Response unchanged (status + headers + body), so the caller
 * just `return proxyToWorkforce(...)`.
 */
export async function proxyToWorkforce(
  env: SharedEnv,
  options: ProxyOptions,
): Promise<Response> {
  if (!options.bearer) {
    return new Response("upstream bearer not configured on Pages project", {
      status: 503,
      headers: { "content-type": "text/plain" },
    });
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${options.bearer}`,
  };
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    headers["CF-Access-Client-Id"] = env.CF_ACCESS_CLIENT_ID;
    headers["CF-Access-Client-Secret"] = env.CF_ACCESS_CLIENT_SECRET;
  }
  if (options.userEmail) headers["X-User-Email"] = options.userEmail;
  if (options.isAdmin) headers["X-Admin"] = "true";

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body !== undefined && options.body !== null) {
    init.body = options.body;
  }

  const upstream = await fetch(options.url, init);

  // Don't blindly forward upstream headers — keep this to JSON.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}
