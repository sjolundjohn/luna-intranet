# Spine revision — change log (John's design review, 2026-05-28)

Revision of the Luna iOS system-locking spine per John's review. The spine
dropped from **8 screens to 7**; `08-active-session.html` was deleted and its
role folded into the Home dashboard. Every change is listed per the review
points below.

All rules held: self-contained HTML, each links only `../../css/tokens.css`,
no CDN/external deps, force-dark, D-DIN, 8pt spacing, **Plum-not-red**, and the
shared `<style>` frame/kit block is **byte-identical across all 7 screens**
(verified by hash) — only labeled per-screen styles, appended below the shared
block, differ.

---

## What I mirrored from the 2021 approved originals

Studied `…/Approved Design 6-17-2021/5_Home/` (5.1 Dashboard, 5.2 Home System On)
and `…/6_Session History/` (6.1 list, 6.2 Filter, 6.3 date wheel, 6.4 detail).

- **Home / Dashboard (5.1, 5.2):** big glucose number + trend arrow at top; a
  full-height CGM graph with a **y-axis to 400 mg/dL** and gridlines every 100;
  a **time x-axis** (10 PM → 4 AM); **insulin deliveries drawn as small vertical
  tick marks above the x-axis**, grouped (1 @ 1 AM, 2 @ 2 AM, 4 @ 3 AM); a small
  **Active Insulin** card just below the graph; and (from 5.2) a **compact top
  status strip** — System (✓ Automating) · Reservoir · Battery.
- **Session History (6.1, 6.2, 6.4):** a **date-range selector** (Start / End
  with calendar glyphs); a **Summary** block with an **in-range ring** plus
  **Total insulin delivered / Highest glucose / Lowest glucose**; a per-night
  **glucose graph**; and a **session list** (month header + date-range rows
  reading "X units delivered · Y% in range" with a chevron).

These are the affordances that made the originals feel calm and legible, so the
rebuilds read as familiar to existing users.

---

## 1 — iPhone frame → realistic black bezel  *(global, shared block)*

- `.phone` rebuilt as a black bezel: 414px outer (390 screen + 12px bezel ×2),
  dark metallic gradient `#2b2b30 → #0b0b0d → #000`, `border-radius:56px`, a thin
  `#3a3a40` rim, `--shadow-modal`.
- Added a **Dynamic-Island cue**: `.screen::before` floats a 104×28 black pill
  over the status bar (`z-index:40`).
- Applied identically in the shared block across all 7 screens. The gallery
  `index.html` frame radius bumped 44 → 56 to match.

## 2 — Home / Dashboard: CGM graph is the HERO  *(`01-home-dashboard.html`)*

- **Top and bottom cards shrunk dramatically.** The old large status card +
  big glucose hero + insight/"See the night" card were replaced by a thin
  **status strip** (System · Reservoir · Battery) and a compact **Active Insulin**
  row, freeing the middle for the graph.
- **CGM graph rebuilt as the hero:** y-axis labelled **0–400 mg/dL** with
  gridlines; **target band 70–180**; upper line at 180 (Amber/warning);
  **critical-low threshold at 70 = Plum (never red)**, labelled "70 low";
  **time x-axis** 10 PM → 4 AM.
- **Insulin-delivery markers plotted on the graph** — Moonlight vertical ticks
  above the axis, grouped to show Luna dosing overnight, with a legend
  ("= Luna delivered insulin").
- **Time-in-range shown explicitly** as three cells: In range 92% / Above 6% /
  Below 2% (no ambiguous dotted lines).
- **Greeting** replaces the old "Tonight": **"Good night, moonbeam"** (night /
  session-start), subtitle "Luna's on watch · session started 10:42 PM". Morning
  variant documented as "Good morning, sunshine". *(See open flag — night line.)*
- This screen now also serves the **active-session** role (see point 8).

## 3 — Training step: progress dots + centered, larger copy  *(`02-training-step.html`)*

- Progress indicator changed from a **fill line to dots** (`.prog-dots`): one dot
  per in-module step (7 for evening setup); done dots dimmed Moonlight, the
  current step an elongated bright Moonlight pill. Text count "Step 3 of 7" kept.
- Video tile, its placement, the "Auto-loops" hint, and the **Step 03** badge are
  unchanged.
- "Fill the reservoir" headline + instructions were crammed at the top — now
  **centered in the content area** (`.step-copy`) with **larger text**
  (headline `title-1`, instructions `body`).

## 4 — Hypo Shield (renamed from "Basal Guidance")  *(`03`, `05`)*

- Renamed **everywhere**: dose-sheet eyebrow (03), settings section label + row
  label (05) now read **"Hypo Shield"** (05 previously had a one-word
  "HypoShield" — fixed).
- **New rationale copy (03):** "Over the past several nights, Luna Eclipse has
  been monitoring your glucose. We've noticed it's drifted up — you may need a
  bit more of your basal insulin."
- **Two-part action, no brand name, generic long-acting insulin (03):**
  1. "Set your long-acting insulin dose to 14 units in Luna's settings"
  2. "Take your 14-unit long-acting dose."
  (Not "Lantus (U-100)".) The "Current TDBD" caption was generalized to
  "Current dose".
- The 03 dimmed backdrop greeting was updated to "Good night, moonbeam" to match
  the new Home greeting.

## 5 — Hardware checkpoint: moon-in-orbit animation  *(`04-hardware-checkpoint.html`)*

- Kept the checkpoint (still informative-only; "Confirm and continue" never
  gated; connection rows + flags intact).
- Replaced the static concentric-ring detect visual with a **slow, calm,
  mysterious moon-in-orbit animation** (`.orbit`): a moon slowly orbits a center
  body on a ~6s gentle CSS-keyframe loop (`lunaOrbit` + a soft glow pulse), no JS
  libraries. References the codebase OvernightScreen `lunaOrbit` pattern.

## 6 — Onboarding chapter: decompressed  *(`06-onboarding-chapter.html`)*

- **"Luna takes the night watch" tagline stays on ONE line** (`.chapter-tagline`,
  `white-space:nowrap`, fitted size).
- The **"2 of 3 ready" Tonight panel pushed down** (`margin-top` 18 → 36px) with
  **more internal spacing and line-height** (row padding 11 → 16px, step text
  15 → 16px / line-height 1.5) via a `.decompressed` modifier.

## 7 — Session History: rebuilt to mirror the original  *(`07-session-history.html`)*

- Added **Total insulin delivered** (was missing) — surfaced prominently in the
  Summary metrics (5.0 U) and on each session-list row.
- Added a **date selector** (was missing) — a Start / End date-range bar with
  calendar glyphs (mirrors 6.2), plus a filter icon in the header.
- Added the **in-range ring** + **Highest / Lowest glucose** metrics (mirrors
  6.4 Summary), and a **session list** (month header + date-range rows) mirroring
  6.1. Kept the per-night CGM graph (with Plum critical-low line + delivery ticks).
- **IOB residual kept to 0.1 with a capital "U"** ("0.1 U on board at wake").

## 8 — Active session: CUT  *(`08-active-session.html` deleted)*

- Deleted `08-active-session.html`. Its purpose (watching a live overnight
  session) is now served by the **Home dashboard** (point 2): the hero CGM graph
  + Luna-delivery ticks + "Good night, moonbeam / Luna's on watch · session
  started 10:42 PM" status are the live-session view.
- `index.html` gallery updated to **7 screens** (08 cell removed; "Eight" → "Seven";
  descriptions refreshed). `SPINE-NOTES.md` updated to a 7-screen contract.
- The "active-session error states" open item was **moved onto Home as a flag**
  (see below), since Home is now the live-session surface.

---

## Open flags (carried forward / new)

On-screen `.flag` chips (unchanged):
- **02** — dose value `[X]` — pending Eng/Clinical.
- **04** — "verify-before-body order"; "error states — Eng/Clinical".

Tracked flags (documented here + in SPINE-NOTES, not yet on-screen chips):
- **Night-greeting line (01)** — "Good night, moonbeam" is the current night /
  session-start line; **John may swap it.** Alternatives offered:
  "Rest easy — Luna's on watch" / "Sleep well tonight". Morning line is
  "Good morning, sunshine".
- **Active-session error states (01)** — occlusion, CGM loss, etc. Moved from the
  cut screen 08; Home is now the live-session surface, so these belong here.
- **Dose value (03)** — the on-screen "14 units" is the working placeholder; the
  real value still rests with Eng/Clinical (kept aligned with the 02 `[X]` flag).
- **Verify-before-body order (04)** — sequencing of the hardware/CGM verify step
  relative to attaching to the body — still open with Eng/Clinical.

## Verification

- All 7 screens link only `../../css/tokens.css`; no CDN/external deps; open
  offline. (grep-verified.)
- No red anywhere; critical = Plum on the CGM threshold lines only. (grep-verified.)
- The shared frame/kit `<style>` block is **byte-identical across all 7**
  (single SHA verified); only labeled per-screen sections differ.
- All 7 screens rendered headless and visually confirmed.

---

# Second revision — change log (John's r2 review, 2026-05-28)

Round-2 fixes to the spine per John's review. All locked rules held: self-contained
HTML, each links only `../../css/tokens.css`, no CDN/external deps, force-dark,
D-DIN, 8pt spacing, **Plum-not-red**, and the shared `<style>` frame/kit block is
**byte-identical across all 7 screens** (re-verified by SHA after the edits) — only
labeled per-screen sections differ.

## Global — frame + gallery

- **1. Luna wordmark on EVERY screen.** Added the on-dark wordmark
  (`../../assets/luna-on-dark.svg`) as a shared `.brandbar` flex-none row directly
  under the status bar — small (~15px), top-left, never stretched/recolored. It
  clears the status-bar clock (left) and the Dynamic-Island cue (center). The CSS
  lives in the shared block (still identical across all 7); the one-line `<img>`
  markup is inserted after each status bar. On 03 the brandbar is raised above the
  dim scrim (`z-index:30`).
- **2. Gallery (`index.html`) — no white boxes, no scrollbars.** Each screen now
  shows as just its **black-bezel phone on the dark canvas**: the per-phone white
  card wrapper and scrollbars are gone. The iframe is oversized and offset
  (`translate(-16px,-40px)`) inside a bezel-sized `.frame` with `overflow:hidden`,
  cropping out each screen file's light page background + 40px body padding. Phones
  sit in a **tidy, centered, even grid** (fixed 300px columns; larger gaps). Home's
  gallery description updated (TIR → "Luna insight + Ask Luna chat").
- **3. Frame clips to the bezel.** `.screen` changed from `min-height:780px` to a
  **fixed `height:780px`** (shared block), so overflowing content scrolls INSIDE
  the clipped screen rather than growing the bezel. Added a **hidden scrollbar**
  (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`) to `.content` in
  the shared block. Nothing bleeds outside the bezel; tab bar + home indicator stay
  pinned.

## Home dashboard (01)

- **4. Greeting + "session started" removed**; the **system-status cards now lead**
  the screen (System · Reservoir · Battery strip moved to the top).
- **5. CGM graph full-width + y-axis on the RIGHT.** Plot area redrawn to span the
  full card width (no left gutter); the 0–400 mg/dL labels are right-anchored.
  Target band, Amber 180 line, Plum 70 critical-low line, trace, and the grouped
  insulin-delivery ticks were all rescaled to the new full-width geometry.
- **6. Time x-axis labels** are now **plain quiet text, no block/background.**
- **7. Time-in-range metrics removed** from Home entirely (the `.tir-row` markup is
  gone; the CSS was replaced by the insight/chat styles).
- **8. Active-insulin row is IOB-gated** — **OFF by default** (not rendered). It
  appears only when the IOB Display flag is ON (Settings · 05, defaults OFF). The
  **IOB-on variant** is preserved as an HTML comment in `01` for the mass-build.
- **9. Insights + chat area added** where the TIR metrics were: a compact
  **Luna insight card** ("Steady night. …", moon glyph + Moonlight lead) plus an
  **"Ask Luna anything…" chat widget** (rounded entry, moon icon, Moonlight send
  arrow). This is the new calm companion to the graph.

## Dose confirmation (03)

- **10. Sheet no longer occluded by the island.** `.sheet-host` is now capped below
  the Dynamic-Island/notch safe area (`top:62px`) and the sheet's top padding was
  bumped, so the grabber + "Hypo Shield" eyebrow + "A new nightly basal dose" title
  are fully visible. The sheet scrolls internally (hidden scrollbar) if tall.
  Verified in a screenshot: the title and first line are unobstructed.

## Session history (07)

- **11. Scrolls inside the frame.** With the fixed-height screen + clipped `.screen`,
  the (intentionally tall) content scrolls within `.content` (`overflow-y:auto`,
  hidden scrollbar); the tab bar + home indicator stay pinned and nothing overflows
  the bezel. The total-insulin + date selector + in-range ring + metrics from the
  last round are unchanged.

## Verification (r2)

- Headless render-verified (temporary local static server + headless Chrome
  screenshots; `.claude/launch.json` untouched) for all 7 screens + the gallery.
  Confirmed: **logo top-left on every screen**; **gallery has no white box / no
  per-phone scrollbars** and a clean even grid; **Home** has the right-side full-width
  axis, no time-label blocks, no TIR, the insight + Ask-Luna widgets present, and no
  active-insulin by default; **dose title not occluded**; **session history scrolls
  cleanly inside the frame** with chrome pinned.
- Shared frame/kit `<style>` block re-verified **byte-identical across all 7** after
  every r2 edit. No red anywhere; critical = Plum on the threshold lines only. All 7
  link only `../../css/tokens.css`.

---

# Third revision — change log (John's r3 review, 2026-05-28)

Two small Home-dashboard (`01`) refinements. Both land **only in `01`'s labeled
per-screen styles + body markup** — the shared frame/kit `<style>` block is
**unchanged and re-verified byte-identical across all 7** (SHA `710063a9…`). All
locked rules held: self-contained, links only `../../css/tokens.css`, no CDN,
force-dark, D-DIN, tokens.

## Home dashboard (01)

- **1. Top status-card text a touch bigger.** The lead system-status strip's
  primary value (`.statusstrip .lbl .v` — "Automating", "Full", "86%") bumped
  **one HIG step, 12px → 13px** (caption-1 → footnote in `tokens.css`), staying
  within the HIG type scale. A touch more prominent; nothing else changed.
- **2. "Ask Luna" is now a discreet "+" launcher (Whoop-Coach style).** The
  previously-inline "Ask Luna anything…" chat entry was replaced by a small
  **circular Moonlight "+" FAB** (44px tap target, bottom-right of the content
  area, above the tab bar; `box-shadow:0 3px 14px rgba(104,210,223,0.40)`), calm
  and discreet when collapsed. **Tapping it reveals** the inline chat entry inside
  a small panel (`.ask-panel`) with an **"ASK LUNA" header + close (×)
  affordance**; the existing moon glyph + "Ask Luna anything…" + Moonlight send
  arrow are reused unchanged. Closing collapses back to the bare "+". State is a
  tiny inline JS toggle (`data-open` on `.ask-host`: collapsed → `.ask-fab`
  shown; expanded → `.ask-panel` shown). The **Luna insight card stays visible**
  the whole time — only the chat entry is launcher-gated. (`SPINE-NOTES.md`
  updated accordingly.)

## Verification (r3)

- Headless render-verified (temporary local static server + headless Chrome
  screenshots; `.claude/launch.json` untouched). Confirmed: **bigger top-card
  text** (13px status values); **discreet "+" FAB present** bottom-right when
  collapsed with the insight card visible; **tapping the "+" reveals** the
  "Ask Luna" chat panel (header + close ×). Both collapsed and expanded states
  captured.
- Shared frame/kit `<style>` block re-verified **byte-identical across all 7**
  after the edits (SHA `710063a9…`); only `01`'s labeled per-screen section +
  markup changed. No red; tokens-only; links only `../../css/tokens.css`.
