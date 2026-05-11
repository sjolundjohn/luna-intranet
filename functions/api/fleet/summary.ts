/**
 * GET /api/fleet/summary?since=ISO
 *
 * Proxies to luna-fleet-api /summary, which aggregates audit_log rows
 * per agent_slug. Powers the dashboard tile counts + the /fleet stat
 * strip + per-department totals.
 */
import {
  getCallerEmail,
  isCallerAdmin,
  proxyToWorkforce,
  type SharedEnv,
} from "../_lib";

interface Env extends SharedEnv {}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const since = url.searchParams.get("since");
  const upstream = since
    ? `https://fleet-api.nightluna.com/summary?since=${encodeURIComponent(since)}`
    : "https://fleet-api.nightluna.com/summary";
  const email = getCallerEmail(ctx.request);
  return proxyToWorkforce(ctx.env, {
    url: upstream,
    bearer: ctx.env.FLEET_API_BEARER,
    method: "GET",
    isAdmin: isCallerAdmin(email),
  });
};
