# UX Review — setup & operations

The **UX Review** tool (`/tools/ux-review`) lets colleagues review the Luna iOS
app wireframes and leave Google-Docs-style comments before Figma export. This
doc covers the platform wiring beyond the static build: the **D1 database**
behind the dynamic tools (UX Review comments + the Kegerator), and the
**deploy / CI** setup.

> Deploy is **GitHub Actions** (`.github/workflows/deploy.yml`): typecheck +
> build on every PR; on `main`, apply D1 migrations then `wrangler pages deploy`.
> A merge to `main` deploys to production — **John's call.**

---

## What's in the box

| Piece | Path |
| --- | --- |
| UX Review pages | `src/pages/tools/ux-review/{index,[slug],review}.astro` |
| iOS tokens (scoped to `.ux-ios`) | `src/styles/ios-tokens.css` |
| iOS component kit + screens | `src/components/ux/` |
| Manifest (data source) | `projects/UX Review/app-map.json` |
| Manifest loader + types | `src/lib/ux-review.ts` |
| Tools registry | `tools` collection (`src/content/tools/*.mdx`, schema in `content.config.ts`) |
| Kegerator tool | `src/pages/tools/kegerator.astro`, catalog `src/lib/kegjoy.ts` |
| Dynamic APIs (D1) | `functions/api/{comments,keg,notifications,whoami}` |
| Schema migrations | `migrations/0001_comments.sql`, `migrations/0002_kegerator.sql` |
| D1 binding | `wrangler.toml` (binding `DB`) |
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
| Schema | `0001_comments.sql` + `0002_kegerator.sql` applied to `--remote` |
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
migrations, and deploys.

### Two secret stores — don't confuse them

There are **two** separate places secrets live; they are not interchangeable:

| Store | Where | What lives here |
| --- | --- | --- |
| **Cloudflare Pages project** | CF dashboard → Pages → luna-intranet → Settings | **Runtime** secrets the deployed Functions read: `PROXY_BEARER`, `CF_ACCESS_CLIENT_ID/SECRET`, `CONFIG_API_BEARER`, `FLEET_API_BEARER`. |
| **GitHub Actions** | repo → Settings → Secrets and variables → Actions | **Deploy-time** creds the CI uses: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`. |

Setting the runtime (Pages) secrets does **not** satisfy the deploy job, and
vice-versa. As of 2026-05-29: `CLOUDFLARE_ACCOUNT_ID` is set; the
`CLOUDFLARE_API_TOKEN` in GitHub Actions is **invalid** — the deploy step fails
with `Invalid access token [code: 9109]`. Verify a token before setting it:

```bash
curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool   # want "status": "active"
printf %s "<TOKEN>" | gh secret set CLOUDFLARE_API_TOKEN --repo sjolundjohn/luna-intranet
```

**Until the CI token is valid, deploy manually** (uses your local `wrangler`
OAuth login, no token needed):

```bash
export CLOUDFLARE_ACCOUNT_ID=a4142411ce45e09b846536e0a1aba208
npx wrangler d1 migrations apply luna-ux-review --remote   # only if migrations are pending
npx wrangler pages deploy dist --project-name luna-intranet --branch=main
```

---

## Local development

`astro dev` (`pnpm dev`) serves the pages but **not** the Functions/D1. To
exercise comments locally, build and run under Wrangler:

```bash
pnpm build
npx wrangler d1 migrations apply luna-ux-review --local
npx wrangler pages dev dist --port 8788
# → http://localhost:8788/tools/ux-review  ·  /tools/kegerator
```

Note: locally there's no session cookie and no Access, so the comments API
can't resolve an identity — POSTs will 401 unless you seed rows directly:

```bash
npx wrangler d1 execute luna-ux-review --local \
  --command "INSERT INTO comments (id,screen_id,author_name,author_email,body,resolved,created_at) VALUES ('demo','dashboard','Alice','a@lunadiabetes.com','hello',0,1716900000000)"
```

In production, the root middleware verifies the caller's `nl_session` cookie
and forwards the email to the function, so identity works. See
[`docs/auth.md`](./auth.md) for the full flow.

---

## Identity & access

- **First-party session, not direct Access gating.** The whole site sits
  behind the `nl_session` middleware gate (see [`docs/auth.md`](./auth.md));
  the comments API reads the verified email via `getVerifiedEmail` (the signed
  `nl_session` cookie, with the Access-header path as a fallback). To let a new
  colleague in, add their email to the **Google SSO policy on the
  `nightluna.com/auth/login` Access app** — that's the one gated path. (This is
  unreleased product design — keep it gated.)
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
| `GET /api/whoami` | caller's verified email + `isAdmin` (powers Kegerator's Make Order) |
| `GET /api/keg/votes` | Kegerator standings + the caller's own votes |
| `POST /api/keg/vote` | cast / change / clear a keg vote (`{ itemId, value: 1\|-1\|0 }`) |
| `POST /api/keg/order` | **admin** — clears the keg queue after an order is placed |

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
