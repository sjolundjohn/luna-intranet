# Apollo Training — v2.3 Revision Pass (RE-BASED on live source)

**Re-base note (2026-06-03):** Work was initially started against a stale local React export (`~/Downloads/apollo_work`, v2.2, 16 screens). John flagged that the live designs on **nightluna.com/tools/ux-review** had moved ahead. The authoritative source is **this repo** (`Luna_AI_Intranet`, Astro → nightluna.com), Apollo = **20 screens** as `src/components/ux/screens/Apollo*.astro`. All work is re-based here. Branch: `apollo-v2.3-revisions`. Source PDF: "Apollo Training Fixes.pdf". **PDF is the authoritative change set** (tool review comments ignored per John). John handles merge + deploy.

## Locked decisions
- D1 metric term = **TDBD** (real component `TdbdDetailScreen.astro` confirms). Replace TDD/TDVD everywhere.
- D2 numbering: evening = **6 numbered** + 1 un-numbered Pending interstitial → "Step N of 6". Morning = **3 numbered** → "Step N of 3".
- D3 Training Start sheet sits over the **real** `DashboardScreen.astro` (no placeholder needed).
- D4 Overnight peaceful sleep image = placeholder until John sends real asset.
- D5 reservoir term = **Single-Sleep Reservoir** everywhere.
- D6 version bump v0.2 → **v0.3 — Jun 2026** (`src/lib/ux-review.ts`).
- D7 dedup: **merge "Open tray" + "Remove label" → one Step 02 "Open the Single-Sleep Reservoir"**; DELETE `ApolloStep04Screen` (remove-label); renumber Attach/Remove-base/Apply → 04/05/06.
- D8 **delete** `apollo-mid-session-resume` + `apollo-replay-from-settings`.
- G8 renames (all copy): Controller→**Capsule** · Reservoir→**Single-Sleep Reservoir** · Charger→**Bedside Charging Dock** · Algorithm→**Luna Eclipse** · TDD/TDVD→**TDBD**.

## Target flow
**Evening:** Training Start (NEW, over dashboard) → Training Gate (NEW, conditional) → Intro → 01 Inventory → 02 Open the Single-Sleep Reservoir (merged) → 03 Fill → 04 Attach Capsule → *Pending (NEW, un-numbered)* → 05 Remove from base → 06 Apply to body → ~~Hardware Checkpoint~~ (removed) → ~~Evening Outro~~ (removed) → Overnight Handoff (redesign).
**Morning:** Training Start (NEW, +4h, restart at 1) → Morning Start (redesign, dots) → 01 Remove Luna → 02 Unclip capsule (+hw check) → 03 Charge Capsule (+hw check) → Morning Outro+Complete (MERGED) → ~~Mid-session resume~~, ~~Replay from settings~~ (removed).

## TIER 1 — GLOBAL (targets in this repo)
| ID | Change | Target | Status |
|----|--------|--------|--------|
| G1 | Logo **2.5×** (John) | `ios-spine.css` `.brandbar .luna-mark` height 20→**50** | ☑ |
| G2 | Lift CTAs / bottom padding (**more** breathing room) | `ApolloStep.astro` 8→**28**; `ApolloStep01`/`ApolloIntro` 8→28 (bespoke screens that persist) | ☑ |
| G3 | Looser text spacing (**more**) | `ios-spine.css` `.step-copy .instr` 14→**24**px, lh 1.65; Intro body 14→20px; Inventory headline mb 14→20 | ☑ |
| G4 | Remove duplicate step badge (keep header count) | `ApolloStep.astro` + `ApolloStep01Screen` step-badge removed | ☑ |
| G7 | Version bump v0.2→v0.3 | `src/lib/ux-review.ts` DESIGN_VERSIONS + CURRENT | ☑ |
| G8 | Component renames | per-screen copy (applied during T3) + shared comps | ☐ |

> Tier-1 scope note: 8 Apollo screens are bespoke (don't use `ApolloStep`). Persisting-as-is bespoke screens (Intro, Inventory) got the global treatment now. The rest (Overnight, Morning Start, both Outros, Complete + the two being deleted) are redesigned/removed in Tier 2 — they'll inherit the global standard (logo 50px is already global via CSS; CTA 28px + spacing applied during their rebuild). EveningOutro/MorningOutro own `.step-badge` instances are handled in Tier 2 (removed/merged).

## TIER 2 — FLOW (registry/routing/structure)

### Pass 2a — removals + renumber + merge  ✅ DONE
- Removed (app-map 58→52; Apollo 20→13 in tool): apollo-step-04-remove-label, apollo-hardware-checkpoint (+hardware-checkpoint-spine dropped from evening flow display), apollo-evening-outro, apollo-morning-outro, apollo-mid-session-resume, apollo-replay-from-settings.
- Merge: morning outro folded into **apollo-complete** (survivor; Tier-3 redesign pending).
- Renumber evening → **of 6** in wireframes (`ApolloStep01/02/03/05/06/07` count/total/current + dots) AND gallery titles/summaries (manifest). Slugs/filenames unchanged (internal) to avoid churn; gallery title for attach/remove-base/apply now reads Step 04/05/06.
- Rewired `FLOW_NEXT` + `FLOWS` (evening 8 screens, morning 5). Verified: kept screens 200, removed 404, no compile errors.
- NOTE: ScreenRenderer still has harmless dead REGISTRY/import entries + orphaned `.astro` files for removed screens (not routed/displayed). Clean up later if desired.

### Pass 2b — new screens  ✅ DONE
Built + fully wired (component + ScreenRenderer import/REGISTRY/FRAME + app-map entry + FLOWS insert + FLOW_NEXT). All routes 200, verified in browser:
- **ApolloTrainingStartScreen** (`apollo-training-start`) — bottom sheet over a dimmed Home backdrop (status + glucose + overnight graph), "Yes, let's start / No, I'll do it later". FRAME sheet+clock 10:42.
- **ApolloTrainingGateScreen** (`apollo-training-gate`) — conditional gate, condition checklist (TDBD Set ✓, Capsule Not detected ⚠, CGM OK ✓), "Go to setup" → onboarding-setup-landing.
- **ApolloPendingScreen** (`apollo-pending`) — un-numbered interstitial, orbit animation "Luna is getting ready" + CGM/capsule/priming checks + AUTO/failure flag.
- **ApolloTrainingStartMorningScreen** (`apollo-training-start-morning`) — morning sheet over dashboard, "Yes, let's go / Not yet". FRAME sheet+clock 7:08.
- Backdrop note: used the canonical sheet-over-`.content.backdrop` pattern (StatusStrip+glucose+CgmHero), NOT the full DashboardScreen — the full dashboard's TabBar/Ask-Luna are positioned elements that bled through the scrim. Faint CgmHero legend peeks behind the transparent secondary button (negligible).
- Flow head now: onboarding-chapter-5 → apollo-training-start → intro; attach-capsule → pending → remove-base; overnight → training-start-morning → morning-start; complete → home-dashboard.

**Apollo now 17 screens in the tool** (13 kept + 4 new).

### Pass 2c — adjustments (John review)  ✅ DONE
- **Training Start (both)**: now a distinct **white card** (clear border, grab handle, shadow), ~half-screen `min-height`, dark text, both buttons grouped & visible (secondary no longer cut off). Switched backdrop from full DashboardScreen to the canonical sheet-over-`.content.backdrop` pattern to kill the TabBar/Ask-Luna bleed-through.
- **Cross-step consistency**: `.step-copy` now top-anchored + left-aligned (was vertically centered) so every step's title sits in the same place just below the media tile; Inventory heading bumped `title-2`→`title-1` to match. (`src/styles/ios-spine.css`)
- **Pending**: replaced the radar/orbit (machine-like) with a soft breathing **moon glow** + gentle dots; dropped the technical conn-row checklist; calmer copy.
- **Astro gotcha:** component `<style>` for `.ux-ios`-prefixed selectors must be `is:global` (scoped styles silently didn't match the `.ux-ios` ancestor). Applied to the 3 new screens' style blocks.

## TIER 3 — PER-SCREEN COPY  ✅ DONE
- **Intro**: → "Let's get you ready for your first sleep with Luna" + new subtext.
- **Evening module label** unified → "Getting ready for your first sleep" (all evening steps, for consistency; replaces "Evening setup").
- **Step 01 Inventory**: still tile — removed play button + auto-loops; subtle heartwarming float/glow animation on the 3 items.
- **Step 02 (merged)**: "Open the Single-Sleep Reservoir" + "Place on a hard surface and peel the label…".
- **Step 03 Fill**: "Fill the Single-Sleep Reservoir" + dial-[X]-units/insert-pen/press instruction (token preserved) + **Warning: only fill LUNA with your rapid-acting insulin**.
- **Step 04 Attach**: "Attach the capsule to this Single-Sleep Reservoir" + align/snap/watch-orientation copy.
- **Step 05 Remove from base**: "Lift Luna Off From The Base" + both-hands copy + **exposed-needle warning**.
- **Step 06 Apply**: "Apply LUNA to your body" + any-injection-site copy + **tip: retain the base for disposal**.
- **Overnight** (redesign): calm peaceful-sleep image placeholder, no time, Phase-2 intro card.
- **Morning Start** (redesign): sunrise + opening flower, "Good morning — a fresh start", dots from the beginning.
- **Step 08 → Remove Luna**: "Good Morning, Sunshine — Time to Remove Luna and Start Your Day" + peel-adhesive copy + exposed-needle warning. (gallery title "Step 01 — Remove Luna")
- **Step 09 → Unclip**: "Unclip the Luna capsule from the Single-Sleep Reservoir" + **hardware check gates Next**; removed the old "recent reading OK" footer. (gallery "Step 02 — Unclip capsule")
- **Step 10 → Charge Capsule**: "Place Luna on the Bedside Charging Dock" + **hardware check gates Done**; confusing controller-charger image removed (poster-TBD). (gallery "Step 03 — Charge Capsule")
- **Complete** (redesign, merged morning outro): sunrise/flower, "This is where Luna really begins", TDBD-learning message (non-technical), "Luna is learning" card.
- **G8 renames** applied throughout live copy (only the deleted/orphaned screens still contain legacy terms — not rendered).
- All routes 200, clean build. Verified in browser.

## Preview/verify
`pnpm dev` in repo → screenshot each tier via Luna Chrome. John reviews per tier; John merges + deploys.

## ROUND 3 — review feedback (John)  ✅ DONE
- **Capitalization**: "Capsule" capitalized everywhere; on-screen titles normalized to **sentence case** (first word + proper nouns: Luna, Capsule, Single-Sleep Reservoir, Bedside Charging Dock, TDBD). FLAG: if you want Title Case instead, it's a quick flip.
- **Warnings/tips → design-guideline banners**: replaced dashed `.flag` chips with the filled `.reset-banner` (warning) and a new `.tip-banner` (moonlight, info). Applied to Step 03 (insulin), Step 05/remove-base (needle), Step 06/apply (disposal tip), Step 08 (needle).
- **Intro** subtext → "Next is a quick walkthrough… about 5 to 10 minutes."
- **Step 01**: real staggered **entrance** animation (slide-up + fade + glow pop), replacing the too-subtle float.
- **Step 02**: gallery title → "Open Reservoir"; subtext → "Place on a hard surface and peel the label."
- **Step 03**: gallery title capital "Reservoir"; instr trimmed ("…to fill with insulin").
- **Pending**: "Luna is checking the stars are aligned"; body drops "tonight".
- **Step 06/apply**: "Apply Luna…" (LUNA→Luna).
- **Morning training start**: "Ready to remove Luna and start your day?"
- **Morning start**: "Good morning, sunshine"; hero redesigned — brighter sunrise + colorful blooming flower, faster.
- **Step 08**: "Remove Luna and start your day".
- **Complete**: hero matches the vivid sunrise/flower; **fixed layout** so the "Luna is learning" card no longer overlaps "Go to dashboard".
- **SOONA mapping** references removed from all live step screens.
