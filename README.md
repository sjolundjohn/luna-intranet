# Luna Intranet

Internal home for Luna Health. Lives at `nightluna.com`, gated to `@lunadiabetes.com` via Cloudflare Access.

```
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output → dist/ + functions → dist-functions/
pnpm preview  # serve the built site locally
```

## Stack

- **Astro 5** — static-site generator. Pages are pre-rendered HTML; no server required for content.
- **Tailwind CSS v4** — CSS-first. All design tokens live in `src/styles/global.css` as `@theme` custom properties.
- **MDX** — content lives as `.mdx` files under `src/content/` with typed frontmatter.
- **Cloudflare Pages** — hosting for the static site.
- **Cloudflare Pages Functions** — backs the `/api/chat` endpoint that powers the in-browser chat box. Lives in `functions/`.
- **Cloudflare Access** — auth at the network edge, federated to Google Workspace. No in-app auth code.

## Auth model

Authentication is enforced at the Cloudflare Access layer — **not in the app**. When a user hits `nightluna.com`, Access redirects them to Google Workspace SSO. After signing in, they hit the site with a `Cf-Access-Jwt-Assertion` header on every request and an email header (`cf-access-authenticated-user-email`) that the chat API uses to identify the user to `luna-ai-proxy`.

The **Sign out** button in the nav hits `/cdn-cgi/access/logout`, which is Cloudflare's built-in logout endpoint. In local dev it does nothing (no Access running); in production it logs the user out of the site. Signing back in is automatic on the next navigation.

To add a branded Luna signin page, customize the Access "Application Launcher" in the CF Zero Trust dashboard — no code change here.

## Design system

Source of truth: `docs/brand/luna-design-system-v1.0.pdf`. The `@theme` block in `src/styles/global.css` mirrors every token in that PDF — primary colors, Moonlight tints, neutral scale, text/ink, borders, alerts, spacing, radii, shadows.

Visual QA page: `/styleguide` — every component in every variant. Diff that page against the PDF when touching anything design-system-related.

## Chat backend — how it works

The chat box on the landing page and on `/agents/basal` posts to `/api/chat`, which is a Cloudflare Pages Function at `functions/api/chat.ts`. It:

1. Reads the authenticated user's email from the `Cf-Access-Jwt-Assertion` header.
2. Adds `Authorization: Bearer $PROXY_BEARER` (held as a Pages secret).
3. Forwards to `luna-ai-proxy.nightluna.com/anthropic/v1/messages` with `stream: true`.
4. Pipes the SSE stream back to the browser.

**Secrets needed (set in the CF Pages project settings):**
- `PROXY_BEARER` — shared bearer for `luna-ai-proxy`. Copy it from the `ai-workforce-cloudflare` repo's Wrangler secrets.

Optional env:
- `AI_PROXY_URL` — override the default `https://ai-proxy.nightluna.com`.
- `MODEL` — override the default `claude-opus-4-7`.

Locally, the chat box gracefully degrades — it shows a "chat only works when deployed" error instead of a crash.

## Adding content

Adding a new agent, person, or page is a single file.

### New agent

Create `src/content/agents/<slug>.mdx`:

```mdx
---
name: "Name"
status: "live" | "coming-soon" | "by-request"
summary: "One line that appears on the agent card."
accessHint: "Slack DM · @Name"
avatar: "/agents/avatars/name.png"   # optional; falls back to moon-phase glyph
owner: "john"                         # optional; person-id of maintainer
teams: ["all"]                        # or specific team slugs, see below
usedBy: ["john"]                      # person-ids who actively use it
order: 4
---

Markdown / MDX body.
```

Appears automatically on `/agents`, `/agents/<slug>`, `/org/by-team`, and `/org/by-person`.

### New person

Create `src/content/people/<slug>.mdx`:

```mdx
---
name: "Jane Doe"
role: "Software Engineer"
team: "software"
email: "jane@lunadiabetes.com"
avatar: "/people/jane.jpg"   # optional
order: 2
---

Short bio or notes.
```

Valid team slugs: `exec`, `software`, `data-science`, `hardware`, `regulatory`, `clinical`, `electrical-engineering`. Source of truth: `src/content.config.ts`.

### New platform topic

Create `src/content/platform/<slug>.mdx` with `title`, `summary`, `order`. Appears on `/platform` and `/platform/<slug>`.

### New top-level section

Content collections for `handbook`, `engineering`, `news` are pre-wired with empty schemas in `src/content.config.ts`. To turn one on:

1. Add your first MDX file under `src/content/<section>/`.
2. Create `src/pages/<section>/index.astro` (list) and `[slug].astro` (detail) using `/agents/index.astro` + `/agents/[slug].astro` as templates.
3. Add the nav link in `src/components/Nav.astro`.

## Avatars

Agent and person avatars are optional PNGs or SVGs placed under `public/`. Reference them from frontmatter as absolute paths (e.g. `/agents/avatars/basal.png`). Without a custom image, both default to a Moonlight-on-Midnight moon-phase glyph — still looks on-brand while you're waiting on design.

## Deploying

The `luna-intranet` Cloudflare Pages project is a **Direct-Upload** project (no
Cloudflare Git integration). Deploys run through GitHub Actions
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):

- **Every push & PR** → install + `pnpm typecheck` + `pnpm build` (the gate).
- **Push to `main`** → also `wrangler d1 migrations apply --remote` + `wrangler pages deploy --branch=main` → production (`nightluna.com`).

Bindings (the `DB` D1 database) come from `wrangler.toml` and attach on deploy.

**Required GitHub Actions secrets** (repo → Settings → Secrets and variables → Actions):

- `CLOUDFLARE_ACCOUNT_ID` = `a4142411ce45e09b846536e0a1aba208`
- `CLOUDFLARE_API_TOKEN` = token on the John Sjolund account with **Cloudflare Pages: Edit**, **D1: Edit**, **Account Settings: Read**

**Project-level secrets** (set once on the Pages project, persist across deploys):

- `PROXY_BEARER` — shared bearer for `luna-ai-proxy` (powers the chat box).
- `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` — service token to reach Access-gated upstreams.

Access: CF Dashboard → Zero Trust → Access → Applications → add `nightluna.com`
to protected hostnames. Preview URLs live outside Access by default; add
`*.luna-intranet.pages.dev` to the Access app's hostname list to gate them too.

See [docs/ux-review-setup.md](docs/ux-review-setup.md) for the D1 / UX Review specifics.

## Brand

Use `public/luna-on-dark.svg` on Midnight surfaces, `public/luna-on-white.svg` on White. Never tint, stretch, or shear the wordmark. Display typography is D-DIN; everything else is Inter. No new accent colors.
