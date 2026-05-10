-- Luna AI Workplace — initial D1 schema.
--
-- This migration is reviewed but NOT applied as part of Phase 0. John
-- runs `wrangler d1 migrations apply luna-platform --remote` after
-- reviewing in the morning. There is no destructive change here — only
-- CREATE TABLE statements with `IF NOT EXISTS` so re-running is safe.
--
-- Conventions:
--   - Timestamps stored as ISO-8601 UTC strings (TEXT).
--   - User identity is the email string (lowercased) — same key as
--     CF Access uses, so no extra mapping table.
--   - JSON columns store small typed shapes (permission arrays). We
--     parse with JSON.parse server-side; D1 doesn't have a JSON type
--     but TEXT works fine for our scale.
--   - Every multi-column index has a justification comment.

-- ---------------------------------------------------------------------
-- agents — cache of MDX frontmatter at deploy time. The MDX files in
-- src/content/agents/ are the source of truth; a build hook writes
-- one row per agent into this table so Workers can read permissions
-- without round-tripping the MDX.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  slug                   TEXT PRIMARY KEY,
  name                   TEXT NOT NULL,
  status                 TEXT NOT NULL CHECK (status IN ('live','coming-soon','by-request')),
  agent_class            TEXT NOT NULL CHECK (agent_class IN ('A','B')),
  pii_scope              TEXT NOT NULL CHECK (pii_scope IN ('none','employee','phi')) DEFAULT 'none',
  permissions_invoke     TEXT NOT NULL,   -- JSON array of role strings
  permissions_configure  TEXT NOT NULL,
  permissions_view_logs  TEXT NOT NULL,
  owner_email            TEXT,
  updated_at             TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- users — every Lunite who has interacted with the platform. Populated
-- on first contact by config-api / agent-router. No durable PII beyond
-- the email + group cache.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  email           TEXT PRIMARY KEY,
  groups          TEXT NOT NULL DEFAULT '[]', -- JSON array of role strings
  first_seen_at   TEXT NOT NULL,
  last_seen_at    TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- user_agent_config — per-(user, agent) toggles. Phase 2 owns the
-- writes via config-api.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_agent_config (
  user_email           TEXT NOT NULL,
  agent_slug           TEXT NOT NULL,
  enabled              INTEGER NOT NULL DEFAULT 1,
  memory_enabled       INTEGER NOT NULL DEFAULT 1,
  custom_instructions  TEXT NOT NULL DEFAULT '',
  notify_slack         INTEGER NOT NULL DEFAULT 1,
  notify_email         INTEGER NOT NULL DEFAULT 0,
  updated_at           TEXT NOT NULL,
  PRIMARY KEY (user_email, agent_slug),
  FOREIGN KEY (user_email) REFERENCES users(email),
  FOREIGN KEY (agent_slug) REFERENCES agents(slug)
);

-- ---------------------------------------------------------------------
-- audit_log — every model invocation, every config write, every
-- kill-switch flip. Metadata only — no prompt or response bodies.
--
-- Natural-key uniqueness (user, agent, ts, prompt_hash) means an
-- idempotent retry doesn't double-count.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  user_email      TEXT NOT NULL,
  agent_slug      TEXT NOT NULL,
  model           TEXT NOT NULL,
  prompt_hash     TEXT NOT NULL,
  response_hash   TEXT NOT NULL DEFAULT '',
  tokens_in       INTEGER NOT NULL DEFAULT 0,
  tokens_out      INTEGER NOT NULL DEFAULT 0,
  cost_usd        REAL    NOT NULL DEFAULT 0,
  ts              TEXT    NOT NULL,
  workflow_run_id TEXT,
  PRIMARY KEY (user_email, agent_slug, ts, prompt_hash)
);

-- Hot-path index: /agents/me reads "my last 30 days" filtered by
-- user_email + ts DESC.
CREATE INDEX IF NOT EXISTS idx_audit_user_ts ON audit_log(user_email, ts DESC);

-- Aggregate-path index: /fleet GROUP BY agent + day.
CREATE INDEX IF NOT EXISTS idx_audit_agent_ts ON audit_log(agent_slug, ts DESC);

-- ---------------------------------------------------------------------
-- kill_switches — durable record + history of every flip. KV holds
-- the hot read; this table holds the audit trail for governance.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kill_switches (
  agent_slug   TEXT NOT NULL,
  killed       INTEGER NOT NULL,
  set_by       TEXT NOT NULL,
  set_at       TEXT NOT NULL,
  reason       TEXT,
  PRIMARY KEY (agent_slug, set_at)
);

CREATE INDEX IF NOT EXISTS idx_killswitch_agent_set_at
  ON kill_switches(agent_slug, set_at DESC);

-- ---------------------------------------------------------------------
-- cost_caps — per-agent and per-user budget envelopes. AI Gateway
-- enforces these; this table is the source of truth Workers read at
-- request time and admins edit via the dashboard.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cost_caps (
  scope        TEXT NOT NULL CHECK (scope IN ('agent','user')),
  scope_key    TEXT NOT NULL,           -- agent slug or user email
  daily_usd    REAL,
  monthly_usd  REAL,
  updated_at   TEXT NOT NULL,
  PRIMARY KEY (scope, scope_key)
);

-- ---------------------------------------------------------------------
-- workflows — current authoritative version of each workflow.
-- workflow_versions holds the immutable history; promotions update the
-- pointer here.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflows (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  summary        TEXT NOT NULL,
  trigger        TEXT NOT NULL CHECK (trigger IN ('manual','scheduled','event')),
  schedule       TEXT,
  status         TEXT NOT NULL CHECK (status IN ('active','paused','drafting')) DEFAULT 'drafting',
  owner_email    TEXT,
  current_version_id TEXT,             -- FK to workflow_versions(id), set after first version lands
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_versions (
  id              TEXT PRIMARY KEY,
  workflow_id     TEXT NOT NULL,
  version         TEXT NOT NULL,        -- "v1", "v2", semantic strings ok
  definition_json TEXT NOT NULL,         -- step list serialized
  created_by      TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow_created
  ON workflow_versions(workflow_id, created_at DESC);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id              TEXT PRIMARY KEY,
  workflow_id     TEXT NOT NULL,
  version_id      TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('queued','running','success','failed','cancelled')),
  triggered_by    TEXT NOT NULL,         -- "cron", "manual:<email>", or "event:<source>"
  started_at      TEXT NOT NULL,
  finished_at     TEXT,
  duration_ms     INTEGER,
  cost_usd        REAL DEFAULT 0,
  error           TEXT,
  output_ref      TEXT,                  -- R2 key or D1 ref where the output landed
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (version_id) REFERENCES workflow_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_started
  ON workflow_runs(workflow_id, started_at DESC);

-- ---------------------------------------------------------------------
-- chat_threads — index of per-user threads. Authoritative thread state
-- lives in the per-(agent, user) Durable Object's SQLite store; this
-- table is just the index used to populate the sidebar on /chat.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_threads (
  id             TEXT PRIMARY KEY,
  user_email     TEXT NOT NULL,
  agent_slug     TEXT NOT NULL,
  title          TEXT NOT NULL,         -- agent-generated 1-line summary
  message_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL,
  last_message_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_recent
  ON chat_threads(user_email, last_message_at DESC);

-- ---------------------------------------------------------------------
-- briefing_episodes — one row per published fleet briefing (daily or
-- weekly). Markdown lives here; (Phase 4) audio MP3 lives in R2 with
-- a key referenced from `audio_r2_key`.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS briefing_episodes (
  id             TEXT PRIMARY KEY,
  cadence        TEXT NOT NULL CHECK (cadence IN ('daily','weekly')),
  for_date       TEXT NOT NULL,
  markdown       TEXT NOT NULL,
  audio_r2_key   TEXT,
  duration_sec   INTEGER,
  generated_by_run_id TEXT,
  published_at   TEXT NOT NULL,
  FOREIGN KEY (generated_by_run_id) REFERENCES workflow_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_briefing_cadence_date
  ON briefing_episodes(cadence, for_date DESC);

-- ---------------------------------------------------------------------
-- Seed the agents table from the canonical agent declarations. Phase 2
-- moves this to a build-time hook that reads src/content/agents/*.mdx.
-- The Phase 0 seeds match the MDX defaults in src/content.config.ts.
-- ---------------------------------------------------------------------
INSERT OR REPLACE INTO agents
  (slug, name, status, agent_class, pii_scope,
   permissions_invoke, permissions_configure, permissions_view_logs,
   owner_email, updated_at)
VALUES
  ('basal', 'Basal', 'live', 'A', 'none',
   '["employee"]', '["ai-admin"]', '["ai-admin"]',
   'john@lunadiabetes.com', '2026-05-10T00:00:00Z'),
  ('data-agent', 'Data Agent', 'coming-soon', 'A', 'none',
   '["employee"]', '["ai-admin"]', '["ai-admin"]',
   'john@lunadiabetes.com', '2026-05-10T00:00:00Z'),
  ('personal', 'Personal', 'by-request', 'B', 'none',
   '["employee"]', '["employee"]', '["ai-admin"]',
   NULL, '2026-05-10T00:00:00Z');
