/**
 * POST /api/keg/vote — cast / change / clear the caller's vote on an item.
 * Body: { itemId: string, value: 1 | -1 | 0 }  (0 removes the vote).
 * One vote per person per item (UNIQUE(item_id, voter_email)).
 */
import {
  type KegEnv,
  json,
  err,
  requireDb,
  getCallerEmail,
  ITEM_ID_RE,
} from "./_shared";

interface VoteBody {
  itemId?: string;
  value?: number;
}

export const onRequestPost: PagesFunction<KegEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const email = getCallerEmail(ctx.request);
  if (!email) return err("unauthenticated", 401);

  let b: VoteBody;
  try {
    b = (await ctx.request.json()) as VoteBody;
  } catch {
    return err("invalid JSON body");
  }

  const itemId = (b.itemId ?? "").trim();
  if (!ITEM_ID_RE.test(itemId)) return err("invalid 'itemId'");
  if (b.value !== 1 && b.value !== -1 && b.value !== 0) {
    return err("'value' must be 1, -1, or 0");
  }

  if (b.value === 0) {
    await db
      .prepare("DELETE FROM keg_votes WHERE item_id = ? AND voter_email = ?")
      .bind(itemId, email)
      .run();
    return json({ ok: true, value: 0 });
  }

  await db
    .prepare(
      `INSERT INTO keg_votes (id, item_id, voter_email, value, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(item_id, voter_email)
       DO UPDATE SET value = excluded.value, created_at = excluded.created_at`,
    )
    .bind(crypto.randomUUID(), itemId, email, b.value, Date.now())
    .run();

  return json({ ok: true, value: b.value });
};
