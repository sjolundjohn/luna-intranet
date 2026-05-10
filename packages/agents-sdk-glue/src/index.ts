/**
 * Luna Agent base class — thin subclass of the Cloudflare Agents SDK
 * `Agent` class. Every per-agent Worker (apps/agent-basal, agent-data,
 * agent-personal) extends this so audit, kill-switch checks, identity
 * extraction, AI Gateway routing, and per-user state live in one place.
 *
 * Why this layer exists at all:
 *   - The Cloudflare Agents SDK gives you a Durable Object with
 *     onConnect/onMessage/onRequest hooks and a state container. It does
 *     not opine on auth, audit, kill-switches, or LLM routing.
 *   - Luna's invariants — every invocation audit-logged, every model call
 *     gated by the kill-switch, every model call going through AI
 *     Gateway, never through Anthropic directly — must apply to every
 *     agent uniformly. The right way to enforce that is in the base.
 *
 * Subclasses implement `getSystemPrompt()` and (optionally) `onMessage`,
 * inheriting auth, audit, and kill-switch logic for free.
 *
 * Notes for the runtime:
 *   - The `agents` SDK's `Agent` is a Durable Object. We wrap one DO per
 *     (agent, user) pair — keying is done at the agent-router via
 *     `idFromName(\`${agentSlug}:${userEmail}\`)`.
 *   - The DO's SQLite-backed state container persists chat history
 *     across reconnects.
 *   - LLM calls in this base class go through `env.AI_GATEWAY` (a
 *     binding to Cloudflare AI Gateway), not direct Anthropic. That's
 *     where caching, observability, and per-agent budget caps live.
 */
import { Agent } from "agents";
import {
  type ActorIdentity,
  type AgentSlug,
  type InvokeRequest,
  type InvokeMetadata,
  type AuditLogRow,
} from "@luna/shared";
import { writeAudit, sha256Hex, nowUtcIso } from "@luna/shared/audit";
import { isKilled } from "@luna/shared/killswitch";

/**
 * Bindings every Luna agent Worker is expected to declare. Subclass
 * Workers can extend this with their own (e.g. agent-basal might add a
 * Vectorize index for memory).
 */
export interface LunaAgentEnv {
  /** D1 database — audit log, chat thread index, configs. */
  D1: D1Database;
  /** KV namespace holding per-agent kill flags. */
  KILL_SWITCH: KVNamespace;
  /** AI Gateway binding — single egress for all model calls. */
  AI_GATEWAY: { fetch: typeof fetch };
  /** Anthropic API key. Held only by AI Gateway in production; this
   *  binding is a fallback for local dev. */
  ANTHROPIC_API_KEY?: string;
  /** Default model id; subclass can override per-agent. */
  MODEL?: string;
}

/** Each per-(agent, user) DO holds chat thread + memory pointer. */
export interface AgentState {
  /** Stable agent slug; redundant with the binding name but useful in logs. */
  agentSlug: AgentSlug;
  /** User this DO belongs to. */
  userEmail: string;
  /** Last activity ts — used for thread retention sweeps. */
  lastActiveAt: string;
  /** Optional pointer into Vectorize for this user's memory namespace. */
  memoryNamespace?: string;
}

/**
 * Subclass contract. Concrete agents implement just two things:
 *   1. `agentSlug` (static identifier matching the MDX file)
 *   2. `getSystemPrompt(userInstructions?)` — returns the system prompt
 *      to send to the model, optionally appended with the user's custom
 *      instructions (capped at 1,000 chars at the config layer).
 */
export abstract class LunaAgent<
  Env extends LunaAgentEnv = LunaAgentEnv,
> extends Agent<Env, AgentState> {
  abstract readonly agentSlug: AgentSlug;
  abstract readonly piiScope: "none" | "employee" | "phi";

  /**
   * Concrete subclasses return the system prompt for the model. If
   * `userInstructions` is provided, the subclass decides how to append
   * — typically: "<base prompt>\n\nThe user has asked you to: <userInstructions>".
   */
  abstract getSystemPrompt(userInstructions?: string): string;

  /**
   * Default model id. Subclasses may override (e.g. a cheap-fast agent
   * might choose haiku). Default reads `env.MODEL` then falls back.
   */
  protected getModel(): string {
    return this.env.MODEL ?? "claude-opus-4-7";
  }

  /**
   * Durable Object fetch handler. Per-agent Workers (apps/agent-<name>/)
   * dispatch to a DO instance via `stub.fetch(...)`; that lands here.
   * We deserialize the InvokeRequest from the body and call `invoke()`.
   *
   * This is the seam that lets us treat the DO as an RPC target without
   * inventing a JSON-RPC framing — the body IS the InvokeRequest.
   */
  override async onRequest(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    let req: InvokeRequest;
    try {
      req = (await request.json()) as InvokeRequest;
    } catch {
      return new Response("Invalid InvokeRequest", { status: 400 });
    }
    return this.invoke(req);
  }

  /**
   * Single-call invocation entrypoint used by the agent-router. Returns
   * a streaming Response (SSE) that the router pipes to the browser.
   *
   * The flow:
   *   1. Check kill-switch (fail-closed for PHI agents on KV errors).
   *   2. Compute prompt hash for the audit row.
   *   3. Call AI Gateway with `stream: true`.
   *   4. Tee the stream — one path back to the caller, one path
   *      collecting tokens for the post-stream audit write.
   *   5. After the stream completes, write the audit row to D1.
   */
  async invoke(req: InvokeRequest): Promise<Response> {
    // (1) Kill-switch.
    const killed = await isKilled(this.env, this.agentSlug, {
      isPhi: this.piiScope === "phi",
    });
    if (killed) {
      return new Response(
        `Agent "${this.agentSlug}" is currently paused by an admin.`,
        { status: 503, headers: { "content-type": "text/plain" } },
      );
    }

    // (2) System prompt + canonical hash for audit.
    const system = this.getSystemPrompt(req.systemPrompt);
    const promptCanonical = JSON.stringify({
      system,
      messages: req.messages,
    });
    const promptHash = await sha256Hex(promptCanonical);

    // (3) Model call via AI Gateway. The binding's `fetch` already
    // attaches the API key and routes to Anthropic; subclass Workers
    // bind `AI_GATEWAY` to Cloudflare AI Gateway in production.
    const upstream = await this.env.AI_GATEWAY.fetch(
      "https://gateway.ai.cloudflare.com/v1/anthropic/v1/messages",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-luna-agent": this.agentSlug,
          "x-luna-user": req.identity.email,
        },
        body: JSON.stringify({
          model: this.getModel(),
          max_tokens: 2048,
          stream: true,
          system,
          messages: req.messages,
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      // Audit the failure as well — non-2xx is data we want for ops.
      await this.recordAudit({
        promptHash,
        responseHash: "",
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        identity: req.identity,
        ...(req.workflowRunId ? { workflowRunId: req.workflowRunId } : {}),
      });
      return new Response(
        `Upstream error ${upstream.status}`,
        { status: 502, headers: { "content-type": "text/plain" } },
      );
    }

    // (4) Tee the stream so we can collect tokens for the audit row
    // without buffering the entire response. The caller-facing branch
    // is returned immediately; the audit branch is consumed in the
    // background via ctx.waitUntil through the DO's ctx.
    const [forCaller, forAudit] = upstream.body.tee();

    // Background: consume the audit branch, hash its concatenated
    // bytes, write the audit row.
    this.ctx.waitUntil(
      (async () => {
        const reader = forAudit.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            total += value.byteLength;
          }
        }
        const merged = new Uint8Array(total);
        let offset = 0;
        for (const c of chunks) {
          merged.set(c, offset);
          offset += c.byteLength;
        }
        const responseHash = await sha256Hex(new TextDecoder().decode(merged));
        // Token counts and cost come from the streamed `usage` events
        // emitted by Anthropic. Phase 0 stores zeros; the parser is
        // a small follow-on (one of the Phase 2 tasks on /roadmap).
        await this.recordAudit({
          promptHash,
          responseHash,
          tokensIn: 0,
          tokensOut: 0,
          costUsd: 0,
          identity: req.identity,
          ...(req.workflowRunId ? { workflowRunId: req.workflowRunId } : {}),
        });
      })(),
    );

    // Update DO state — last-active stamp.
    void this.setState({
      ...this.state,
      lastActiveAt: nowUtcIso(),
      userEmail: req.identity.email,
      agentSlug: this.agentSlug,
    });

    // (5) Stream straight back to the caller.
    return new Response(forCaller, {
      status: 200,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "text/event-stream",
        "cache-control": "no-store",
        "x-accel-buffering": "no",
      },
    });
  }

  /** Helper — write one audit row through @luna/shared. */
  private async recordAudit(opts: {
    promptHash: string;
    responseHash: string;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    identity: ActorIdentity;
    workflowRunId?: string;
  }): Promise<void> {
    const row: AuditLogRow = {
      user_email: opts.identity.email,
      agent_slug: this.agentSlug,
      model: this.getModel(),
      prompt_hash: opts.promptHash,
      response_hash: opts.responseHash,
      tokens_in: opts.tokensIn,
      tokens_out: opts.tokensOut,
      cost_usd: opts.costUsd,
      ts: nowUtcIso(),
      ...(opts.workflowRunId ? { workflow_run_id: opts.workflowRunId } : {}),
    };
    try {
      await writeAudit(this.env, row);
    } catch (e) {
      // Audit failures are visible in observability but never block the
      // user's response. Phase 3 wires a backstop ingestion queue.
      console.error("audit write failed", e);
    }
  }
}

/** Returns the metadata used in non-streaming summaries. */
export function summaryFromInvoke(
  agentSlug: AgentSlug,
  model: string,
  killed: boolean,
): InvokeMetadata {
  return {
    agent: agentSlug,
    model,
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    ...(killed ? { killed: true } : {}),
  };
}
