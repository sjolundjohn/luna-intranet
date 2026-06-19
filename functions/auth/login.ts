/**
 * GET /auth/login — the ONLY path gated by Cloudflare Access.
 *
 * Access challenges the user (Google SSO, @lunadiabetes.com policy) and then
 * forwards the request here with verified-identity headers. We convert that
 * into the first-party `nl_session` cookie (12h) and bounce the user back to
 * where they were headed. The root middleware enforces the cookie everywhere
 * else, so users go through Access exactly once per session instead of on
 * every navigation.
 *
 * Required Access setup: a self-hosted app on hostname `nightluna.com` with
 * path `auth/login`, Allow policy for @lunadiabetes.com. Everything else on
 * the apex is Bypass / Everyone (the middleware is the gate).
 */
import { getCallerEmail } from "../api/_lib";
import { mintSession, sessionCookie, type SessionEnv } from "../api/_session";

export const onRequestGet: PagesFunction<SessionEnv> = async (ctx) => {
  // Only Access-forwarded identity counts here; strip the middleware header
  // so a spoofed copy can never reach getCallerEmail's trusted path.
  const headers = new Headers(ctx.request.headers);
  headers.delete("x-nl-verified-email");
  const email = getCallerEmail(new Request(ctx.request.url, { headers }));

  if (!email) {
    return new Response(
      "Sign-in failed: no verified identity reached the login route. " +
        "/auth/login must be gated by a Cloudflare Access app (Allow @lunadiabetes.com).",
      { status: 401, headers: { "content-type": "text/plain", "cache-control": "no-store" } },
    );
  }

  const token = await mintSession(ctx.env, email);
  if (!token) {
    return new Response("SESSION_SECRET is not configured on the Pages project.", {
      status: 503,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }

  // Open-redirect guard: same-origin paths only.
  const raw = new URL(ctx.request.url).searchParams.get("redirect") ?? "/";
  const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  return new Response(null, {
    status: 302,
    headers: {
      location: redirect,
      "set-cookie": sessionCookie(token),
      "cache-control": "no-store",
    },
  });
};
