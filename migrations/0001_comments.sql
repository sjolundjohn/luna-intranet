-- UX Review comments store (D1).
-- Apply locally:  wrangler d1 migrations apply luna-ux-review --local
-- Apply remote:   wrangler d1 migrations apply luna-ux-review --remote

CREATE TABLE IF NOT EXISTS comments (
  id            TEXT PRIMARY KEY,
  screen_id     TEXT NOT NULL,
  author_name   TEXT NOT NULL,
  author_email  TEXT NOT NULL,
  body          TEXT NOT NULL,
  anchor_x      REAL,             -- 0..1 fraction of frame width; null = general
  anchor_y      REAL,             -- 0..1 fraction of frame height; null = general
  parent_id     TEXT,             -- one level of threading
  resolved      INTEGER NOT NULL DEFAULT 0,
  resolved_at   INTEGER,          -- epoch ms when last resolved; powers the "resolved" notification
  design_version TEXT,
  created_at    INTEGER NOT NULL  -- epoch ms
);

CREATE INDEX IF NOT EXISTS idx_comments_screen   ON comments (screen_id);
CREATE INDEX IF NOT EXISTS idx_comments_open      ON comments (resolved, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent    ON comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_recent    ON comments (created_at);
CREATE INDEX IF NOT EXISTS idx_comments_resolved  ON comments (resolved_at);
