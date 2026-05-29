/**
 * GET /api/notifications  — recent activity feed for the bell in the nav.
 *
 * Sourced entirely from the comments store. Returns the most recent events
 * (new comments + resolutions) across all screens, newest first. The client
 * computes @mentions (it knows the viewer's display name + email), filters
 * out the viewer's own actions, and tracks "seen" state in localStorage
 * keyed on the CF Access email. Keep it simple: the client polls this on load.
 */
import {
  type CommentsEnv,
  type CommentRow,
  json,
  requireDb,
} from "./comments/_shared";

interface NotificationEvent {
  kind: "comment" | "reply" | "resolved";
  commentId: string;
  screenId: string;
  authorName: string;
  authorEmail: string;
  snippet: string;
  at: number;
}

const LIMIT = 60;

function snippet(body: string): string {
  const s = body.trim().replace(/\s+/g, " ");
  return s.length > 140 ? s.slice(0, 139) + "…" : s;
}

export const onRequestGet: PagesFunction<CommentsEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  // Recent comments (new + replies).
  const { results: recent } = await db
    .prepare("SELECT * FROM comments ORDER BY created_at DESC LIMIT ?")
    .bind(LIMIT)
    .all<CommentRow>();

  // Recent resolutions.
  const { results: resolved } = await db
    .prepare(
      "SELECT * FROM comments WHERE resolved = 1 AND resolved_at IS NOT NULL ORDER BY resolved_at DESC LIMIT ?",
    )
    .bind(LIMIT)
    .all<CommentRow>();

  const events: NotificationEvent[] = [];

  for (const r of recent ?? []) {
    events.push({
      kind: r.parent_id ? "reply" : "comment",
      commentId: r.id,
      screenId: r.screen_id,
      authorName: r.author_name,
      authorEmail: r.author_email,
      snippet: snippet(r.body),
      at: r.created_at,
    });
  }
  for (const r of resolved ?? []) {
    events.push({
      kind: "resolved",
      commentId: r.id,
      screenId: r.screen_id,
      authorName: r.author_name,
      authorEmail: r.author_email,
      snippet: snippet(r.body),
      at: r.resolved_at as number,
    });
  }

  events.sort((a, b) => b.at - a.at);
  return json({ events: events.slice(0, LIMIT) });
};
