# Luna Intranet

Internal home for Luna Health. Lives at `nightluna.com`, gated to `@lunadiabetes.com` via Cloudflare Access.

```
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output → dist/
pnpm preview  # serve the built site locally
```

## Stack

- **Astro 5** — static site generator. Pages are pre-rendered HTML, no server required.
- **Tailwind CSS v4** — CSS-first. All design tokens live in `src/styles/global.css` as `@theme` custom properties.
- **MDX** — content lives as `.mdx` files under `src/content/` with typed frontmatter.
- **Cloudflare Pages** — hosting. **Cloudflare Access** — auth (federates to Google Workspace).

## Design system

Source of truth: `docs/brand/luna-design-system-v1.0.pdf`. The `@theme` block in `src/styles/global.css` mirrors every token in that PDF — primary colors, Moonlight tints, neutral scale, text/ink, borders, alerts, spacing, radii, shadows.

Visual QA page: `/styleguide` — every component in every variant. Diff that page against the PDF when touching anything design-system-related.

## Adding content

Adding a new agent, platform topic, or future section is a single file.

### New shared agent

Create `src/content/agents/<slug>.mdx`:

```mdx
---
name: "Name"
status: "live" | "coming-soon" | "by-request"
summary: "One line that appears on the agent card."
accessHint: "Slack DM · @Agent"
order: 4
---

Full markdown / MDX body goes here.
```

The card appears on `/agents` and the detail page renders at `/agents/<slug>`.

### New platform topic

Create `src/content/platform/<slug>.mdx` with the same pattern — `title`, `summary`, `order` in frontmatter.

### New top-level section (handbook / engineering / people / news)

The content collection already exists in `src/content.config.ts`. To turn it on:

1. Add your first MDX file under `src/content/<section>/`.
2. Create `src/pages/<section>/index.astro` (list) and `[slug].astro` (detail) using `/agents/index.astro` and `/agents/[slug].astro` as templates.
3. Add the nav link in `src/components/Nav.astro`.

## Deploying

This repo is wired to Cloudflare Pages. Pushes to `main` deploy to production (`nightluna.com`). Pull requests get a preview URL at `<commit>.<project>.pages.dev`.

Auth is enforced at the edge by Cloudflare Access. No app-layer auth code.

## Brand

Use `public/luna-on-dark.svg` on Midnight surfaces, `public/luna-on-white.svg` on White. Never tint, stretch, or shear the wordmark. Display typography is D-DIN; everything else is Inter. No new accent colors.
