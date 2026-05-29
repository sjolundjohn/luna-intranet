/**
 * Shared helpers for the Kegerator vote API (D1-backed, same `DB` binding as
 * the comments store). Identity comes from CF Access (server-verified email).
 */
import { getCallerEmail, isCallerAdmin } from "../_lib";

export interface KegEnv {
  DB?: D1Database;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

/** 503 when D1 isn't bound (plain `astro dev`, or pre-setup). */
export function requireDb(env: KegEnv): D1Database | Response {
  if (!env.DB) {
    return err(
      "Kegerator store not configured: bind a D1 database named `DB` (see docs/ux-review-setup.md).",
      503,
    );
  }
  return env.DB;
}

/** Catalog ids are kebab-case slugs; guard against junk writes. */
export const ITEM_ID_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;

export { getCallerEmail, isCallerAdmin };
