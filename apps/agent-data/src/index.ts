/**
 * agent-data — placeholder Worker for the Data Agent. Returns 503 with
 * the canonical "coming-soon" message; the service binding from the
 * router resolves cleanly while we build the real one (Phase 3+).
 *
 * When the real implementation lands it'll mirror agent-basal:
 * BasalAgent → DataAgent extending LunaAgent, a Vectorize index for
 * domain knowledge over the data warehouse, and a tool-use loop wired
 * to scoped read-only D1/BigQuery access.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(
      JSON.stringify({
        error: "agent-not-yet-live",
        message: "The Data Agent isn't live yet. Track progress on /roadmap.",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json" },
      },
    );
  },
};
