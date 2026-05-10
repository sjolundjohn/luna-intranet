/**
 * agent-personal — placeholder Worker for personal (Class B) agents.
 *
 * Returns 503 with the "by-request" message. The route shape exists so
 * agent-router's service binding resolves; Phase 2+ adds a per-Lunite
 * provisioning flow on /agents/me that materializes a real instance
 * with that user's scoped configuration.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(
      JSON.stringify({
        error: "agent-by-request",
        message:
          "Personal agents are by-request today. DM John in Slack with what you'd like yours to do.",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json" },
      },
    );
  },
};
