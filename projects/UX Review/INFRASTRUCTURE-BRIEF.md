# UX Review Platform — Infrastructure Brief (for the nightluna instance)

**Audience:** the Luna intranet Claude Code instance that owns this repo (`Luna_AI_Intranet`, Astro 5 + Tailwind v4, Cloudflare Pages → nightluna.com, Cloudflare Access SSO).
**Goal:** add a new **"UX Review"** tool section to nightluna where John's colleagues review the Luna iOS app wireframes holistically and leave Google-Docs-style comments, across several design cycles, before Figma export.
**Division of labor:** the **design artifacts** (component kit + wireframes + manifest) are produced in the personal workspace and land in `projects/UX Review/` (Project B). This brief is the **platform** to build around them (Project A). Build in `src/` + `functions/`; import from `projects/UX Review/`. **Do not push/deploy without John.**

---

## 1. Multi-section navigation

The intranet today is single-purpose (AI/agents). Introduce a top-level notion of **sections/tools** so AI/Agents and "UX Review" are siblings.
- Add `{ href: "/ux-review", label: "UX Review" }` to the `navLinks` array in `src/components/Nav.astro`.
- Add `src/pages/ux-review/` — `index.astro` (All-Screens + Feature views) and `[slug].astro` (single-screen detail), mirroring the existing `src/pages/agents/` pattern.
- If a richer "switch between tools" affordance is wanted (vs a flat nav link), add a section switcher in `BaseLayout`/`Nav`.

## 2. Notifications (new — none exist today)

Add a lightweight notifications surface (bell in `Nav` + a dropdown/panel). Events: **new comment**, **@mention**, **comment resolved**. Source the feed from the comments store (§4). Per-user "seen" state keyed on the CF Access email. Keep it simple (poll on load / SSE optional).

## 3. Views (driven by the manifest)

Data source: `projects/UX Review/app-map.json` (see §6 — Project B generates it from the Luna App Map).
- **All Screens** (`/ux-review`): responsive grid of every screen in 390pt iPhone frames; each badged with **Status** (New/Changed/Unchanged) + an unresolved-comment count. **Filters:** Status, Feature, BRD Tier (all fields are in the manifest).
- **Feature view**: screens grouped by `feature`, each group an expandable section.
- **Screen detail** (`/ux-review/<id>`): full render in a 390pt device frame + the comments rail. For `status === "Changed"`, an **old-vs-new compare** (slider or side-by-side) of `legacy` (Figma screenshot) vs `wireframe`. Show a per-screen **context panel**: feature, BRD tier, link to the BRD.

## 4. Comments (the core)

- **Identity is free:** read `Cf-Access-Authenticated-User-Email` from the request headers (CF Access already gates nightluna). Display name via a one-time prompt stored client-side, reconciled to the verified email. No separate auth.
- **Persistence:** a Cloudflare Pages Function at `functions/api/comments.ts` backed by **D1** (simplest for cross-screen queries like the unresolved dashboard) or a Durable Object per screen. Recommend **D1**.
- **Schema:**
  ```sql
  comments(
    id TEXT PRIMARY KEY, screen_id TEXT NOT NULL,
    author_name TEXT NOT NULL, author_email TEXT NOT NULL,
    body TEXT NOT NULL, anchor_x REAL, anchor_y REAL,   -- 0..1 fractions; null = general
    parent_id TEXT, resolved INTEGER DEFAULT 0,
    design_version TEXT, created_at INTEGER NOT NULL
  )
  ```
- **API:** `GET /api/comments?screen_id=…` · `POST /api/comments` · `PATCH /api/comments/:id` (resolve) · `GET /api/comments/unresolved` (dashboard feed).
- **Behaviors:** threaded (one level via `parent_id`), **resolvable** (never delete — collapse to a "Resolved" group), **anchored pins** (click-to-place on the screen; store fractional coords so pins survive frame scaling), **deep-link** `/ux-review/<id>#c=<comment_id>`.

## 5. Value-adds (P0 + P1)

P0: Status/Feature/BRD-Tier filters · anchored pins · old-vs-new compare · **unresolved-comments dashboard** (`/ux-review/review` aggregating open threads).
P1: per-screen BRD context panel · **design-version tagging** (stamp each comment with the `design_version` it was made against; per-screen version switcher) · iPhone device frames · deep links.
(Confirm scope tier with John before building all of P1.)

## 6. Artifact contract (what Project B delivers into `projects/UX Review/`)

1. **Component kit** (already delivered): `css/tokens.css`, `preview/`, `assets/`, `fonts/`, `brand.html`, `components.html`, `dose-confirmation/`. Port `tokens.css` + the components + the dose component into `.astro` (scope tokens to the UX Review render area — they are the **iOS** system, distinct from the intranet's `global.css`).
2. **Wireframes** (Deliverable 3, later): `wireframes/<screen-id>.*` at 390pt; legacy screenshots `wireframes/legacy/<screen-id>.png`.
3. **Manifest** (later): `app-map.json` = `[{ id, title, status, feature, brdTier, wireframe, legacy }]`, generated from the Luna App Map sheet.

Component names = `.astro` component names = Figma layer names. One screen = one 390pt artboard → one Figma frame.

## 7. Guardrails

- Keep the section behind the existing CF Access allowlist — this is unreleased product design. Add colleague emails to the allowlist as needed.
- Deploy is push-to-main → CF Pages; John's hand on the keyboard.
- Don't fork the iOS tokens into the intranet's global `@theme` — scope them, so intranet chrome and iOS wireframes stay visually separate.
