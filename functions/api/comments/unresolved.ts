/**
 * GET /api/comments/unresolved  — the dashboard feed.
 *
 * Returns every open (unresolved) top-level comment across all screens,
 * newest first, with a reply count per thread. Powers /ux-review/review.
 */
import {
  type CommentsEnv,
  type CommentRow,
  toDTO,
  json,
  requireDb,
} from "./_shared";

export const onRequestGet: PagesFunction<CommentsEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  // Open top-level threads, newest first.
  const { results } = await db
    .prepare(
      `SELECT * FROM comments
        WHERE resolved = 0 AND parent_id IS NULL
        ORDER BY created_at DESC`,
    )
    .all<CommentRow>();

  const threads = results ?? [];

  // Reply counts per open thread (single grouped query).
  const replyCounts = new Map<string, number>();
  if (threads.length) {
    const { results: counts } = await db
      .prepare(
        `SELECT parent_id AS pid, COUNT(*) AS n
           FROM comments
          WHERE parent_id IS NOT NULL
          GROUP BY parent_id`,
      )
      .all<{ pid: string; n: number }>();
    for (const c of counts ?? []) replyCounts.set(c.pid, c.n);
  }

  // Per-screen open counts (so the grid can badge counts in one fetch too).
  const { results: perScreen } = await db
    .prepare(
      `SELECT screen_id AS sid, COUNT(*) AS n
         FROM comments
        WHERE resolved = 0
        GROUP BY screen_id`,
    )
    .all<{ sid: string; n: number }>();

  const counts: Record<string, number> = {};
  for (const r of perScreen ?? []) counts[r.sid] = r.n;

  return json({
    threads: threads.map((t) => ({ ...toDTO(t), replyCount: replyCounts.get(t.id) ?? 0 })),
    countsByScreen: counts,
  });
};
