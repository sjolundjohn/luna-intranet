/**
 * agent-basal — Basal Worker entry point + Durable Object class.
 *
 * Reached only via service binding from agent-router. The default
 * fetch handler routes any incoming request to the right
 * (agent, user) DO instance, which then runs the LunaAgent base
 * class's invoke() flow.
 *
 * Routing key: `basal:<userEmail>`. One DO per Lunite.
 */
import { LunaAgent, type LunaAgentEnv } from "@luna/agents-sdk-glue";
import type { AgentSlug, InvokeRequest } from "@luna/shared";
import { extractActor } from "@luna/shared/auth";

interface Env extends LunaAgentEnv {
  AGENT_BASAL_DO: DurableObjectNamespace;
  /** Vectorize index for per-user memory. */
  MEMORY?: VectorizeIndex;
}

/**
 * The Basal agent. Subclass of LunaAgent — base class handles
 * kill-switch, audit, AI Gateway dispatch, streaming response. We
 * just supply the system prompt and slug.
 *
 * The system prompt is the same one currently in
 * `functions/api/chat.ts` so the migration through the router does
 * not change Basal's behavior.
 */
export class BasalAgent extends LunaAgent<Env> {
  override readonly agentSlug: AgentSlug = "basal";
  override readonly piiScope = "none" as const;

  override getSystemPrompt(userInstructions?: string): string {
    const base = `You are Basal, an internal assistant for Luna Health Inc. You are speaking with an employee of Luna Health who has authenticated with their @lunadiabetes.com Google Workspace account.

Be concise and direct. Only respond to what is asked — do not volunteer suggestions or list capabilities. Use plain text; no markdown headings or bullet lists unless the user asks for them. Luna is a venture-backed medical device startup focused on diabetes care; you can help with drafting, summarizing, brainstorming, and general questions.`;

    const extra = (userInstructions ?? "").trim();
    if (!extra) return base;
    // Cap defensively even if config-api also caps. 1,000 char wall.
    const capped = extra.slice(0, 1000);
    return `${base}\n\nThe Lunite has asked you to follow these additional instructions where they don't conflict with the above:\n${capped}`;
  }
}

interface RequestBody {
  messages?: { role: "user" | "assistant"; content: string }[];
  systemPrompt?: string;
  workflowRunId?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const actor = extractActor(request);
    if (!actor.verified) {
      return new Response("Unauthenticated", { status: 401 });
    }

    let body: RequestBody;
    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (!body.messages || body.messages.length === 0) {
      return new Response("Missing messages", { status: 400 });
    }

    // One DO per (agent, user). Lookup by deterministic name so the
    // same user always routes to the same instance — that's how
    // chat history persists.
    const id = env.AGENT_BASAL_DO.idFromName(`basal:${actor.email}`);
    const stub = env.AGENT_BASAL_DO.get(id);

    // Forward the InvokeRequest to the DO's RPC method. The Cloudflare
    // Agents SDK's `Agent` base class supports this via the standard
    // DO `fetch` machinery — we send the InvokeRequest as JSON in the
    // request body and the DO's `invoke()` method runs the flow.
    const invokeReq: InvokeRequest = {
      identity: actor,
      agent: "basal",
      messages: body.messages,
      ...(body.systemPrompt ? { systemPrompt: body.systemPrompt } : {}),
      ...(body.workflowRunId ? { workflowRunId: body.workflowRunId } : {}),
    };

    return stub.fetch(
      new Request("https://do.invoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(invokeReq),
      }),
    );
  },
};
