/**
 * GET /api/keg/votes — current standings + the caller's own votes.
 * Returns { scores: { [itemId]: { score, up, down } }, mine: { [itemId]: value } }.
 */
import { type KegEnv, json, requireDb, getCallerEmail } from "./_shared";

export const onRequestGet: PagesFunction<KegEnv> = async (ctx) => {
  const db = requireDb(ctx.env);
  if (db instanceof Response) return db;

  const email = getCallerEmail(ctx.request);

  const { results: agg } = await db
    .prepare(
      `SELECT item_id AS itemId,
              SUM(value) AS score,
              SUM(CASE WHEN value > 0 THEN 1 ELSE 0 END) AS up,
              SUM(CASE WHEN value < 0 THEN 1 ELSE 0 END) AS down
         FROM keg_votes
        GROUP BY item_id`,
    )
    .all<{ itemId: string; score: number; up: number; down: number }>();

  const scores: Record<string, { score: number; up: number; down: number }> = {};
  for (const r of agg ?? []) scores[r.itemId] = { score: r.score, up: r.up, down: r.down };

  const mine: Record<string, number> = {};
  if (email) {
    const { results } = await db
      .prepare("SELECT item_id AS itemId, value FROM keg_votes WHERE voter_email = ?")
      .bind(email)
      .all<{ itemId: string; value: number }>();
    for (const r of results ?? []) mine[r.itemId] = r.value;
  }

  return json({ scores, mine });
};
