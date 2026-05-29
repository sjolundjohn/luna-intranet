# UX Review — setup & operations

The **UX Review** section (`/ux-review`) lets colleagues review the Luna iOS
app wireframes and leave Google-Docs-style comments before Figma export. This
doc covers the one piece that needs wiring beyond the static build: the **D1
database** behind the comments API.

> Built per `projects/UX Review/INFRASTRUCTURE-BRIEF.md`. Deploy is
> push-to-main → CF Pages; **John's hand on the keyboard** (don't deploy from here).

---

## What's in the box

| Piece | Path |
| --- | --- |
| Section pages | `src/pages/ux-review/{index,[slug],review}.astro` |
| iOS tokens (scoped to `.ux-ios`) | `src/styles/ios-tokens.css` |
| iOS component kit + screens | `src/components/ux/` |
| Manifest (data source) | `projects/UX Review/app-map.json` |
| Manifest loader + types | `src/lib/ux-review.ts` |
| Comments API (D1) | `functions/api/comments/`, `functions/api/notifications.ts` |
| Schema migration | `migrations/0001_comments.sql` |
| D1 binding | `wrangler.toml` |
| Notifications bell | `src/components/ux/NotificationsBell.astro` (in `Nav.astro`) |

The site renders fully **without** D1 — comment surfaces just show a graceful
"comments store isn't configured yet" message. Wire D1 to turn them on.

---

## D1 status — already provisioned ✅

The database exists and the schema is applied (done 2026-05-29, account
**John Sjolund** `a4142411ce45e09b846536e0a1aba208`):

| | |
| --- | --- |
| Database | `luna-ux-review` |
| `database_id` | `10be50ac-770f-4cbe-86c7-f5dc89176555` (in `wrangler.toml`) |
| Region | WNAM |
| Schema | `0001_comments.sql` applied to `--remote` |
| Binding name | **`DB`** (don't rename — Functions read `env.DB`) |

The `[[d1_databases]]` binding in `wrangler.toml` is attached to the Pages
project automatically on every `wrangler pages deploy` (see CI below). No
dashboard binding step is required for a Direct-Upload project.

To re-run from scratch (only if the DB is ever deleted):

```bash
export CLOUDFLARE_ACCOUNT_ID=a4142411ce45e09b846536e0a1aba208
npx wrangler d1 create luna-ux-review        # paste new id into wrangler.toml
npx wrangler d1 migrations apply luna-ux-review --remote
npx wrangler d1 migrations apply luna-ux-review --local   # for local dev
```

---

## Deploy / CI

There is **no Cloudflare Git integration** on this project (it's a
Direct-Upload Pages project; `Git Provider: No`). Deploys run via
`wrangler pages deploy`. `.github/workflows/deploy.yml` automates this:

- **Every push & PR** → `pnpm install` + `pnpm typecheck` + `pnpm build` (the gate).
- **Push to `main`** → also `d1 migrations apply --remote` then `pages deploy --branch=main` (production = the `main` branch).

The D1 binding ships via `wrangler.toml`, so the deployed Functions get `DB`
automatically. **One-time secrets you must add** (GitHub → repo Settings →
Secrets and variables → Actions → New repository secret):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | `a4142411ce45e09b846536e0a1aba208` |
| `CLOUDFLARE_API_TOKEN` | a token on the **John Sjolund** account with **Account · Cloudflare Pages: Edit** + **Account · D1: Edit** + **Account · Account Settings: Read** (create at dash.cloudflare.com → My Profile → API Tokens) |

Create the token, add both secrets, then push to `main` — CI builds, applies
migrations, and deploys. Comments go live the moment that deploy lands (the
binding does the rest; no runtime secret needed for comments).

---

## Local development

`astro dev` (`pnpm dev`) serves the pages but **not** the Functions/D1. To
exercise comments locally, build and run under Wrangler:

```bash
pnpm build
npx wrangler d1 migrations apply luna-ux-review --local
npx wrangler pages dev dist --port 8788
# → http://localhost:8788/ux-review
```

Note: Cloudflare reserves `cf-*` request headers, so the
`Cf-Access-Authenticated-User-Email` identity header is **stripped by
miniflare locally** — POSTs will 401 unless you seed rows directly:

```bash
npx wrangler d1 execute luna-ux-review --local \
  --command "INSERT INTO comments (id,screen_id,author_name,author_email,body,resolved,created_at) VALUES ('demo','dashboard','Alice','a@lunadiabetes.com','hello',0,1716900000000)"
```

In production, Cloudflare Access injects the email header, so identity works.

---

## Identity & access

- **No separate auth.** The whole site is behind the Cloudflare Access
  allowlist; the comments API reads the verified email from
  `Cf-Access-Authenticated-User-Email`. Add colleague emails to the Access
  app to let them in (this is unreleased product design — keep it gated).
- **Display name** is a one-time client-side prompt stored in `localStorage`
  (`ux-review:name`), reconciled to the verified email server-side.

---

## API surface

| Method & path | Purpose |
| --- | --- |
| `GET /api/comments?screen_id=…[&design_version=…]` | thread for a screen |
| `POST /api/comments` | create a comment / reply (anchored or general) |
| `PATCH /api/comments/:id` | resolve / reopen (`{ resolved: boolean }`) |
| `GET /api/comments/unresolved` | dashboard feed + per-screen open counts |
| `GET /api/notifications` | recent events for the nav bell |
| `GET /api/whoami` | caller's verified email (excludes self from notifications) |

Comments are **never deleted** — resolving collapses a thread into the
"Resolved" group. Replies are one level deep. Anchored pins store fractional
(0–1) coordinates so they survive frame scaling.

---

## When Project B delivers wireframes + manifest

Today each screen is a native `.astro` composition of the ported component
kit, and `app-map.json` points at them via `"wireframe": "component:<id>"`.

When Deliverable 3 lands rasterized wireframes at `wireframes/<id>.*`:

1. Drop the manifest array into `projects/UX Review/app-map.json` (same shape).
2. For image-backed screens, point `wireframe`/`legacy` at the image paths and
   add an `<img>` branch in `src/components/ux/ScreenRenderer.astro` (the
   registry key stays the screen id). Move images under `public/` so Pages
   serves them.

No platform changes needed beyond that.
