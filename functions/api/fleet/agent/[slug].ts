/**
 * GET /api/fleet/agent/:slug?since=ISO&limit=N
 *
 * Per-agent fleet view: kill-switch state + recent invocations
 * (with user_email scrubbed for non-admin callers).
 */
import {
  getCallerEmail,
  isCallerAdmin,
  proxyToWorkforce,
  type SharedEnv,
} from "../../_lib";

interface Env extends SharedEnv {}

export const onRequestGet: PagesFunction<Env, "slug"> = async (ctx) => {
  const slug = ctx.params.slug;
  if (typeof slug !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return new Response("invalid slug", { status: 400 });
  }
  const url = new URL(ctx.request.url);
  const since = url.searchParams.get("since") ?? "";
  const limit = url.searchParams.get("limit") ?? "50";
  const qs = new URLSearchParams();
  if (since) qs.set("since", since);
  qs.set("limit", limit);
  const upstream = `https://fleet-api.nightluna.com/agent/${encodeURIComponent(slug)}?${qs.toString()}`;
  const email = getCallerEmail(ctx.request);
  return proxyToWorkforce(ctx.env, {
    url: upstream,
    bearer: ctx.env.FLEET_API_BEARER,
    method: "GET",
    isAdmin: isCallerAdmin(email),
  });
};
