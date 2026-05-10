/**
 * Audit log writer. Every Worker that invokes a model — directly or via a
 * Workflow step — writes one row per invocation through `writeAudit(env, row)`.
 *
 * Wire path:
 *   Worker → D1 prepared statement (single insert, idempotent on a
 *   `(user_email, agent_slug, ts, prompt_hash)` natural key).
 *
 * The table lives in `migrations/0001_init.sql`. Schema is owned there;
 * this module is just the typed insert.
 *
 * Hashing: `sha256Hex` is exported so callers can compute the hash from
 * whatever they already have at hand (the prompt string, the streamed
 * response body) without re-canonicalizing in two places. All hashes
 * are hex SHA-256 of UTF-8 bytes.
 */
import type { AuditLogRow } from "./types.ts";

export interface AuditEnv {
  /** D1 binding — declare in every Worker that calls writeAudit. */
  D1: D1Database;
}

export async function writeAudit(env: AuditEnv, row: AuditLogRow): Promise<void> {
  // Single-statement insert. ON CONFLICT DO NOTHING makes retries safe —
  // a Worker that retries an LLM call doesn't double-count the audit row.
  const stmt = env.D1.prepare(
    `INSERT INTO audit_log
       (user_email, agent_slug, model, prompt_hash, response_hash,
        tokens_in, tokens_out, cost_usd, ts, workflow_run_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_email, agent_slug, ts, prompt_hash) DO NOTHING`,
  );
  await stmt
    .bind(
      row.user_email,
      row.agent_slug,
      row.model,
      row.prompt_hash,
      row.response_hash,
      row.tokens_in,
      row.tokens_out,
      row.cost_usd,
      row.ts,
      row.workflow_run_id ?? null,
    )
    .run();
}

/**
 * Compute hex-encoded SHA-256 of a string. Uses Web Crypto, available in
 * every Workers runtime. Pure function; safe to call from anywhere.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** ISO-8601 UTC timestamp with millisecond precision. */
export function nowUtcIso(): string {
  return new Date().toISOString();
}
