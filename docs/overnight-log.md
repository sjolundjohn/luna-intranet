# Overnight build log — AI Platform Website

This is Claude's working journal while John sleeps. Newest entries on top, but the **morning briefing** at the very top is what to read first when you wake up.

> Nothing in this log was deployed to production. All work is on branch `claude/nostalgic-shtern-e1f753` and lands in PRs against `main`. You merge in the morning.

---

## Morning briefing — written `2026-05-10T00:55Z`

> **TL;DR:** Both phases shipped. One PR, two atomic commits. Branch is `claude/nostalgic-shtern-e1f753`. Nothing was deployed. Nothing was merged. Coffee, walk through `/vision`, then merge or ask for revisions.

### What landed

**[luna-intranet#1](https://github.com/sjolundjohn/luna-intranet/pull/1)** — _v0.3+v0.4: AI workplace platform — frontend (Phase 1) + Cloudflare-native skeleton (Phase 0)_

Two commits, separable on review:

| Commit | What |
|---|---|
| `72748bd` | **Phase 1** — 13 new routes, 14 new components, schema extensions, restructured nav. Static frontend with mock data. Existing `/api/chat` path untouched. |
| `402930c` | **Phase 0** — pnpm monorepo, 8 Workers, 2 shared packages, Cloudflare Agents SDK base class, full D1 schema, Terraform plans. Code-only — no infra apply. |

Combined diff: ~50 new files, ~5,000 lines added in well-commented chunks. Build journal below.

### What to do first thing

1. **Open `/vision`** in `pnpm dev` and read it cold. The fear-and-answer pattern is the heart of the change-management voice — if any row reads as marketing rather than as a design choice, that's the first thing to revise. I leaned on the brand-essentials one-pager for canonical product phrasing ("overnight glucose control... for people on long-acting insulin"); anywhere I went beyond that, I stayed general rather than inventing specifics.
2. **Then `/governance`.** This is where I'd most want a leadership / regulatory pass before showing the team. The roles, kill-switch, audit, and PHI sections are the contract Luna's making to its employees — they need to be both accurate and defensible. The "what we haven't built yet" block is the trust-compounding part; flag anything I claimed that we shouldn't claim, or any control we have that I didn't surface.
3. **Then `/onboarding/{eng,clinical,ops,exec,admin}`.** Each is 5 modules, ~20 minutes per role. The first module on every track is "what we're not asking you to do" — that's the design discipline. Reread the one for your own role first; if it doesn't land for you, it won't land for the team.
4. **`pnpm dev` walkthrough of the rest.** `/agents/me`, `/workflows`, `/fleet`, `/fleet/briefing`, `/chat`, `/learn`, `/roadmap`, `/styleguide`. All routes render with mock data.

### What I'd flag for the team's review (not blockers)

- **Shannon copy pass.** I cross-checked voice against existing `/agents` and `/platform/*` pages — direct, second-person, no marketing puff — but a human pass on `/vision`, `/governance`, and the 5 onboarding tracks before public-to-team rollout will catch nits I won't.
- **DQ citations.** I couldn't run DQ from this worktree (no `gdrive_luna__*` MCP mounted). Anywhere I'd want to anchor a sentence in research data (segmentation n-sizes, HCP T2B percentages, willingness-to-pay), I left the language general rather than fabricate numbers. Run DQ from your main env to slot in primary-source citations if you want them.
- **Legal pass on `/governance`** before the page goes live to the team — particularly the HIPAA/PHI section. The roadmap explicitly defers California employment-law work (CCPA-employee, AB 2930) until counsel review; I want to make sure we're consistent on that line.

### Phase 0 deploy checklist (when you're ready)

Nothing here is required to merge the PR — Phase 0 is code-only. When you decide to actually stand up the infrastructure:

1. `cd infra/terraform && terraform init && terraform plan -out=plan.tfplan`
2. Review the plan (creates D1, 2× KV, 2× R2, 1× Vectorize, 2× Queues, 1× Analytics Engine dataset; no destructive ops)
3. `terraform apply plan.tfplan`
4. `wrangler d1 migrations apply luna-platform --remote` to apply `migrations/0001_init.sql`
5. Replace `PLACEHOLDER_FILL_VIA_TERRAFORM` ids in each `wrangler.toml` from `terraform output -json` (Phase 2 lands a wire-bindings script to automate)
6. `pnpm -r --filter "@luna/*" deploy` to deploy every Worker
7. Production `/api/chat` is **untouched** — it still goes through the existing Pages Function path. To migrate to the new agent-router, flip a feature flag (planned for Phase 2).

### Hardening follow-ups I deliberately left for later

- **CF Access JWT signature verification in `auth.ts`** — not required today (every Worker is service-bound or behind Access). Required before any Worker is exposed publicly. Easy to slot in (verify against the CF JWKS).
- **Anthropic SSE `usage` parsing** for token counts in audit rows. Today rows write with `tokens_in/out: 0`. Phase 2 deliverable.
- **Replace AI Gateway terraform placeholder** when the `cloudflare_ai_gateway` resource ships in the CF provider. Today the gateway is created via `wrangler ai-gateway create` and referenced by name.
- **Empty-collection warnings** at build time for `handbook`, `engineering`, `news` collections in `content.config.ts` — the directories don't exist yet. Either create empty stubs or remove those collection definitions from the config; I left them as-is since they were pre-wired by your prior work.

### Decisions I made under uncertainty

- **No JWT verification in Phase 0.** Reasoning above. If you want this hardened immediately, it's a 30-line follow-up.
- **`exactOptionalPropertyTypes: true`** across all Workers. Slightly stricter; required me to use `...(x ? { foo: x } : {})` spread patterns when forwarding optional fields. Worth it; keeps `undefined` from sneaking into D1 inserts.
- **AI Gateway endpoint hardcoded to `gateway.ai.cloudflare.com/v1/anthropic/v1/messages`** in `LunaAgent.invoke()`. The `[ai] binding` should provide a typed gateway helper that takes care of the URL — replace the literal when you wire the real binding.
- **Workflow definitions stubbed but cron-triggered.** The cron triggers in `workflow-runner/wrangler.toml` are real; they'll fire as soon as the Worker is deployed. Phase 0 cron handlers create instances but the workflow steps just return stub data. Acceptable because nothing's deployed; flag for me if you want me to disable the cron triggers until Phase 3 fills in the steps.

### Things I did NOT do (per the autonomy rules)

- ❌ No `terraform apply`
- ❌ No `wrangler deploy` to production custom domains (only `--dry-run`)
- ❌ No D1 migrations applied
- ❌ No production secrets read or written
- ❌ No external API calls beyond a few cents of test usage (didn't actually trigger any)
- ❌ No merges
- ❌ No force-push or destructive git ops
- ❌ No external messages sent
- ❌ No HIPAA-scoped agents wired live
- ❌ No changes to `ai-proxy.nightluna.com` (separate repo, separate change-management story)

---

_Skip past this section for the chronological log of what landed when._

---

## Working plan

Source of truth for what I'm building tonight: `~/.claude/plans/ai-platform-website-synchronous-stardust.md` (also referenced in the PR description).

**Strategy:** Phase 1 (frontend, full copy, fully walk-throughable) ships first as PR #1. Then Phase 0 (Cloudflare-native Worker skeleton, no infra apply) as PR #2. Both reviewed by DevOps/Sensor/Shannon/DQ subagents before opening.

**Hard guardrails:**
- No `terraform apply`, no `wrangler deploy` to prod, no D1 migrations applied, no merges, no destructive git ops, no external messages, no production secrets touched.
- Phase 0 stays as code + plans only. Phase 1 stays as static frontend + mock data.
- If I hit a real blocker, I stop on that thread, log it here, and keep working on independent threads.

---

## Chronological log

### Environment verification — `2026-05-09T23:30Z`
- pwd: worktree `nostalgic-shtern-e1f753`, branch `claude/nostalgic-shtern-e1f753`, status clean
- `wrangler whoami`: signed in as `sjolundjohnsignin@gmail.com`, account `John Sjolund` (`a4142411ce45e09b846536e0a1aba208`); scopes include `workers:write`, `workers_kv:write`, `d1:write`
- `gh auth status`: `sjolundjohn` logged in via keyring; scopes `gist`, `read:org`, `repo`, `workflow`
- Repo: pnpm 9.15.0 pinned, Astro 5, Tailwind v4, MDX. No root `wrangler.toml` (Pages Functions auto-deploy from `functions/`)
- Remote: `https://github.com/sjolundjohn/luna-intranet.git`
- TS path alias: `~/* → src/*`
- Existing chat path: `/api/chat` Pages Function → `ai-proxy.nightluna.com/anthropic/v1/messages` → AI Gateway → Anthropic. Bearer + CF Access service tokens already wired.

**No blockers.** Proceeding.

### Source-grounding for copy — `2026-05-09T23:50Z`

DQ subagent couldn't access Luna's research library from this worktree (no `gdrive_luna__*` MCP tools mounted here) — it correctly refused to fabricate citations. Pivoted to using the **brand-essentials one-pager** (`docs/brand/brand-essentials-one-pager.pdf`) as the canonical source for copy anchoring. Verified ground truths I'll use in `/vision`, `/governance`, etc.:

- Tagline: **"Smarter insulin. While you sleep."**
- Mission framing: **"Luna makes overnight glucose control effortless for people on long-acting insulin."**
- Mechanism summary: **"One small device. One simple routine. Wake up in range."**
- Company: **Luna Health, Inc.**
- Brand discipline: Midnight + Moonlight + White only; D-DIN display, Inter body; 60%+ whitespace; never tint the wordmark, never use Moonlight as a flood

Existing intranet copy on `/agents` and `/platform/*` cross-checked — consistent voice (direct, second-person, no marketing puff). Existing infra terminology already in production: `luna-slack-dm`, `luna-router`, `luna-agent-basal`, `luna-ai-proxy`, Durable Object per user, AI Gateway, Anthropic ZDR.

**Decision:** anchor all new copy in those exact phrases + the established voice. Will not invent product claims. Where Luna research data would strengthen a sentence (n-sizes, segmentation, HCP T2B percentages), I leave a `<!-- DQ: cite -->` marker for John to slot in tomorrow when running DQ from a context with library access.

### Phase 1 build complete — `2026-05-10T00:32Z`

All Phase 1 routes shipped + reviewed + green. Summary:

**Components added (14)** — all in `src/components/`:
- `FearAndAnswer` — recurring fear/answer change-management pattern
- `RoleBadge` — chip for employee/manager/ai-admin/phi-authorized roles
- `AuditRow` — single audit-log table row
- `CostMeter` — budget bar with normal/warn/crit thresholds
- `BriefingPlayer` — daily/weekly briefing audio + RSS link
- `AgentConfigCard` — per-user agent toggle + status row
- `FleetTile` — single agent's status card
- `WorkflowCard` — workflow catalog tile
- `WorkflowStepList` — vertical numbered step diagram
- `WorkflowRunRow` — workflow run history row
- `MemoryViewer` — "what this agent remembers about me" + delete
- `OnboardingPath` — index card for one role track
- `KillSwitchButton` — admin-only kill control
- `ChatLayout` — full-page chat surface wrapping ChatBox

**Pages added (13 new + 1 updated)** — all in `src/pages/`:
- `/vision` — change-management framing, 6 fear-and-answer blocks anchored in Luna-actual product
- `/governance` — roles, permissions, kill-switch, audit, cost caps, PHI scope, change control, honest gaps
- `/roadmap` — 6 phases with status chips: in flight, up next, later, deferred (CA employment-law explicitly deferred)
- `/onboarding` (index) + `/onboarding/[role]` × 5 (eng, clinical, ops, exec, admin) — each starts with "what we're not asking you to do"
- `/agents/me` — per-user config, custom instructions, memory viewer, audit log, cost meter, data export
- `/workflows` (catalog) + `/workflows/[id]` × 4 (morning-briefing, fleet-briefing-daily, support-triage, monthly-platform-audit)
- `/fleet` (catalog) + `/fleet/briefing` + `/fleet/[agent]` × 3 — privacy framing up-front, aggregate-only by design
- `/chat` — full-page wrapper around existing ChatBox with agent picker + threads sidebar
- `/learn` — index of context pages (vision, governance, onboarding, roadmap, org, platform)
- `/styleguide` updated with all 14 new components

**Schema changes** — `src/content.config.ts`:
- Extended `agents` schema with `agentClass`, `permissions: { invoke, configure, viewLogs }`, `piiScope`. Existing MDX files keep working — defaults are `Class A`, `invoke: [employee]`, `configure/viewLogs: [ai-admin]`, `piiScope: none`.
- New `workflows` collection — typed step list, trigger, schedule, status.
- New `onboarding` collection — role, modules with body + task field.

**Nav restructure** — Chat | Agents | Workflows | Fleet | Learn (5 items). /org and /platform reachable via /learn.

**Quality gates passed:**
- `pnpm typecheck` → 0 errors, 0 warnings, 0 hints across 59 files
- `pnpm build` → 36 pages built clean in 1.27s
- Voice cross-checked against existing `/agents` and `/platform/*` copy — second-person, direct, no marketing puff
- Brand cross-checked against `docs/brand/brand-essentials-one-pager.pdf` — Midnight + Moonlight + White only, D-DIN display + Inter body, no invented colors

**Things deferred to John in the morning (not blockers):**
- Shannon-style human copy pass — recommended on `/vision`, `/governance`, and the 5 onboarding tracks before public-to-team rollout. Specific voice nits will be cleaner from a human read than a self-review.
- DQ-sourced citation pass — anywhere I'd want to anchor a claim in n-sizes, segmentation, or HCP research data, I left the language general. Run DQ from your main environment to slot in primary-source numbers if you want them.
- First-visit onboarding redirect — Phase 4 territory; not landed.
- Real per-user writes on /agents/me — Phase 2 territory.

Opening Phase 1 PR next.

### Phase 1 PR opened — `2026-05-10T00:33Z`

[luna-intranet#1](https://github.com/sjolundjohn/luna-intranet/pull/1) — _v0.3 Phase 1: AI workplace IA, copy, and component scaffolds._

41 files changed, 3,728 lines added. PR description includes full test plan and explicit "what's intentionally NOT in this PR" so the review surface is small.

### Phase 0 build complete — `2026-05-10T00:49Z`

The Cloudflare-native Worker skeleton. Code-only; **no `terraform apply`, no `wrangler deploy`, no D1 migrations applied.** Every Worker scaffolds, typechecks, and `wrangler deploy --dry-run` bundles cleanly with all bindings resolving.

**Monorepo layout** (new `pnpm-workspace.yaml`):

```
apps/
  agent-router/        — dispatcher Worker. Parses agent slug from body, looks up
                         permissions in D1, checks kill-switch in KV, forwards via
                         service binding to per-agent Worker. Default-deny on
                         unknown agents.
  agent-basal/         — Worker + Durable Object using Cloudflare Agents SDK
                         (`agents` ^0.12.3). BasalAgent extends LunaAgent.
                         One DO per (agent, user) — keyed `basal:<email>` so a
                         Lunite's thread persists across reconnects without us
                         writing sync code.
  agent-data/          — placeholder Worker, returns 503 "coming-soon"
  agent-personal/      — placeholder Worker, returns 503 "by-request"
  config-api/          — per-user config writes (GET /me, PUT /me/agents/:slug,
                         DELETE /me/agents/:slug/memory, POST /me/data/export)
  fleet-api/           — read aggregates for /fleet, with admin-only column
                         selection so non-admins literally cannot get user_email
                         out of the query.
  workflow-control/    — control plane: list/inspect/trigger/cancel workflow runs
  workflow-runner/     — Cloudflare Workflows definitions:
                           * MorningBriefingWorkflow (per-Lunite fan-out)
                           * DailyFleetBriefingWorkflow (Queues fan-out + compose)
                           * SupportTriageWorkflow (drafts only, non-skippable
                             human-approval step)
                         + cron triggers (7am weekdays, 6pm daily, every 2h)
                         + Queues consumer for briefing fan-out
packages/
  shared/              — Types (Role, ActorIdentity, AgentPermissions,
                         AuditLogRow, KillSwitchRecord, CostCap, InvokeRequest)
                       — auth: extractActor() / requireRole()
                       — audit: writeAudit() / sha256Hex() / nowUtcIso()
                       — killswitch: isKilled() / setKilled(); fail-closed for PHI
  agents-sdk-glue/     — LunaAgent abstract base class extending Cloudflare
                         Agents SDK Agent. One place enforces:
                           * kill-switch check before model call
                           * SHA-256 prompt/response hashing
                           * AI Gateway routing (never direct Anthropic)
                           * audit-log row written via @luna/shared/audit
                           * stream tee-and-hash for response capture
                         Subclasses just supply `agentSlug`, `piiScope`,
                         `getSystemPrompt(userInstructions?)`.
infra/terraform/       — D1, KV (kill_switch + platform_cache), R2 (briefings +
                         attachments), Vectorize (basal-memory), Queues (briefing
                         fan-out + audit ingest), Analytics Engine, AI Gateway
                         placeholder (resource not yet in CF provider — uses
                         locals + dashboard creation per README).
migrations/0001_init.sql — Full schema:
  agents, users, user_agent_config, audit_log, kill_switches, cost_caps,
  workflows, workflow_versions, workflow_runs, chat_threads, briefing_episodes.
  Indexes justified inline. Seeds basal/data-agent/personal rows so the
  router can dispatch on day one.
```

**Quality gates passed:**
- ✅ Every Worker `pnpm exec tsc --noEmit` → 0 errors
- ✅ Frontend `pnpm typecheck` → 0/0/0 across 59 files
- ✅ Frontend `pnpm build` → 36 pages clean
- ✅ `wrangler deploy --dry-run` on agent-router, agent-basal, workflow-runner — all bind, all bundle. agent-basal's Durable Object class registers cleanly under Agents SDK.
- ✅ pnpm-workspace.yaml resolves; `agents` SDK installed at the right peer deps; existing Astro frontend still builds.

**Hardening notes filed for follow-up (non-blockers):**
- `auth.ts` doesn't cryptographically verify the CF Access JWT yet — for any Worker fronting public traffic (none today; everything is service-binding-only or behind Access), JWT verification against the JWKS must land before exposure. Tracked.
- `audit.ts` token-count parsing isn't wired (Anthropic SSE `usage` events). Phase 2 deliverable; rows still write with `tokens_in/out: 0` for now.
- `workflow-runner` uses `cloudflare:workers` import for `WorkflowEntrypoint` — the runtime resolves this at deploy. Wrangler dry-run validates the workflow class registration.
- `ai_gateway.tf` is a placeholder — the `cloudflare_ai_gateway` Terraform resource isn't shipped yet in the CF provider. Created via `wrangler ai-gateway create` for now; replaced when the resource lands.

**What John needs to do in the morning to actually deploy any of this:**
1. `cd infra/terraform && terraform init && terraform plan -out=plan.tfplan`
2. Review `plan.tfplan` (it'll create D1, 2× KV, 2× R2, 1× Vectorize, 2× Queues, 1× Analytics Engine dataset)
3. `terraform apply plan.tfplan` — when ready
4. Run `wrangler d1 migrations apply luna-platform --remote` to apply `migrations/0001_init.sql`
5. Replace `PLACEHOLDER_FILL_VIA_TERRAFORM` ids in each Worker's `wrangler.toml` from `terraform output -json` (or run the small wire-bindings script when it lands in Phase 2)
6. `pnpm -r --filter "@luna/*" deploy` — deploys every Worker via the workspace filter
7. The existing `functions/api/chat.ts` Pages Function is **untouched** — production chat flow unchanged until you flip a feature flag.

Phase 0 PR next.
