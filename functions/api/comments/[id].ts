/**
 * PATCH /api/comments/:id  — resolve / unresolve a comment.
 *
 * Comments are never deleted; resolving collapses the thread into the
 * "Resolved" group in the UI. Body: { resolved: boolean }.
 *
 * Note: CF Pages routes static segments before dynamic params, so the
 * sibling `unresolved.ts` (GET /api/comments/unresolved) is never shadowed
 * by this `:id` handler.
 */
import {
  type CommentsEnv,
  type CommentRow,
  toDTO,
  json,
  err,
  requireDb,
  getCallerEmail,
} from "./_shared";

export const onRequestPatch: PagesFunction<CommentsEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const email = getCallerEmail(ctx.request);
  if (!email) return err("unauthenticated", 401);

  const id = ctx.params.id as string;
  if (!id) return err("missing comment id");

  let b: { resolved?: boolean };
  try {
    b = (await ctx.request.json()) as { resolved?: boolean };
  } catch {
    return err("invalid JSON body");
  }
  if (typeof b.resolved !== "boolean") return err("'resolved' boolean required");

  const resolved = b.resolved ? 1 : 0;
  const resolvedAt = b.resolved ? Date.now() : null;
  const result = await db
    .prepare("UPDATE comments SET resolved = ?, resolved_at = ? WHERE id = ?")
    .bind(resolved, resolvedAt, id)
    .run();

  if (!result.meta.changes) return err("comment not found", 404);

  const row = await db.prepare("SELECT * FROM comments WHERE id = ?").bind(id).first<CommentRow>();
  return json({ comment: row ? toDTO(row) : null });
};
