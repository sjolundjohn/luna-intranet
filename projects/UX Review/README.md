# Luna iOS — UX Review Component Kit

The design-system foundation for the Luna **iOS app** review platform. Portable, framework-agnostic HTML/CSS — open any file directly (no build, no CDN). Produced in the personal workspace (Project B); the nightluna **platform** that displays it is built per `INFRASTRUCTURE-BRIEF.md` (Project A).

> This is the **iOS app** design system — intentionally distinct from the nightluna intranet's own `src/styles/global.css` (which uses Inter for body + smaller radii). The iOS system uses **D-DIN everywhere**, the **11-level iOS HIG type scale**, and larger radii (card 20 / modal 28). When ported into Astro, scope these tokens to the wireframe/component render area only.

## View it

Open `index.html` in any browser (double-click / `file://`). It links:
- `brand.html` — brand guidelines (logo, color + guardrails, type, spacing, radii, elevation, voice/imagery)
- `components.html` — iOS component board (live previews; each name = future Figma layer name)
- `dose-confirmation/index.html` — the interactive two-step dose-confirmation component (all 6 states)

## Structure

```
projects/UX Review/
├── index.html              hub
├── brand.html              brand guidelines (embeds preview/ cards)
├── components.html         iOS component board (embeds preview/ cards)
├── dose-confirmation/
│   ├── index.html          vanilla, interactive port (no React/CDN)
│   └── DoseSheet.jsx        original React reference (from Claude Design)
├── css/tokens.css          canonical iOS design tokens (D-DIN, HIG type, 8pt, radii, shadows)
├── preview/                21 self-contained reference cards (tokens + components)
├── assets/                 luna-on-dark.svg, luna-on-white.svg, favicon.svg
├── fonts/                  D-DIN woff2 (regular/bold) + Italic OTF
└── INFRASTRUCTURE-BRIEF.md  handoff spec for the nightluna platform build
```

## Sources

- Tokens + preview cards + assets: Luna design-system bundle (Claude Design), authoritative source `luna-design-context-v2.md`.
- Dose component: `DoseSheet.jsx` (Claude Design two-step dose-confirmation bundle). The vanilla `dose-confirmation/index.html` is a faithful, dependency-free port; keep the `.jsx` as the React reference for the Astro port.

## Two-part action (why the dose component is the way it is)

Acting on a Luna basal recommendation requires **both**: (1) update the programmed TDBD setting in Luna, **and** (2) take the actual physical dose. Neither alone is sufficient. The component surfaces both as explicit acknowledgements that gate the slide-to-confirm gesture — you cannot confirm until both are acknowledged.

## Porting into Astro (nightluna)

1. Copy `css/tokens.css` into the repo (e.g. `src/styles/ios-tokens.css`); scope it to the UX Review render area so it doesn't collide with the intranet's `@theme`.
2. Re-implement the component-board components and the dose component as `.astro` components (markup + token classes are 1:1). The `preview/` cards and `DoseSheet.jsx` are the reference.
3. Fonts already exist in the repo (`public/fonts/d-din-*`); reuse those.
4. Component names here = `.astro` component names = Figma layer names.

See `INFRASTRUCTURE-BRIEF.md` for the full platform spec (nav, comments, notifications, views, artifact contract).
