/**
 * Root Pages middleware: the intranet's session gate.
 *
 * Architecture (v2 — "one bounce per 12h"): Cloudflare Access gates ONLY
 * /auth/login (see functions/auth/login.ts). Every other path is Bypassed at
 * the Access layer, and THIS middleware enforces auth instead, using the
 * first-party `nl_session` cookie (HMAC-signed, see functions/api/_session.ts).
 *
 * Why: Access's CF_Authorization cookie never persists on nightluna.com
 * (modern-browser third-party-cookie / bounce-tracking protections), so when
 * Access gated every path, every navigation re-ran the cross-origin login
 * dance — silent for single-Google-account users, an account-picker prompt on
 * EVERY click for multi-account users, and fatal for same-origin XHR (the
 * comment POST bug). With the gate in first-party middleware, users bounce
 * through Access/Google exactly once per session.
 *
 * Flow per request:
 *   1. /auth/login is public here (Access gates it; it mints the session).
 *   2. Strip any inbound `x-nl-verified-email` header (anti-spoofing).
 *   3. Valid nl_session → forward downstream with `x-nl-verified-email` set
 *      (the API functions' getCallerEmail trusts it), sliding-refresh the
 *      cookie past half-life.
 *   4. No session, but Access identity headers present (transition state,
 *      while Access still fronts the path) → mint the cookie and continue.
 *   5. Otherwise: document GETs redirect to /auth/login?redirect=<path>;
 *      everything else (XHR, assets fetched out-of-band) gets 401 JSON.
 */
import { getCallerEmail } from "./api/_lib";
import {
  mintSession,
  sessionCookie,
  readSession,
  readCookie,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type SessionEnv,
} from "./api/_session";

const VERIFIED_EMAIL_HEADER = "x-nl-verified-email";

/** Paths this middleware never blocks. /auth/login is gated by Access itself. */
function isPublicPath(pathname: string): boolean {
  return pathname === "/auth/login" || pathname.startsWith("/auth/login/");
}

/** A top-level page load we can bounce through the login redirect. */
function isDocumentRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const dest = request.headers.get("sec-fetch-dest");
  if (dest) return dest === "document";
  return (request.headers.get("accept") ?? "").includes("text/html");
}

export const onRequest: PagesFunction<SessionEnv> = async (ctx) => {
  const url = new URL(ctx.request.url);
  if (isPublicPath(url.pathname)) return ctx.next();

  const session = await readSession(ctx.env, readCookie(ctx.request, SESSION_COOKIE));
  let email = session?.email ?? "";

  // Transition path: while Access still fronts this route it forwards identity
  // headers on authenticated requests — accept them and mint the cookie so the
  // switch to Bypass is seamless. Probe identity on a BODYLESS request so we
  // never touch the original request's body (POST/PATCH bodies must reach the
  // downstream function intact — double-wrapping a body-bearing request strips
  // it and breaks comment posting / resolving).
  let freshToken: string | null = null;
  if (!email) {
    const probeHeaders = new Headers(ctx.request.headers);
    probeHeaders.delete(VERIFIED_EMAIL_HEADER);
    email = getCallerEmail(new Request(url.toString(), { headers: probeHeaders }));
    if (email) freshToken = await mintSession(ctx.env, email);
  }

  if (!email) {
    if (isDocumentRequest(ctx.request)) {
      const dest = url.pathname + url.search;
      return new Response(null, {
        status: 302,
        headers: {
          location: `/auth/login?redirect=${encodeURIComponent(dest)}`,
          "cache-control": "no-store",
        },
      });
    }
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  // Sliding refresh: re-mint on document loads once past half the TTL.
  if (
    !freshToken &&
    session &&
    isDocumentRequest(ctx.request) &&
    session.exp - Date.now() / 1000 < SESSION_TTL_SECONDS / 2
  ) {
    freshToken = await mintSession(ctx.env, email);
  }

  // Forward with the verified-identity header. Single rewrap of the original
  // request: `new Request(ctx.request)` exposes a mutable Headers and carries
  // the body through to the function unconsumed. Strip any inbound copy of the
  // header first so it can't be spoofed from outside.
  const forwarded = new Request(ctx.request);
  forwarded.headers.delete(VERIFIED_EMAIL_HEADER);
  forwarded.headers.set(VERIFIED_EMAIL_HEADER, email);
  const res = await ctx.next(forwarded);

  if (freshToken) {
    // res.headers may be immutable; clone so we can append Set-Cookie.
    const out = new Response(res.body, res);
    out.headers.append("set-cookie", sessionCookie(freshToken));
    return out;
  }
  return res;
};
