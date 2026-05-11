/**
 * POST /api/admin/kill
 *   body: { agent_slug, killed, reason? }
 *
 * Admin-only — proxies to fleet-api /admin/kill. The X-Admin header is
 * set server-side based on the signed-in user's email matching a small
 * hard-coded admin list (until CF Access groups land).
 */
import {
  getCallerEmail,
  isCallerAdmin,
  proxyToWorkforce,
  type SharedEnv,
} from "../_lib";

interface Env extends SharedEnv {}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  if (!email) return new Response("unauthenticated", { status: 401 });
  if (!isCallerAdmin(email)) {
    return new Response("admin-only", { status: 403 });
  }

  // The browser sends { agent_slug, killed, reason? }. We add set_by
  // server-side from the signed-in email so the audit row reflects
  // the actual admin who flipped the switch, not what the client said.
  const inbound = (await ctx.request.json().catch(() => ({}))) as {
    agent_slug?: string;
    killed?: boolean;
    reason?: string;
  };
  const outbound = {
    agent_slug: inbound.agent_slug,
    killed: inbound.killed,
    set_by: email,
    ...(inbound.reason ? { reason: inbound.reason } : {}),
  };

  return proxyToWorkforce(ctx.env, {
    url: "https://fleet-api.nightluna.com/admin/kill",
    bearer: ctx.env.FLEET_API_BEARER,
    method: "POST",
    body: JSON.stringify(outbound),
    isAdmin: true,
  });
};
