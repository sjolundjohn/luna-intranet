/**
 * agent-router — single entry point for browser → agent dispatch.
 *
 * Wire path:
 *
 *   browser
 *     └─ POST /api/chat (Pages Function: functions/api/chat.ts)
 *           └─ env.AGENT_ROUTER.fetch(req)   [service binding]
 *                 └─ THIS Worker
 *                       ├─ extract identity from CF Access claims
 *                       ├─ look up agent's permission matrix in D1
 *                       ├─ check kill-switch in KV
 *                       └─ env.AGENT_<NAME>.fetch(req)  [service binding]
 *                             └─ per-agent Worker (apps/agent-<name>/)
 *                                   └─ Durable Object per (agent, user)
 *                                         └─ AI Gateway → Anthropic
 *
 * Why no hand-rolled JSON-RPC: this is exactly what service bindings
 * are for. The body is a normal JSON request; the receiving Worker
 * extracts whatever shape it expects. No protocol invention required.
 */
import {
  type ActorIdentity,
  type AgentPermissions,
  type Role,
} from "@luna/shared";
import { extractActor, requireRole } from "@luna/shared/auth";
import { isKilled } from "@luna/shared/killswitch";

interface Env {
  D1: D1Database;
  KILL_SWITCH: KVNamespace;
  AGENT_BASAL: Fetcher;
  AGENT_DATA: Fetcher;
  AGENT_PERSONAL: Fetcher;
}

/**
 * Compile-time agent registry. Adding an agent here is a one-line
 * change; the type system then forces matching cases in the dispatch
 * ternary below — TypeScript catches "you forgot to wire dispatch."
 */
type AgentName = "basal" | "data-agent" | "personal";

const dispatch = (agent: AgentName, env: Env): Fetcher => {
  switch (agent) {
    case "basal":
      return env.AGENT_BASAL;
    case "data-agent":
      return env.AGENT_DATA;
    case "personal":
      return env.AGENT_PERSONAL;
  }
};

const isAgentName = (s: string): s is AgentName =>
  s === "basal" || s === "data-agent" || s === "personal";

/**
 * Resolve permissions + PHI scope for an agent. In Phase 0 this reads
 * a static row from the `agents` D1 table that the build-time content
 * pipeline writes (Phase 1k) — fast, predictable, and avoids each
 * agent Worker having to ship its own copy of its declaration.
 */
async function lookupAgent(
  env: Env,
  slug: AgentName,
): Promise<{ permissions: AgentPermissions; piiScope: "none" | "employee" | "phi"; killed: boolean } | null> {
  const row = await env.D1.prepare(
    `SELECT permissions_invoke, permissions_configure, permissions_view_logs, pii_scope
       FROM agents
      WHERE slug = ?
      LIMIT 1`,
  )
    .bind(slug)
    .first<{
      permissions_invoke: string;
      permissions_configure: string;
      permissions_view_logs: string;
      pii_scope: "none" | "employee" | "phi";
    }>();

  if (!row) return null;

  const parse = (s: string): readonly Role[] =>
    JSON.parse(s) as readonly Role[];

  const piiScope = row.pii_scope;
  const killed = await isKilled(env, slug, { isPhi: piiScope === "phi" });

  return {
    permissions: {
      invoke: parse(row.permissions_invoke),
      configure: parse(row.permissions_configure),
      viewLogs: parse(row.permissions_view_logs),
    },
    piiScope,
    killed,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Identity is the source of every later check.
    const actor: ActorIdentity = extractActor(request);
    if (!actor.verified) {
      return new Response("Unauthenticated", { status: 401 });
    }

    // Pull the requested agent slug from the body. We deliberately don't
    // trust headers for routing — the body is what the user posted.
    let body: { agent?: string };
    try {
      // Clone so the per-agent Worker can re-read the body too.
      body = (await request.clone().json()) as { agent?: string };
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const slug = (body.agent ?? "basal").toLowerCase();
    if (!isAgentName(slug)) {
      return new Response(`Unknown agent: ${slug}`, { status: 404 });
    }

    // Permissions + kill-switch lookup.
    const meta = await lookupAgent(env, slug);
    if (!meta) {
      return new Response(`Agent not registered: ${slug}`, { status: 404 });
    }
    if (meta.killed) {
      return new Response(`Agent "${slug}" is paused.`, { status: 503 });
    }

    // PHI agents require the phi-authorized group on top of invoke perms.
    if (meta.piiScope === "phi" && !actor.groups.includes("phi-authorized")) {
      return new Response("PHI scope requires phi-authorized membership", {
        status: 403,
      });
    }

    const fail = requireRole(actor, meta.permissions.invoke);
    if (fail) return fail;

    // Forward to the per-agent Worker. The receiving Worker re-parses
    // the body — service bindings preserve the full request, including
    // body, headers, and method.
    return dispatch(slug, env).fetch(request);
  },
};
