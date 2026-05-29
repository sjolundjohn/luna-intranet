# Luna iOS Wireframes → Native Astro Components — Implementation Guide (Option B)

**For:** the Luna intranet ("Project A") build instance.
**Status:** contract. This is the doc the Luna instance builds from.
**Date:** 2026-05-29.
**Read-only inputs:** the wireframes in `projects/UX Review/wireframes/`, `app-map.full.json`, the per-feature `app-map.json`s, `_spine/SPINE-NOTES.md` (the locked design contract), `COVERAGE-AUDIT.md`, and the already-built Project A platform under `src/`.

---

## 1. Goal & scope

Turn the completed Luna iOS wireframes into **native Astro iOS components**, rendered inside the existing UX-review tool via the `component:<id>` convention that Project A already understands (`src/lib/ux-review.ts` → `componentId()`). Each in-scope screen becomes a self-contained `.astro` composition that reuses a shared iPhone-frame wrapper and a shared component kit — not a one-off HTML blob, and not a rasterized image.

**Why Option B (native components, not screenshots):** the screens already live as self-contained, offline HTML in `wireframes/`; the kit is consistent and locked (SPINE-NOTES); and Project A's renderer (`ScreenRenderer.astro`) was built from day one to resolve a screen id to a native `.astro` artboard ("When Project B later delivers rasterized wireframes … add an image branch here; the registry key stays the screen id either way"). Native components give us live behavior (slide-to-confirm, toggles, the Ask-Luna launcher), real text for comment-anchoring, and a single token source — none of which a screenshot can.

### In scope (~50 screens)

| Group | Count | Screens |
|---|---|---|
| **Core spine archetypes** | 5 | Home Dashboard, Settings, Session History, Hardware Checkpoint, Dose Confirmation |
| **Apollo Training** | 19 | intro, steps 01–10, hardware-checkpoint, evening/morning outro, overnight-handoff, morning-start, complete, mid-session-resume, replay-from-settings |
| **HypoShield & In-App Comms** | 10 | home-tip-default/post, learning-state, mid-session-announcement, confirm-increase/-reset-required/-skip, settings-hypo-shield, tdbd-detail, push-notification |
| **Onboarding Update** | 12 | chapters 1–5, setup-landing, ui-walkthrough, tonight-panel-states, setup-app-walkthrough, session-history-intro, long-acting-insulin, settings-luna-controller |
| **IOB Display** | 4 | home-iob-on, pre-session-iob-announcement, settings-iob, session-detail-iob |
| **Total** | **50** | |

These are every **Changed** + **New** screen across the four new-feature folders plus the locked core archetypes. The Apollo, HypoShield, and Onboarding counts use the **per-feature `app-map.json`s** (the source of record for each feature), which are supersets of the root `app-map.full.json` — they add `mid-session-resume` + `replay-from-settings` (Apollo), `push-notification` (HypoShield), and `setup-app-walkthrough` + `session-history-intro` + `long-acting-insulin` + `settings-luna-controller` (Onboarding). Build to the per-feature maps.

### Out of scope (deferred, per John)

The **~38 "Unchanged" / Dark-UI-re-skin screens** (the 11 `unchanged-*` rows in `app-map.full.json` plus the broader legacy App-Map families: Post-session Load 1–4, Get-to-Know/Legend, Pair-Luna failures, Compatibility modal, Session-History Swipe/No-Data, Toasts, Settings App/About/Help, Firmware-OTA errors, Searching/App-Error). They keep their legacy `.jpg` stand-ins for now and are **not** rebuilt as native components in this pass. The dark re-skin of the legacy set is a **single future sweep**, sequenced last, after the standard is locked by the in-scope screens (see COVERAGE-AUDIT §5, P3). Note it as a future pass; do not start it here.

---

## 2. Architecture / approach

### 2.1 How one self-contained wireframe maps to Astro

Each wireframe HTML file has two parts (SPINE-NOTES "How the files are structured"):

1. **A shared `<style>` block** — byte-identical across the 7 spine files. It IS the locked frame + component kit (the black-bezel phone, status bar, brandbar, home indicator, plus the kit classes: `.card-dark`, `.glucose`, `.list`/`.row`, `.btn`, `.tabbar`, `.insight`, `.prog-dots`, `.tonight-panel`, etc.).
2. **A per-screen block** appended below a labeled banner comment — the screen's unique layout/copy.

The mapping is mechanical:

- **The shared `<style>` block → the iPhone-frame wrapper + the shared kit components.** Lift it once; never let it drift per-screen. SPINE-NOTES is explicit: *"When mass-building, lift this block into a shared partial — do not let it drift per-screen."*
- **The per-screen block → one screen `.astro` component** under `src/components/ux/screens/`, which composes the shared kit components and carries only that screen's copy/layout.
- **Tokens are already ported** to `src/styles/ios-tokens.css`, **scoped to `.ux-ios`** (every property and helper lives under `.ux-ios` so it never leaks into the intranet Tailwind theme). Any render area must be wrapped in `<div class="ux-ios">…` — the slug/gallery pages already do this.

> **The wireframe HTML is the source of truth for layout + copy. SPINE-NOTES is the rule contract.** Lift behavior and exact copy from the reference wireframe verbatim — do not paraphrase headlines, rationale text, button labels, counters, or flag wording. When a screen's layout and a kit-component default disagree, the wireframe wins for that screen; if a rule in SPINE-NOTES disagrees with a wireframe, raise it as a flag rather than guessing.

### 2.2 Reconcile the existing scaffolding first (important)

Project A already shipped an **earlier** version of the kit from the *pre-r2* Project B handoff. It does **not** yet match the locked SPINE-NOTES (r2, 2026-05-28). Before building feature screens, reconcile these:

| Existing file | Drift from locked contract | Action |
|---|---|---|
| `src/components/ux/Phone.astro` | Bezel is `#0b1220` blue with a `--color-cloud-lilac` **light** screen surface; `min-height:844px`, notch (not Dynamic-Island pill); **no brandbar**, no status bar baked in. | Re-base to the locked frame: 414px outer, `#2b2b30→#0b0b0d→#000` **black** metallic bezel, `radius:56px`; `.screen` 390px, `radius:34px`, **`height:780px` FIXED**, `overflow:hidden`; Dynamic-Island 104×28 pill via `::before`; **Luna on-dark wordmark top-left in a `.brandbar` row on every screen**; status bar (54px, `9:41`) + home indicator (34px). Content scrolls **inside** the clipped screen (hidden scrollbar). |
| `src/components/ux/ios/DoseSheet.astro` | Eyebrow reads **"Basal Guidance"**; ack copy reads "Set your Luna TDBD to…". | Rename to **"Hypo Shield"**; the two-part action uses **generic "long-acting insulin"**: (1) *"Set your long-acting insulin dose to 14 units in Luna's settings"*, (2) *"Take your 14-unit long-acting dose."* Keep the slide-to-confirm + dual-ack JS (it is correct and scale-aware). |
| `src/components/ux/ScreenRenderer.astro` | Registry has only 4 ids (`dashboard`, `session-history`, `settings`, `dose-confirmation`) using **old** ids; missing branch shows "Pending Deliverable 3". | Expand the registry to the new id scheme (see §3) and import each screen component. Keep the graceful "No wireframe yet" fallback for not-yet-built ids. |
| `src/styles/ios-tokens.css` | Tokens ported, scoped to `.ux-ios`. Mostly good. | Verify all SPINE color roles exist: Plum `#8E3655` (critical), Moonlight `#68D2DF`, Light-Emerald `#B0F9B3` (on-dark status dots), Emerald `#2E7D32` (dose-sheet success), Clinical-Amber `#F9CD86` (flags only), `--color-on-dark` `#FFFFFF`, `--color-on-dark-sub` `#ACC1DF`. Add any missing. |

These are the precedent set. **DoseSheet.astro is the canonical "feature component" precedent** — a single component, multiple `variant`s, per-instance-scoped JS (`[data-dose-root]`) so several can coexist on the compare page. Follow that pattern.

### 2.3 The component layers

```
src/components/ux/
  Phone.astro ............... iPhone-frame wrapper (black bezel, status bar, brandbar,
                              Dynamic-Island cue, home indicator, fixed-height clipped
                              .screen, hidden scrollbar). The locked frame from SPINE-NOTES.
  ScreenRenderer.astro ...... id → screen component registry (+ legacy variant + fallback).
  ios/  ..................... the shared component kit (one .astro per kit primitive):
    StatusBar.astro            9:41 clock + signal/battery (chrome; usually inside Phone)
    TabBar.astro               Dashboard · Session History · Settings; active tab Moonlight + aria-current
    StatusCard.astro           thin system/reservoir/battery strip (Home leads with this)
    GlucoseDisplay.astro       big number + trend arrow (tabular-nums, -0.03/-0.04em tracking)
    CgmChart.astro             hero CGM graph: full-width, right-side mg/dL axis to 400,
                               70–180 band, Amber 180 line, PLUM 70 critical-low line,
                               Moonlight delivery ticks + legend  ← NEW, build this
    InsightCard.astro          Luna insight card (plain-language line, Moonlight accent)
    AskLuna.astro              discreet "+" FAB → expands to chat entry, × to collapse  ← NEW
    ListRows.astro             .list / .row (label, value, Moonlight chevron, status dots, toggle)
    IosButton.astro            .btn pill (primary Moonlight-on-dark / secondary / ghost)
    Toast.astro                toast/snackbar
    CalendarStrip.astro        week strip / date-range selector
    ProgressDots.astro         per-module progress dots (current = bright elongated pill)  ← NEW
    TonightPanel.astro         recurring "Tonight" panel (+ .decompressed modifier)  ← NEW
    Flag.astro                 dashed Clinical-Amber: inline .token-flag [X] + .flag chip  ← NEW
    DoseSheet.astro            two-step dose-confirmation bottom sheet (EXISTS — re-skin copy)
  screens/  ................. one .astro per in-scope screen (composes ios/* + copy)
    DashboardScreen.astro, SessionHistoryScreen.astro, SettingsScreen.astro,
    DoseConfirmationScreen.astro  (EXIST — re-base onto the locked frame/kit)
    + ~46 new screen components (see §3 registry)
```

Each **screen** component is thin: it imports the kit primitives, lays them out per the reference wireframe, and supplies the exact copy. Behavior and copy come from the wireframe; structural rules come from SPINE-NOTES.

---

## 3. Component registry

Every in-scope screen, its target `component:<id>`, and its reference wireframe. The `component:<id>` value is what Project B writes into the live `app-map.json` `wireframe` field (§4). IDs are stable, kebab-case, feature-prefixed, and chosen to read cleanly in the URL (`/tools/ux-review/<manifest-id>`) and in the `ScreenRenderer` registry.

> **Note on dual ids.** Some screens exist both as a generic spine archetype *and* as a feature variant (e.g. spine `home-dashboard` vs HypoShield `home-tip-default`, spine `dose-confirmation` vs HypoShield `confirm-increase`). Keep them as **separate registry entries** — they have distinct copy/states and distinct manifest rows. The spine archetype is the reference build; the feature variants reuse its kit composition with feature copy.

### 3.1 Core spine archetypes (5)

| component:<id> | Title | Feature | Status | brdTier | Reference wireframe | BRD |
|---|---|---|---|---|---|---|
| `component:home-dashboard` | Home Dashboard | Home | Changed | P0 | `_spine/01-home-dashboard.html` | BRD-Home |
| `component:settings-list` | Settings | Settings | Changed | None | `_spine/05-settings-list.html` | — |
| `component:session-history` | Session History | History | Changed | Lean | `_spine/07-session-history.html` | BRD-History |
| `component:hardware-checkpoint-spine` | Hardware Checkpoint | Training Update Apollo | Changed | Full | `_spine/04-hardware-checkpoint.html` | Apollo |
| `component:dose-confirmation-spine` | Dose Confirmation | Basal Guidance / Hypo Shield | New | Full | `_spine/03-dose-confirmation.html` | Apollo / HypoShield |

### 3.2 Apollo Training (19)

| component:<id> | Title | Status | brdTier | Reference wireframe |
|---|---|---|---|---|
| `component:apollo-intro` | Intro — first session setup | Changed | Full | `apollo-training/intro.html` |
| `component:apollo-step-01-inventory` | Step 01 — Inventory | Changed | Full | `apollo-training/step-01-inventory.html` |
| `component:apollo-step-02-open-tray` | Step 02 — Open tray | Changed | Full | `apollo-training/step-02-open-tray.html` |
| `component:apollo-step-03-fill` | Step 03 — Fill reservoir | Changed | Full | `apollo-training/step-03-fill.html` |
| `component:apollo-step-04-remove-label` | Step 04 — Remove label | Changed | Full | `apollo-training/step-04-remove-label.html` |
| `component:apollo-step-05-attach-capsule` | Step 05 — Attach capsule | Changed | Full | `apollo-training/step-05-attach-capsule.html` |
| `component:apollo-step-06-remove-base` | Step 06 — Remove from base | Changed | Full | `apollo-training/step-06-remove-base.html` |
| `component:apollo-step-07-apply-body` | Step 07 — Apply to body | Changed | Full | `apollo-training/step-07-apply-body.html` |
| `component:apollo-hardware-checkpoint` | Hardware checkpoint | Changed | Full | `apollo-training/hardware-checkpoint.html` |
| `component:apollo-evening-outro` | Evening outro — personal video | Changed | Full | `apollo-training/evening-outro.html` |
| `component:apollo-overnight-handoff` | Overnight handoff — Luna active | Changed | Full | `apollo-training/overnight-handoff.html` |
| `component:apollo-morning-start` | Morning start | Changed | Full | `apollo-training/morning-start.html` |
| `component:apollo-step-08-remove-device` | Step 08 — Remove device | Changed | Full | `apollo-training/step-08-remove-device.html` |
| `component:apollo-step-09-detach-reservoir` | Step 09 — Detach reservoir | Changed | Full | `apollo-training/step-09-detach-reservoir.html` |
| `component:apollo-step-10-charge` | Step 10 — Charge controller | Changed | Full | `apollo-training/step-10-charge.html` |
| `component:apollo-morning-outro` | Morning outro — personal video | Changed | Full | `apollo-training/morning-outro.html` |
| `component:apollo-complete` | Complete | Changed | Full | `apollo-training/complete.html` |
| `component:apollo-mid-session-resume` | Mid-session resume — clean step boundary | Changed | Full | `apollo-training/mid-session-resume.html` |
| `component:apollo-replay-from-settings` | Replay from Settings — Training Guide (BR-B6) | Changed | Full | `apollo-training/replay-from-settings.html` |

### 3.3 HypoShield & In-App Comms (10)

| component:<id> | Title | Status | brdTier | Reference wireframe |
|---|---|---|---|---|
| `component:hypo-home-tip-default` | Home — Default Tip | Changed | Full | `hypo-shield/home-tip-default.html` |
| `component:hypo-home-tip-post` | Home — Tip Post (recommendation) | Changed | Full | `hypo-shield/home-tip-post.html` |
| `component:hypo-learning-state` | Learning State & Dosing Mode | Changed | Full | `hypo-shield/learning-state.html` |
| `component:hypo-mid-session-announcement` | Mid-Session Dose Announcement | Changed | Full | `hypo-shield/mid-session-announcement.html` |
| `component:hypo-confirm-increase` | Confirm Amount — Increase (two-part) | Changed | Full | `hypo-shield/confirm-increase.html` |
| `component:hypo-confirm-reset-required` | Confirm Amount — Reset Required | Changed | Full | `hypo-shield/confirm-reset-required.html` |
| `component:hypo-confirm-skip` | Confirm Skip (decline / defer) | Changed | Full | `hypo-shield/confirm-skip.html` |
| `component:hypo-settings` | Settings — Hypo Shield | Changed | Full | `hypo-shield/settings-hypo-shield.html` |
| `component:hypo-tdbd-detail` | TDBD Detail (current value, learning, history) | Changed | Full | `hypo-shield/tdbd-detail.html` |
| `component:hypo-push-notification` | Push notification — prompt-to-open only | Changed | Full | `hypo-shield/push-notification.html` |

### 3.4 Onboarding Update (12)

| component:<id> | Title | Status | brdTier | Reference wireframe |
|---|---|---|---|---|
| `component:onboarding-chapter-1` | Chapter 1 — What Luna is | Changed | must | `onboarding/chapter-1-frame.html` |
| `component:onboarding-chapter-2` | Chapter 2 — Tell Luna your routine (TDBD capture) | Changed | must | `onboarding/chapter-2-routine.html` |
| `component:onboarding-chapter-3` | Chapter 3 — Pair Luna Capsule (BLE) | Changed | must | `onboarding/chapter-3-pair-luna.html` |
| `component:onboarding-chapter-4` | Chapter 4 — Pair CGM (Dexcom G7) | Changed | must | `onboarding/chapter-4-pair-cgm.html` |
| `component:onboarding-chapter-5` | Chapter 5 — Handoff to Apollo Training | Changed | must | `onboarding/chapter-5-handoff.html` |
| `component:onboarding-setup-landing` | Setup Landing (none / Luna complete / all) | Changed | must | `onboarding/setup-landing.html` |
| `component:onboarding-ui-walkthrough` | UI Walkthrough (1 of 5) | Changed | should | `onboarding/ui-walkthrough.html` |
| `component:onboarding-tonight-panel-states` | Tonight Panel — fill states across the arc | Changed | reference | `onboarding/tonight-panel-states.html` |
| `component:onboarding-setup-app-walkthrough` | Setup App Walkthrough (1–5 + Done) | Changed | must | `onboarding/setup-app-walkthrough.html` |
| `component:onboarding-session-history-intro` | Session History Intro (first-run, 1–4) | Changed | must | `onboarding/session-history-intro.html` |
| `component:onboarding-long-acting-insulin` | Long-acting insulin (plain capture) | Changed | must | `onboarding/long-acting-insulin.html` |
| `component:onboarding-settings-luna-controller` | Settings — Luna Controller (device management) | Changed | must | `onboarding/settings-luna-controller.html` |

### 3.5 IOB Display (4)

| component:<id> | Title | Status | brdTier | Reference wireframe |
|---|---|---|---|---|
| `component:iob-home-on` | Home dashboard — IOB Display enabled | Changed | must | `iob-display/home-iob-on.html` |
| `component:iob-pre-session-announcement` | Pre-session IOB announcement | Changed | must | `iob-display/pre-session-iob-announcement.html` |
| `component:iob-settings` | Settings — IOB Display toggle (default OFF) | Changed | must | `iob-display/settings-iob.html` |
| `component:iob-session-detail` | Session History detail — residual Luna IOB | Changed | should | `iob-display/session-detail-iob.html` |

**Registry total: 50.** (5 spine + 19 Apollo + 10 HypoShield + 12 Onboarding + 4 IOB.)

The `ScreenRenderer.astro` `REGISTRY` map keys are the **manifest screen ids** (which equal the `component:<id>` suffix). Project B keeps the manifest `id` and the component-registry key identical so comments/anchors/notifications (all keyed on `screen_id`) line up.

---

## 4. Manifest change

Project B sets each in-scope screen's `wireframe` field in the **live** `projects/UX Review/app-map.json` to `component:<id>`. The shape must match the `Screen` interface in `src/lib/ux-review.ts`:

```ts
export interface Screen {
  id: string;            // == the component-registry key
  title: string;
  status: "New" | "Changed" | "Unchanged";
  feature: string;
  brdTier: string;
  wireframe: string;     // "component:<id>" for native render, or "wireframes/<id>.jpg" for legacy stand-in
  legacy: string | null; // legacy compare source; "component:<id>" or a .jpg path; null when New
  brdLink?: string;
  summary?: string;
}
```

**In-scope screen — example target row:**

```jsonc
{
  "id": "hypo-confirm-increase",
  "title": "Confirm Amount — Increase (two-part)",
  "status": "Changed",
  "feature": "HypoShield & In-App Comms",
  "brdTier": "Full",
  "wireframe": "component:hypo-confirm-increase",   // ← native Astro render
  "legacy": null,                                    // New gesture; no 2021 original to compare
  "summary": "Two-part action: acknowledge update-setting AND take-dose, then slide to confirm both."
}
```

For an in-scope **Changed** screen that *does* have a 2021 original (e.g. `home-dashboard`, `session-history`, `hypo-settings`, `iob-home-on`), keep the legacy `.jpg` path so the old-vs-new compare works:

```jsonc
{
  "id": "iob-home-on",
  "wireframe": "component:iob-home-on",
  "legacy": "wireframes/legacy/home-dashboard.jpg"   // ← drives the compare slider
}
```

**Out-of-scope (Unchanged) screens stay legacy:** they keep their `.jpg` `wireframe` path and `legacy` value — `ScreenRenderer` falls through to the image/"No wireframe yet" branch for them, and the compare uses the legacy field:

```jsonc
{
  "id": "unchanged-post-session-load",
  "status": "Unchanged",
  "wireframe": "wireframes/legacy/post-session-load.jpg",
  "legacy": "wireframes/legacy/post-session-load.jpg"
}
```

`componentId(wireframe)` returns the id for native rows and `null` for legacy rows — that is the single switch the renderer and compare logic key off, so no other Project A code needs to change.

---

## 5. Locked rules to preserve (from SPINE-NOTES)

These are non-negotiable across every component. Lift them; do not reinterpret.

- **Force-dark, always.** Every screen renders on the Midnight gradient (`midnight-deep → midnight → midnight-floor`). **No white/light full screen ever.** Light (`.card-light`/Soft-Paper) is allowed *only* as the dose-confirmation bottom sheet chrome (screen 03) and notification chrome.
- **Black bezel + Luna wordmark top-left on every screen.** `.phone` 414px, `#2b2b30→#0b0b0d→#000`, `radius:56px`; `.screen` 390px × **fixed 780px**, `radius:34px`, clipped; Dynamic-Island 104×28 pill; on-dark wordmark small in `.brandbar`, **never stretched or recolored**.
- **D-DIN + the 11-level iOS HIG type scale** by class name (`large-title … caption-2`), recolored to on-dark inside `.screen`. Big numerics 700/400, `-0.03/-0.04em` tracking, `tabular-nums`.
- **Per-module progress = DOTS, not a line.** Module-scoped ("Evening setup · Step 3 of 7"; morning removal is its own "Morning removal · Step N of 3"). Current step is an elongated bright Moonlight pill; done dots dimmed.
- **No "Watch again" affordance.** Videos auto-loop; show an "Auto-loops" hint, never a replay button.
- **Never gate "Next"/primary on hardware/Bluetooth status.** Checkpoints are informative only — the CTA stays enabled regardless of connection state.
- **CGM status reads "Recent reading OK"** — never "Connected" (screens 04, 05).
- **Critical = Plum `#8E3655`, never red.** Plum appears only as the CGM chart's 70 mg/dL critical-low threshold line (Home + Session History). No red anywhere. Moonlight `#68D2DF` is the single accent, kept ≤7%.
- **The two-part dose action.** Acting on a basal recommendation requires BOTH acknowledgements — (1) *"Set your long-acting insulin dose to 14 units in Luna's settings"* and (2) *"Take your 14-unit long-acting dose"* — and the slide-to-confirm is disabled until both are checked. Feature is named **Hypo Shield** (not "Basal Guidance"); dose steps use **generic "long-acting insulin"** (not "Lantus (U-100)").
- **Flag pattern — "flag, don't fabricate."** Inline `.token-flag` `[X]` for an undecided value inside copy; `.flag` chip (`[OPEN] description — owner`) for an undecided spec item. **Never** replace a flag with a guessed number, error copy, or fake state.
- Other locked items: IOB shown to **0.1 U**, capital "U", **default OFF**; tab bar = **Dashboard · Session History · Settings** with `aria-current="page"` on the active tab; flow screens (training/checkpoint/onboarding/dose) have **no tab bar**; recurring **Tonight panel** order is locked (pair Luna → pair CGM → enter TDBD) and uses `.decompressed` on the onboarding chapter; "Luna takes the night watch" tagline stays on **one line**.

Use the **Mass-build checklist** at the bottom of SPINE-NOTES as the per-screen acceptance checklist.

---

## 6. Wiring into the existing platform

Everything below already exists in Project A; native components plug into it with no contract change.

- **`[slug].astro` (detail + compare).** It already imports `ScreenRenderer`, `Phone`, `componentId`, and renders `<ScreenRenderer id={screen.id} variant="current" />`. Adding screen components to the `ScreenRenderer` registry is the *only* change needed — the page renders any id with a registry entry and falls back to "No wireframe yet" otherwise.
- **Old-vs-new compare.** `[slug].astro` shows the `CompareSlider` when `screen.status === "Changed" && componentId(screen.legacy) !== null`. For a native legacy variant, `ScreenRenderer` is called with `variant="legacy"`; for a `.jpg` legacy it renders the image. Screens with new gestures (most New/HypoShield/IOB) carry `legacy: null` and simply show no compare.
- **Gallery (`index.astro`).** Renders every screen as a `Phone mode="thumb"` thumbnail via `ScreenRenderer`, grouped by `byFeature()`. New feature groups ("HypoShield & In-App Comms", "Onboarding Update", "IOB Display", "Training Update Apollo") appear automatically once their rows are in the manifest — no gallery edit needed beyond confirming the thumbnail crop suits the fixed-height frame.
- **Comments / anchors.** `functions/api/comments` keys threads on `screen_id` (the manifest id). Because the component-registry key == the manifest id, every native screen gets its own thread automatically. Anchored pins resolve via `getBoundingClientRect()` and survive the `Phone` CSS scale (see the scale-aware note in `Phone.astro` and the `moveTo()` scale compensation in `DoseSheet.astro`) — keep new interactive components scale-safe the same way.
- **Notifications.** `functions/api/notifications.ts` derives the bell feed entirely from the comments store, so new screens light up the bell with no extra wiring.
- **`review.astro` dashboard** aggregates comment/resolution status across `SCREENS`; new rows are picked up automatically.

---

## 7. Open flags to carry (do not fabricate; carry these forward)

These are unresolved by design. Render them as `.token-flag`/`.flag` per the flag pattern; never paper over them with a guessed value.

1. **Dose value `[X]` (Eng/Clinical).** `step-03-fill` and spine `02-training-step` carry "Dial [X] units… Flag dose value [X] — pending Eng/Clinical." The HypoShield "14 U" / TDBD "12 U" are illustrative working placeholders (the BRD's number), owned by Clinical/Eng — the on-screen value may still move. Keep the flag.
2. **Hardware error-state enumeration + verify-before-body ordering.** `hardware-checkpoint` carries two on-screen chips: "Open verify-before-body order" and "Open error states — Eng/Clinical." Both unresolved. Also: the Home dashboard now owns **active-session error states** (occlusion, CGM loss) inherited from the cut screen 08 — tracked as a CHANGES flag, not yet an on-screen chip.
3. **"Ask Luna" widget needs a BRD home.** The Ask-Luna chat launcher on Home / `iob-home-on` traces to **no** BRD in the audited set (COVERAGE-AUDIT "Untraceable wireframe elements"). Build it per the spine (discreet "+" FAB → expand → ×), but flag it for feature/BRD ownership; do not invent its behavior beyond what the wireframe shows.
4. **Audit MEDIUM-confidence BR-bullet caveat.** `get_document` collapsed the §6 `BR-N` bodies for HypoShield, IOB, and Onboarding (only Apollo §7 BR-B1…B6 came through in full). The wireframes match the *reconstructed* intent, but exact BR-N acceptance phrasing was unread — so copy and sub-clause behavior are "matches intent, verify against live BR-N before HF/build lock." Specific unconfirmed items: IOB pre-session announcement may or may not invoke the shared two-step component (App Map titles it "+ Confirmation Modal"); Apollo BR-B2 mid-session **resume-at-clean-step-boundary** state and BR-B4 morning re-entry *mechanism* are BRD-undecided (the wireframes show destinations, not triggers).

---

## 8. Build sequence

Build in dependency order so the locked frame + kit are proven once before the ~46 screen components lean on them.

1. **Phone frame (re-base) + shared kit primitives.** Re-base `Phone.astro` to the locked black-bezel/fixed-height/brandbar contract (§2.2). Build/confirm the `ios/` kit: `StatusBar`, `TabBar`, `StatusCard`, `GlucoseDisplay`, `CgmChart` (new — Plum 70 line + delivery ticks), `InsightCard`, `AskLuna` (new), `ListRows`, `IosButton`, `Toast`, `CalendarStrip`, `ProgressDots` (new), `TonightPanel` (new), `Flag` (new). Verify each against the spine `<style>` block byte-for-byte where possible.
2. **Dose (the precedent).** Re-skin `DoseSheet.astro` copy to Hypo Shield / long-acting insulin (§2.2) and finish `DoseConfirmationScreen` (`dose-confirmation-spine`). This proves the interactive-component + per-instance-scoped-JS pattern that the confirm-* screens reuse.
3. **Core archetypes (reuse the spine, already partly built).** `home-dashboard`, `settings-list`, `session-history`, `hardware-checkpoint-spine`. `DashboardScreen`, `SessionHistoryScreen`, `SettingsScreen` exist — re-base them onto the new frame/kit. These four exercise the entire kit, so build them next and treat them as the kit's acceptance test.
4. **Feature screens, feature by feature** (each reuses the archetypes + kit, varying copy/state):
   - **HypoShield (10):** home-tip-default/post reuse Home; confirm-* reuse the dose sheet; settings/tdbd reuse the list; push-notification reuses notification chrome.
   - **IOB (4):** home-on reuses Home (active-insulin row); settings reuses the list (default-OFF toggle); session-detail reuses Session History; pre-session-announcement reuses InsightCard (+ confirm component — see flag #4).
   - **Onboarding (12):** chapters reuse the onboarding archetype + TonightPanel (`.decompressed`); setup-landing/walkthrough/session-history-intro/long-acting/settings-luna-controller follow.
   - **Apollo (19):** intro/complete/outros reuse app-only layouts; steps 01–10 reuse the training-step archetype + ProgressDots; hardware-checkpoint reuses the spine checkpoint; mid-session-resume + replay-from-settings close the BR-B2/BR-B6 gaps.
5. **Manifest flip.** As each screen lands in the `ScreenRenderer` registry, Project B flips its `app-map.json` `wireframe` to `component:<id>` (§4). Unchanged screens are left on their `.jpg` paths.
6. **Deferred / future pass.** The ~38 Unchanged Dark-UI re-skin screens — single sweep, after the standard is locked. Out of scope here.

---

### Acceptance per screen

A screen component is done when it (a) renders inside the locked `Phone` frame, (b) reuses only shared kit components + tokens (no per-screen frame/kit drift), (c) carries the **exact copy** from its reference wireframe, (d) preserves the SPINE-NOTES locked rules in §5, (e) carries any open flag from §7 as a real `.token-flag`/`.flag` (never fabricated), and (f) passes the SPINE-NOTES "Mass-build checklist (per new screen)."
