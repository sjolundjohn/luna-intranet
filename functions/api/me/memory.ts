/**
 * DELETE /api/me/memory?slug=:slug
 *
 * Queue a memory wipe for the caller × agent_slug. The wipe is
 * recorded; Phase 6+ runs a worker that clears the user's history
 * in luna-facet-memory.
 */
import {
  getCallerEmail,
  proxyToWorkforce,
  type SharedEnv,
} from "../_lib";

interface Env extends SharedEnv {}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const email = getCallerEmail(ctx.request);
  if (!email) return new Response("unauthenticated", { status: 401 });

  const url = new URL(ctx.request.url);
  const slug = url.searchParams.get("slug") ?? "";
  if (!SLUG_RE.test(slug)) {
    return new Response("invalid or missing 'slug' query param", {
      status: 400,
    });
  }
  return proxyToWorkforce(ctx.env, {
    url: `https://config-api.nightluna.com/me/agents/${encodeURIComponent(slug)}/memory`,
    bearer: ctx.env.CONFIG_API_BEARER,
    method: "DELETE",
    userEmail: email,
  });
};
