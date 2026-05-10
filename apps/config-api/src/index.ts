/**
 * config-api — per-user agent configuration writes.
 *
 * Surface (Phase 2 wires fully):
 *   GET  /me                          → return current user's config bundle
 *   PUT  /me/agents/:slug             → toggle enable/disable, set custom instructions
 *   DEL  /me/agents/:slug/memory      → wipe an agent's memory of the caller
 *   POST /me/data/export              → start a data-export job
 *
 * Phase 0 ships the Worker, the routing skeleton, and the auth checks.
 * D1 writes and Vectorize deletes are stubbed — they're the next thing
 * to land in Phase 2 and the seam is in place.
 */
import { extractActor, requireRole } from "@luna/shared/auth";
import { writeAudit, sha256Hex, nowUtcIso } from "@luna/shared/audit";

interface Env {
  D1: D1Database;
  KILL_SWITCH: KVNamespace;
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const actor = extractActor(request);
    const fail = requireRole(actor, ["employee"]);
    if (fail) return fail;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // GET /me — return the caller's config + recent activity headers.
    if (method === "GET" && path === "/me") {
      // Phase 2: real D1 read of user_agent_config rows.
      return json(200, {
        email: actor.email,
        groups: actor.groups,
        agents: [],
        note: "Phase 2 wires real D1 reads; today this returns an empty config.",
      });
    }

    // PUT /me/agents/:slug — update enable/memory/customInstructions.
    const putMatch = method === "PUT" && /^\/me\/agents\/([a-z0-9-]+)$/.exec(path);
    if (putMatch) {
      const slug = putMatch[1]!;
      let body: { enabled?: boolean; memoryEnabled?: boolean; customInstructions?: string };
      try {
        body = await request.json();
      } catch {
        return json(400, { error: "invalid-json" });
      }
      // Phase 2: D1 UPSERT into user_agent_config.
      // Audit the write — even when the underlying data layer is stubbed,
      // recording that someone tried gives us the right history shape.
      await writeAudit(env, {
        user_email: actor.email,
        agent_slug: slug,
        model: "n/a",
        prompt_hash: await sha256Hex(`config:${slug}:${JSON.stringify(body)}`),
        response_hash: "",
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: 0,
        ts: nowUtcIso(),
      }).catch(() => {
        // D1 may not be wired in Phase 0; don't fail the user request.
      });
      return json(202, { status: "accepted", note: "Phase 2 persists this write." });
    }

    // DELETE /me/agents/:slug/memory — wipe an agent's memory of caller.
    const memMatch =
      method === "DELETE" && /^\/me\/agents\/([a-z0-9-]+)\/memory$/.exec(path);
    if (memMatch) {
      const slug = memMatch[1]!;
      // Phase 2: call the agent DO to truncate state; delete Vectorize
      // entries in the user's namespace.
      return json(202, {
        status: "accepted",
        agent: slug,
        note: "Phase 2 wires the actual DO state truncation + Vectorize delete.",
      });
    }

    // POST /me/data/export — kick off the per-user data export.
    if (method === "POST" && path === "/me/data/export") {
      return json(202, {
        status: "queued",
        note: "Phase 2 hands this to a Cloudflare Workflow that produces a signed R2 URL.",
      });
    }

    return json(404, { error: "not-found", path });
  },
};
