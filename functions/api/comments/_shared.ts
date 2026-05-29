/**
 * Shared types + helpers for the UX Review comments API (D1-backed).
 *
 * Identity is free: the caller's verified email comes from the CF Access
 * header (the whole site is gated by Access). Display name is supplied by
 * the client (one-time prompt, stored client-side) and reconciled to the
 * verified email server-side — we trust the email, not the name.
 */
import { getCallerEmail } from "../_lib";

export interface CommentsEnv {
  DB?: D1Database;
}

/** A row as stored in D1. */
export interface CommentRow {
  id: string;
  screen_id: string;
  author_name: string;
  author_email: string;
  body: string;
  anchor_x: number | null;
  anchor_y: number | null;
  parent_id: string | null;
  resolved: number;
  resolved_at: number | null;
  design_version: string | null;
  created_at: number;
}

/** The camelCase shape returned to the browser. */
export interface CommentDTO {
  id: string;
  screenId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  anchorX: number | null;
  anchorY: number | null;
  parentId: string | null;
  resolved: boolean;
  resolvedAt: number | null;
  designVersion: string | null;
  createdAt: number;
}

export function toDTO(r: CommentRow): CommentDTO {
  return {
    id: r.id,
    screenId: r.screen_id,
    authorName: r.author_name,
    authorEmail: r.author_email,
    body: r.body,
    anchorX: r.anchor_x,
    anchorY: r.anchor_y,
    parentId: r.parent_id,
    resolved: r.resolved === 1,
    resolvedAt: r.resolved_at,
    designVersion: r.design_version,
    createdAt: r.created_at,
  };
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

/** 503 when the D1 binding isn't wired (e.g. plain `astro dev`, or pre-setup). */
export function requireDb(env: CommentsEnv): D1Database | Response {
  if (!env.DB) {
    return err(
      "Comments store not configured: bind a D1 database named `DB` (see docs/ux-review-setup.md).",
      503,
    );
  }
  return env.DB;
}

export { getCallerEmail };

/** Reasonable guards so a single bad request can't bloat the store. */
export const LIMITS = {
  body: 4000,
  name: 120,
  screenId: 200,
};
