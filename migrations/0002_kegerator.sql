-- Kegerator reorder tool — vote store (D1, same `DB` binding as comments).
-- Apply:  wrangler d1 migrations apply luna-ux-review --local   (and --remote)

CREATE TABLE IF NOT EXISTS keg_votes (
  id          TEXT PRIMARY KEY,
  item_id     TEXT NOT NULL,          -- catalog id from src/lib/kegjoy.ts
  voter_email TEXT NOT NULL,          -- verified CF Access email
  value       INTEGER NOT NULL,       -- +1 (up) or -1 (down)
  created_at  INTEGER NOT NULL,       -- epoch ms
  UNIQUE(item_id, voter_email)        -- one vote per person per item
);

CREATE INDEX IF NOT EXISTS idx_keg_item ON keg_votes (item_id);
