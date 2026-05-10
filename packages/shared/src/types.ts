/**
 * Shared TypeScript types for the Luna AI workplace platform.
 *
 * Source of truth for: roles, agent identity, audit-log shape, kill-switch
 * record, cost-cap record, chat thread headers, and the JSON wire format
 * between Workers (RPC payloads).
 *
 * Kept dependency-free on purpose — every app/* Worker imports this, and
 * a transitive dep cycle would break Wrangler's bundling.
 */

/**
 * Cloudflare Access JWT-derived role. Default-deny: anything not explicitly
 * listed in an agent's permissions array gets a 403 at the router.
 */
export type Role = "employee" | "manager" | "ai-admin" | "phi-authorized";

/** Identity extracted from CF Access claims at the edge. */
export interface ActorIdentity {
  /** Lowercased email from `cf-access-authenticated-user-email`. */
  email: string;
  /** Group memberships from the `cf-access-groups` claim. Empty in local dev. */
  groups: readonly Role[];
  /** Whether the request actually carried a verified CF Access JWT. */
  verified: boolean;
}

/** Stable agent identifier — matches `src/content/agents/*.mdx` ids. */
export type AgentSlug = string;

/** Per-agent permission matrix mirrored from the MDX frontmatter. */
export interface AgentPermissions {
  invoke: readonly Role[];
  configure: readonly Role[];
  viewLogs: readonly Role[];
}

/** PHI scope of an agent. PHI agents are gated to phi-authorized only. */
export type PiiScope = "none" | "employee" | "phi";

/** Class A = 1:many shared. Class B = 1:1 personal. */
export type AgentClass = "A" | "B";

/**
 * One row of the audit log. Stored in D1; never includes prompt or
 * response content. Hashes are present so we can prove a specific
 * payload was processed without storing its bytes.
 */
export interface AuditLogRow {
  /** Caller identity (email, lowercased). */
  user_email: string;
  /** Agent slug invoked. */
  agent_slug: AgentSlug;
  /** Concrete model id used downstream of AI Gateway. */
  model: string;
  /** Hex SHA-256 of the canonicalized prompt; never the prompt itself. */
  prompt_hash: string;
  /** Hex SHA-256 of the response body; never the response itself. */
  response_hash: string;
  /** Total tokens billed. */
  tokens_in: number;
  tokens_out: number;
  /** Cost in USD as billed by the model provider. */
  cost_usd: number;
  /** ISO-8601 UTC. */
  ts: string;
  /** Optional workflow run id this invocation belongs to. */
  workflow_run_id?: string;
}

/**
 * Per-agent kill-switch record. Lives in KV (hot reads at the router) and
 * D1 (durable record + history). The `set_by` field is the AI admin who
 * flipped the switch; populated for after-the-fact attribution.
 */
export interface KillSwitchRecord {
  agent_slug: AgentSlug;
  killed: boolean;
  set_by: string;
  set_at: string;
  /** Optional reason — short, written down so the audit story is honest. */
  reason?: string;
}

/** Per-agent and per-user budget cap. Read at AI Gateway and the router. */
export interface CostCap {
  scope: "agent" | "user";
  /** Either an agent slug or a user email, depending on scope. */
  key: string;
  daily_usd?: number;
  monthly_usd?: number;
}

/** RPC payload sent from agent-router to a per-agent Worker. */
export interface InvokeRequest {
  identity: ActorIdentity;
  agent: AgentSlug;
  /** OpenAI-style messages array; we use Anthropic but the wire shape is the same. */
  messages: readonly { role: "user" | "assistant"; content: string }[];
  /** Optional system-prompt override (e.g. user's custom instructions). */
  systemPrompt?: string;
  /** Optional workflow run id, if invoked inside a Cloudflare Workflow step. */
  workflowRunId?: string;
}

/** Response shape returned by every per-agent Worker. SSE bodies are tunneled separately. */
export interface InvokeMetadata {
  agent: AgentSlug;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  /** When in_progress: kill-switch tripped; useful client-side display. */
  killed?: boolean;
}
