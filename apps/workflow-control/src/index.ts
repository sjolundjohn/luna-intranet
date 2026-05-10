/**
 * workflow-control — control plane for Luna's Cloudflare Workflows.
 *
 * Surface (Phase 3 wires real triggers):
 *   GET  /workflows                       → list workflows + status
 *   GET  /workflows/:id                   → workflow definition
 *   GET  /workflows/:id/runs              → run history
 *   POST /workflows/:id/run               → trigger a manual run
 *   POST /workflows/:id/runs/:run/cancel  → cancel an in-flight run
 *
 * The workflow-runner Worker (apps/workflow-runner/) holds the
 * Cloudflare Workflows definitions. This Worker is the API surface.
 */
import { extractActor, requireRole } from "@luna/shared/auth";

interface WorkflowRunner {
  fetch: typeof fetch;
}

interface Env {
  D1: D1Database;
  WORKFLOW_RUNNER: WorkflowRunner;
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

    if (method === "GET" && path === "/workflows") {
      return json(200, {
        workflows: [],
        note: "Phase 3 reads from the workflows D1 table.",
      });
    }

    const detailMatch = method === "GET" && /^\/workflows\/([a-z0-9-]+)$/.exec(path);
    if (detailMatch) {
      return json(200, {
        id: detailMatch[1],
        note: "Phase 3 reads workflow definition + current version.",
      });
    }

    const runsMatch =
      method === "GET" && /^\/workflows\/([a-z0-9-]+)\/runs$/.exec(path);
    if (runsMatch) {
      return json(200, {
        id: runsMatch[1],
        runs: [],
        note: "Phase 3 reads workflow_runs table.",
      });
    }

    const triggerMatch =
      method === "POST" && /^\/workflows\/([a-z0-9-]+)\/run$/.exec(path);
    if (triggerMatch) {
      const id = triggerMatch[1]!;
      // Phase 3: env.WORKFLOW_RUNNER.create(...) on the Workflows binding.
      // Today: 202 with a stubbed run id.
      const stubRunId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return json(202, {
        id,
        run_id: stubRunId,
        status: "queued",
        note: "Phase 3 creates a real Cloudflare Workflows instance.",
      });
    }

    const cancelMatch =
      method === "POST" &&
      /^\/workflows\/([a-z0-9-]+)\/runs\/([a-z0-9-]+)\/cancel$/.exec(path);
    if (cancelMatch) {
      // Cancel requires ai-admin OR the workflow's owner.
      const adminFail = requireRole(actor, ["ai-admin"]);
      if (adminFail) return adminFail;
      return json(202, {
        id: cancelMatch[1],
        run_id: cancelMatch[2],
        status: "cancellation-requested",
        note: "Phase 3 issues an actual cancel via the Workflows binding.",
      });
    }

    return json(404, { error: "not-found", path });
  },
};
