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

/** Read the signed-in user's email from CF Access. */
export function getCallerEmail(request: Request): string {
  return (
    request.headers.get("cf-access-authenticated-user-email") ?? ""
  ).toLowerCase();
}

/**
 * Workspace groups that should get the X-Admin header. Today only John
 * is the AI admin. Eventually replaced by reading the `cf-access-groups`
 * claim from the JWT.
 */
const ADMIN_EMAILS = new Set(["john@lunadiabetes.com"]);
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
