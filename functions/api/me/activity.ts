/**
 * GET /api/me/activity?limit=N
 *
 * Caller's own audit rows. The email is taken from CF Access on the
 * server side; the browser never has to pass it.
 */
import {
  getCallerEmail,
  proxyToWorkforce,
  type SharedEnv,
} from "../_lib";

interface Env extends SharedEnv {}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  if (!email) {
    return new Response("unauthenticated (no cf-access email)", {
      status: 401,
    });
  }
  const url = new URL(ctx.request.url);
  const limit = url.searchParams.get("limit") ?? "30";
  const upstream = `https://fleet-api.nightluna.com/me/activity?email=${encodeURIComponent(email)}&limit=${encodeURIComponent(limit)}`;
  return proxyToWorkforce(ctx.env, {
    url: upstream,
    bearer: ctx.env.FLEET_API_BEARER,
    method: "GET",
    userEmail: email,
  });
};
