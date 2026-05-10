/**
 * Kill-switch reader. Hot path: agent-router and per-agent Workers call
 * `isKilled(env, agentSlug)` on every invocation. Defense in depth — if
 * a bug at the router lets a request through, the per-agent Worker
 * checks again before hitting the model.
 *
 * Storage:
 *   - KV (KILL_SWITCH namespace) — keyed by agent slug; value is "1" or "0".
 *     Read on every invocation. Cache TTL via Workers' built-in KV cache.
 *   - D1 (kill_switches table) — durable record + history. Written by the
 *     admin Worker (config-api) when an AI admin flips the switch; the
 *     same write also updates KV.
 *
 * Failure mode: if the KV read errors, we fail OPEN (assume not killed)
 * for `live` agents, and fail CLOSED (assume killed) for any agent
 * tagged piiScope=phi. PHI agents are too sensitive to keep running on
 * a stale read of an unreachable KV.
 */

export interface KillSwitchEnv {
  /** KV namespace storing per-agent kill flags. */
  KILL_SWITCH: KVNamespace;
}

export interface KillSwitchOptions {
  /** Whether the agent is PHI-scoped. Drives fail-closed behavior on KV errors. */
  isPhi: boolean;
  /**
   * KV cache TTL in seconds. 60 is a reasonable default — fast reads at
   * scale, with at-most-60s lag between an admin flipping the switch and
   * the next invocation honoring it. AI Gateway also enforces caps that
   * provide a second line of defense.
   */
  cacheTtlSeconds?: number;
}

export async function isKilled(
  env: KillSwitchEnv,
  agentSlug: string,
  options: KillSwitchOptions,
): Promise<boolean> {
  const ttl = options.cacheTtlSeconds ?? 60;
  try {
    const value = await env.KILL_SWITCH.get(agentSlug, { cacheTtl: ttl });
    return value === "1";
  } catch {
    // KV unreachable. Fail closed for PHI; fail open for everything else.
    return options.isPhi;
  }
}

/** Admin path: flip the kill flag in KV. Caller is also expected to write a D1 history row via the audit log. */
export async function setKilled(
  env: KillSwitchEnv,
  agentSlug: string,
  killed: boolean,
): Promise<void> {
  await env.KILL_SWITCH.put(agentSlug, killed ? "1" : "0");
}
