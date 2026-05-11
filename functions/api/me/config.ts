/**
 * GET  /api/me/config              → caller's full config bundle
 * PUT  /api/me/config?slug=:slug   → set fields for one agent
 */
import {
  getCallerEmail,
  proxyToWorkforce,
  type SharedEnv,
} from "../_lib";

interface Env extends SharedEnv {}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  if (!email) return new Response("unauthenticated", { status: 401 });
  return proxyToWorkforce(ctx.env, {
    url: "https://config-api.nightluna.com/me",
    bearer: ctx.env.CONFIG_API_BEARER,
    method: "GET",
    userEmail: email,
  });
};

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  if (!email) return new Response("unauthenticated", { status: 401 });

  const url = new URL(ctx.request.url);
  const slug = url.searchParams.get("slug") ?? "";
  if (!SLUG_RE.test(slug)) {
    return new Response("invalid or missing 'slug' query param", {
      status: 400,
    });
  }
  const body = await ctx.request.text();
  return proxyToWorkforce(ctx.env, {
    url: `https://config-api.nightluna.com/me/agents/${encodeURIComponent(slug)}`,
    bearer: ctx.env.CONFIG_API_BEARER,
    method: "PUT",
    body,
    userEmail: email,
  });
};
