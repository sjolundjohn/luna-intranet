# Luna iOS — System-Locking Spine · Locked Patterns & Mass-Build Checklist

Seven self-contained archetype screens (`01`–`07`) that exercise the full component kit and lock every cross-feature pattern before the app is mass-built. Cross-screen consistency is the #1 priority — these must read as **one app**.

> **Revised per John's design review (2026-05-28).** The screen set dropped from 8 to 7: the standalone Active Session screen (`08`) was cut — its job (watching a live overnight session) is now served by the **Home dashboard** (`01`), whose hero CGM graph, Luna-delivery markers, and active-session greeting show Luna working in real time. See `CHANGES.md` for the full change log and open flags.

Everything below is **locked** unless the holistic review explicitly changes it. The mass-build should treat this file as the contract.

---

## How the files are structured

- Each screen is **one `.html` file**, links only `../../css/tokens.css`, no CDN/external deps, opens offline.
- Vanilla HTML/CSS/JS only. Inline JS appears only where interaction is genuinely shown (screen 03 slide-to-confirm, screen 05 toggle).
- **The shared `<style>` block is identical across all 7 files** (from the `<style>` tag through the `hr.divider` helper rule — verified byte-identical). It IS the locked frame + component kit. When mass-building, lift this block into a shared partial — do not let it drift per-screen. Per-screen styles are **appended below** the shared block under a labeled banner comment.
- The poster image on screen 02 is the only binary asset referenced (`../apollo-training/assets/video-posters/hi_res-c1-...Cam+A-7.jpg`).

---

## Locked: the frame

- **390pt screen inside a realistic BLACK BEZEL** (revised 2026-05-28 — the old white/Cloud-Lilac surround read wrong).
  - `.phone` — **414px** outer (390 screen + 12px bezel padding ×2); dark metallic gradient surround (`#2b2b30 → #0b0b0d → #000`), `border-radius:56px`, thin `#3a3a40` rim + `--shadow-modal`.
  - `.screen` — 390px wide, `border-radius:34px`, `min-height:780px`, flex column, `overflow:hidden`.
  - **Dynamic-Island cue** — `.screen::before` floats a 104×28 black pill over the status bar (`z-index:40`).
- **Status bar** (`.statusbar`, 54px) at top with `9:41` clock + signal/battery glyphs; **home indicator** (`.homebar`, 34px) at bottom. Both are safe-area chrome and appear on every screen. (Screen 03 raises `.homebar` z-index in its per-screen block so the indicator sits above the dose sheet.)
- **Content region** (`.content`) is the flex-1 middle. Tab bar (when present) and home bar are flex-none.

## Locked: force-dark surfaces

- **Every screen is dark. There is never a white/light full screen** — this is a locked product decision (bedside/guardian register).
- **Midnight gradient** (`midnight-deep → midnight → midnight-floor`) is the background for every screen (01–07).
- Cards on dark use `.card-dark` (`rgba(255,255,255,0.05)` fill, `rgba(255,255,255,0.10)` hairline border, `--radius-card`).
- A **light Soft-Paper surface (`.card-light`)** is allowed ONLY as a deliberately-elevated panel over a dark screen — currently just the dose-confirmation **bottom sheet** (screen 03), which mirrors iOS's real white-sheet chrome. Never a full light screen.

## Locked: type

- **D-DIN** everywhere (from tokens; SF Pro fallback). No second face.
- Use the **11-level iOS HIG scale classes from `tokens.css`** by name: `large-title, title-1, title-2, title-3, headline, body, callout, subhead, footnote, caption-1, caption-2`. The spine block re-colors these to `--color-on-dark` inside `.screen`.
- **Text color roles on dark:** primary `--color-on-dark` (#FFFFFF); secondary/quiet `--color-on-dark-sub` (#ACC1DF) via `.muted`; interactive/accent `--color-moonlight` via `.accent`.
- Screen titles: `large-title` for tab-root screens (Home, History), `title-1` for flows (onboarding headline, Settings header), `title-2/3` for step/checkpoint headlines.
- Big numerics (glucose, time hero, dose value) are 700/400 weight with `-0.03em`/`-0.04em` tracking and `tabular-nums`.

## Locked: color

- **8pt spacing** via tokens (`--space-*`); screen H-margins = `sm` (16) via `.pad`; card padding = `md` (24).
- Radii/shadows from tokens.
- **Critical = Plum `#8E3655`, never red.** Appears only as the CGM chart's **critical-low threshold line (70 mg/dL)** on the Home graph (01) and Session History graph (07). No red anywhere.
- Moonlight `#68D2DF` is the single interactive/accent color (CTAs, active tab, chevrons, links, active rings). Kept sparing per brand (≤7%).
- Success = Light Emerald `#B0F9B3` for status dots on dark (legible on Midnight); Emerald `#2E7D32` for the success state inside the white dose sheet.
- Warning/Clinical Amber `#F9CD86` is used ONLY for the flag pattern (below).

## Locked: the button

- One pill button (`.btn`), 52px, `--radius-pill`, 700 weight.
- **On dark surfaces, primary = Moonlight fill + Midnight ink** (`.btn.primary`) — per `system.jsx` PrimaryButton dark rule. (Inside the white dose sheet, the sheet's own buttons follow the light rule: Midnight fill + white text — that's the component's internal spec, intentionally.)
- `.btn.secondary` = transparent + white hairline border. `.btn.ghost` = Moonlight text link.

## Locked: the list row

- `.row` inside `.list` (a `.card-dark`-style container). Label left (`body`/17px, on-dark), value right (`--color-on-dark-sub`), **Moonlight chevron** right of value. Hairline `rgba(255,255,255,0.08)` divider between rows (not on first).
- Status rows use a Light-Emerald dot + label instead of a value (e.g. "Active", "Recent reading OK").
- Toggle (`.toggle`) is the iOS switch: track `rgba(255,255,255,0.18)` off → Moonlight on. **IOB Display defaults OFF.**

## Locked: the card

- `.card-dark` is the canonical content card on dark. Used for: compact status strip, glucose/CGM hero, TIR metrics, Active-Insulin card, session-summary card, date-range selector, session list, "Tonight" panel, settings groups (as `.list`).
- The **glucose display** (`.glucose`), **insight card** (`.insight`), and **tab bar** (`.tabbar`) are direct dark-surface translations of the kit's `preview/components-*` cards — same structure, dark-mode colors.

## Locked: Home dashboard — the CGM graph is the HERO (revised 2026-05-28)

Mirrors the 2021-approved Home/Dashboard (`5_Home/5.1`, `5.2`) so it feels familiar to existing users.

- **Greeting (replaces the old "Tonight" label):** warm + time-based. Morning = "Good morning, sunshine"; night / session-start = **"Good night, moonbeam"** (current). The night line is flagged — John may swap it (alternatives: "Rest easy — Luna's on watch" / "Sleep well tonight").
- **Compact top status strip** — System (✓ Automating) · Reservoir · Battery, a thin inline row (shrunk hard; mirrors 5.2).
- **Glucose + trend** header (big number + arrow), then the **hero CGM graph**, which dominates the screen:
  - **y-axis labelled in mg/dL up to 400** with gridlines at every 100.
  - **target-range band** (70–180) + **upper line** (Amber/warning at 180) + **critical-low threshold line at 70 = Plum** (never red).
  - **time x-axis** (10 PM → 4 AM).
  - **insulin-delivery markers**: small vertical Moonlight ticks above the axis, grouped to show when Luna dosed overnight (the key "Luna is working" signal). A legend explains the tick.
- **Time-in-range metrics shown explicitly** as three cells (In range / Above / Below) — never ambiguous dotted lines.
- **Active Insulin** is a small card below the metrics (mirrors 5.1; IOB to 0.1, capital "U").
- This screen **also serves the active-session role** (was screen 08): the live CGM graph, delivery dots, and "watching" greeting are the live-session view.

## Locked: the flag pattern ("flag, don't fabricate")

Two forms, both dashed Clinical-Amber, never invented values:

1. **Inline token** (`.token-flag`) — a genuinely-undecided value inside copy, shown as `[X]`. Used for the dose value on the training step (screen 02): "Dial `[X]` units…".
2. **Flag chip** (`.flag`) — a labeled "Open" chip for an undecided design/spec item. Used on screens 02, 04, 08. Format: `[OPEN] short description — owner`.

Open items currently flagged in the spine:
- `01` — **night-greeting line** ("Good night, moonbeam") — John may swap; alternatives noted on Home and in `CHANGES.md`. (Tracked as a CHANGES flag, not yet an on-screen chip.)
- `01` — **active-session error states** (occlusion, CGM loss) — moved here from the cut screen 08; the dashboard is now the live-session surface, so its error states live here. (Tracked as a CHANGES flag.)
- `02` — dose value `[X]` pending Eng/Clinical (on-screen chip).
- `04` — "verify-before-body order"; "error states — Eng/Clinical" (on-screen chips).

Rule for mass-build: **never replace a flag with a guessed number, error copy, or fake state.** Resolve it upstream, then update the token/chip.

## Locked: Apollo-feedback rules (baked into every relevant screen)

- **No "Watch again" affordance.** Videos auto-loop; the video tile (screen 02) shows an "Auto-loops" hint, never a replay button. (The old Apollo `_reference` `VideoStep` had a "Watch again" link — that is intentionally dropped here.)
- **Never gate "Next"/primary on hardware/Bluetooth status.** Checkpoints are **informative only**: screen 04's "Confirm and continue" is enabled regardless of connection state; screen 02's "Next" is never disabled.
- **Step-number badge sits TIGHT above its headline** (`.step-badge`, `margin:0 0 6px`) — screen 02.
- **Step copy is CENTERED in the content area at larger text** (revised 2026-05-28) — screen 02's "Fill the reservoir" headline (`title-1`) + instructions (`body`) are vertically centered via `.step-copy`, not crammed at the top.
- **Training progress is DOTS, not a line** (revised 2026-05-28) — `.prog-dots`: one dot per in-module step (7 for evening setup); done dots are dimmed Moonlight, the current step is an elongated bright Moonlight pill. So the user sees exactly where they are.
- **CGM status reads "Recent reading OK"** (never "Connected") — screens 04 and 05.
- **Hardware checkpoint shows a slow moon-in-orbit detect animation** (revised 2026-05-28) — `.orbit` (screen 04): a moon slowly orbits a center body, ~6s gentle CSS-keyframe loop (`lunaOrbit`, no JS libs), calm/mysterious. References the codebase OvernightScreen `lunaOrbit` pattern.
- **Dashed flag chip for any genuinely-undecided item** — see flag pattern above.

## Locked: Hypo Shield (renamed from "Basal Guidance", 2026-05-28)

The basal-dose feature is **"Hypo Shield"** everywhere in the spine (settings section + row label on 05, dose-sheet eyebrow on 03).

- **Dose-sheet rationale** (trust-building, screen 03): *"Over the past several nights, Luna Eclipse has been monitoring your glucose. We've noticed it's drifted up — you may need a bit more of your basal insulin."*
- **Two-part action loses the brand name** and uses **generic "long-acting insulin"** (NOT "Lantus (U-100)"):
  1. *"Set your long-acting insulin dose to 14 units in Luna's settings"*
  2. *"Take your 14-unit long-acting dose."*
- The "14" dose value is the working placeholder (see flag below — the on-screen value may still move with Eng/Clinical).

## Locked: nav model

- Bottom **tab bar** = **Dashboard · Session History · Settings**. Active tab uses Moonlight (icon + label); inactive uses `--color-on-dark-sub`. Active tab carries `aria-current="page"`.
- Tab bar appears on the three tab-root screens: `01` (Dashboard), `05` (Settings), `07` (Session History).
- Flow screens (`02` training, `04` checkpoint, `06` onboarding) have **no tab bar** — they're modal/flow contexts. The dose sheet (`03`) sits over a tabless dimmed backdrop.
- Push/flow headers use a **Moonlight back arrow** (`‹` or chevron). Settings nav header (`05`) is Moonlight back + bold title, **no divider** (whitespace only).

## Decision: per-module progress (locked)

The training progress header counts **within the current module, not across the whole 10-step setup.** Screen 02 reads **"Evening setup · Step 3 of 7"** (the evening module is steps 1–7; morning removal is its own module, 8–10). Rationale:
- The user does the full 10-step sequence only on first setup; every subsequent night is just the ~7 evening steps. Counting "3 of 10" would misrepresent the recurring nightly effort and feel longer than it is.
- Module-scoped progress matches the recurring mental model ("tonight's setup") and the brand's calm, "this is short" framing.
- Progress is rendered as **dots** (`.prog-dots`), one per in-module step (7 for evening setup), with the current step elongated — revised 2026-05-28, was a fill bar. The text count ("Step 3 of 7") stays.

Mass-build: progress headers are always module-scoped, shown as dots. Morning removal renders as its own "Morning removal · Step N of 3" module.

## Recurring "Tonight" panel (locked)

A persistent card (`.tonight-panel`, on `.card-dark`) that visualizes the user's first night and **fills in as setup progresses**. Spine order: **pair Luna Controller → pair CGM → enter TDBD.** Done steps get a filled Moonlight check; the current step is marked "Next" and muted. It carries the same fraction affordance ("2 of 3 ready") used elsewhere. This panel recurs across onboarding chapters; keep its structure and order identical wherever it appears.

On the **onboarding chapter (06)** the panel uses a **`.decompressed`** modifier (revised 2026-05-28): pushed further down, with more internal row padding and line-height for easier reading. The chapter tagline **"Luna takes the night watch" must stay on ONE line (no wrap)** — `.chapter-tagline` enforces `white-space:nowrap` at a fitted size.

## Locked: Session History — mirrors the 2021 original (revised 2026-05-28)

Screen 07 was rebuilt to mirror the approved `6_Session History` screens so nothing they thought through is lost:
- **Date-range selector** (`.daterange`) at top — Start / End date with calendar glyphs (mirrors 6.2 Filter), plus a filter icon in the header.
- **Summary** (`.sumrow`, mirrors 6.4): an in-range **ring** + a metrics column showing **Total insulin delivered**, **Highest glucose**, **Lowest glucose**.
- Per-night **CGM graph** with the Plum critical-low line + insulin-delivery ticks.
- **IOB on board at wake** to 0.1, capital "U".
- A **session list** (`.sess-list`, mirrors 6.1): month header + date-range rows ("5/26 – 5/27", "5.0 U delivered · 80% in range") with Moonlight chevrons.

---

## Mass-build checklist (per new screen)

- [ ] Links only `../../css/tokens.css`; opens offline; no CDN/external deps.
- [ ] Uses the shared spine `<style>` block (frame + kit) verbatim — do not fork. Per-screen styles appended below it under a labeled banner.
- [ ] 390pt screen inside the **black bezel** (`.phone`, 414px) with status bar + home indicator + Dynamic-Island cue.
- [ ] Force-dark: Midnight gradient. No light full screens; light only for the dose sheet chrome (03).
- [ ] Type via HIG class names; on-dark color roles (`.muted` / `.accent`) applied.
- [ ] Spacing via `--space-*` (H-margins `sm`, card padding `md`); radii/shadows from tokens.
- [ ] Buttons are `.btn` (Moonlight primary on dark). List rows are `.row`/`.list`. Cards are `.card-dark`.
- [ ] Critical is Plum, never red. Moonlight kept sparing.
- [ ] Tab bar present + correct active tab IF a tab-root screen; otherwise omitted.
- [ ] Progress as module-scoped **dots** ("Evening setup · Step N of 7").
- [ ] No "Watch again"; no gating Next on hardware; step badge tight above headline; CGM = "Recent reading OK".
- [ ] Basal-dose feature is named **Hypo Shield** (not "Basal Guidance"); dose steps use generic **long-acting insulin**.
- [ ] Any undecided value/state is a `.token-flag` `[X]` or a `.flag` chip — never fabricated.
- [ ] IOB shown to 0.1 with capital "U".
