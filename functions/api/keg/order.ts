/**
 * POST /api/keg/order — admin-only. Clears all votes for the next round.
 *
 * The reorder email itself is built and opened client-side (a mailto draft
 * the admin can edit before sending); this endpoint just resets the queue
 * once the order has been placed. Gated to the AI-admin allowlist.
 */
import { type KegEnv, json, err, requireDb, getCallerEmail, isCallerAdmin } from "./_shared";

export const onRequestPost: PagesFunction<KegEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const email = getCallerEmail(ctx.request);
  if (!email) return err("unauthenticated", 401);
  if (!isCallerAdmin(email)) return err("not authorized to place orders", 403);

  const result = await db.prepare("DELETE FROM keg_votes").run();
  return json({ ok: true, cleared: result.meta.changes ?? 0 });
};
