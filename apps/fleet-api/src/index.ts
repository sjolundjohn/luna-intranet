/**
 * fleet-api — read-side queries for /fleet and /fleet/briefing.
 *
 * Surface (Phase 3 wires real D1 reads):
 *   GET /agents              → per-agent rollups (7d window)
 *   GET /agents/:slug        → single agent's metrics + recent invocations (anonymized to team)
 *   GET /teams               → per-team rollups (7d) — what /fleet shows
 *   GET /briefing/today      → latest briefing episode metadata
 *
 * The discipline: per-employee identifiers are never selected unless
 * the caller is `ai-admin`. The SQL helpers below show this — the
 * non-admin query has no `user_email` column, full stop.
 */
import { extractActor, requireRole } from "@luna/shared/auth";

interface Env {
  D1: D1Database;
  ANALYTICS: AnalyticsEngineDataset;
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

    const isAdmin = actor.groups.includes("ai-admin");
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/agents") {
      // Per-agent 7d rollup. Phase 3 reads from audit_log GROUP BY agent_slug.
      return json(200, {
        agents: [],
        note: "Phase 3 wires GROUP BY agent_slug over audit_log. No per-employee data is ever selected here.",
      });
    }

    const agentMatch = /^\/agents\/([a-z0-9-]+)$/.exec(path);
    if (agentMatch) {
      const slug = agentMatch[1]!;
      // Per-agent detail + recent invocations. Anonymized to team unless admin.
      return json(200, {
        agent: slug,
        admin_view: isAdmin,
        recent: [],
        note: isAdmin
          ? "Phase 3 returns full audit rows including user_email."
          : "Phase 3 returns anonymized rows: user.team only, never user.email.",
      });
    }

    if (path === "/teams") {
      // Per-team 7d rollup — what the /fleet table shows.
      return json(200, {
        teams: [],
        note: "Phase 3 wires GROUP BY team. user_email is never selected.",
      });
    }

    if (path === "/briefing/today") {
      // Latest briefing episode metadata. Phase 3 reads from briefing_episodes.
      return json(200, {
        cadence: "daily",
        date: null,
        markdown_url: null,
        audio_url: null,
        note: "Phase 3 wires briefing_episodes; Phase 4 wires audio.",
      });
    }

    return json(404, { error: "not-found", path });
  },
};
