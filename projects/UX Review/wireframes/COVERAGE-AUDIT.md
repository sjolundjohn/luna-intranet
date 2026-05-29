# BRD → Wireframe Coverage / Traceability Audit — Luna iOS (T1 Pivotal)

**Date:** 2026-05-29 · **Scope:** read-only audit of the self-contained HTML wireframes in this folder against the five feature BRDs (HypoShield, IOB Display, Onboarding, Apollo Training, Dark UI). No wireframes were modified.

## How to read this

- **Status legend:** Covered = a wireframe satisfies the requirement; Partial = present but incomplete or only partially addressed; Missing = no wireframe; Deferred-by-decision = intentionally out of pivotal scope per a recorded decision; Not-machine-readable = BRD §6 body could not be extracted (see limitation below).
- **Sources used:** each BRD via `gdrive-luna get_document`; the **App Map** sheet (`1M3UuD1aWg8UJT-jOIEmONmOnzoK0aTLsPhapF6M-jOc`, tab "App Map"); the **Consolidated Decisions** doc (`1m1SzJV5rbr2Ymv6zQVJQg5l4EFD_x3Qoco5wW4ASCkE`); each feature's `app-map.json`; and the rendered copy of every wireframe HTML file.

### KNOWN LIMITATION (material to confidence)

For all four prose BRDs (HypoShield, IOB, Onboarding, Apollo), `get_document` **collapsed the numbered "BR-N" business-requirement bodies in §6 to heading anchors with no body text** — only section headings (`6. Business requirements …`, `7. Behaviors & principles`) came through, not the individual `BR-1…BR-n` statements. The same is true of §7 cross-cutting requirements **except in the Apollo BRD**, whose §7 (BR-B1 … BR-B6 + "App-only screens") **did** come through in full and is used verbatim.

Where the precise BR-N wording could not be recovered, the requirement is reconstructed from machine-readable surfaces that *did* come through (executive summaries, the §5 in-scope lists, the App Map screen tags, and the Consolidated Decisions). Those rows are flagged **"BR-N text not machine-readable — exact wording needs manual confirm"** and I have NOT assumed coverage of any sub-clause I could not read. Treat every such row as "wireframe matches the reconstructed intent; verify against the actual BR-N text before sign-off."

Dark UI and the Consolidated Decisions doc came through **fully readable** — those rows carry full confidence.

---

## 1. HypoShield & In-App Comms

BRD `1XPDw5hbqG6boaocceBvnhxZZOJv9Ac28HPZJh6HnYoQ`. §6 (BR-N) and §7 (cross-cutting) bodies were **not machine-readable**; requirements below are reconstructed from the §5 in-scope list (which came through), the executive summary, the App Map, and decisions C1–C3 / P3 / D1. Highest human-factors-risk feature.

| Requirement (reconstructed) | Satisfied by | Status | Notes |
|---|---|---|---|
| Learning state + Dosing Mode: communicate "still learning (5 sessions AND 7 days), progress, and compensation direction" | `learning-state.html` | Covered | Shows "5 Luna sessions and 7 days of wear", live counters (3 of 5 AND 4 of 7), "dosing stays a little more conservative", Dosing mode "Establishing baseline / Next: compensating upward or downward once learned". Strong match to exec summary. |
| Tip Post / Default Tip on Home (resting + recommendation states) | `home-tip-default.html` (resting), `home-tip-post.html` (recommendation) | Covered | Default: "Your nightly basal looks well-matched." Post: "A new nightly basal dose is ready… 14 U Increase / Current 12 U… suggestion only — nothing changes until you review and confirm." Decision-support framing per C1. |
| Mid-session Dose Announcement + confirmation entry | `mid-session-announcement.html` | Covered | "Luna has a basal suggestion for tonight… review now or in the morning — your current basal stays in place until then." Review / Not now. |
| Confirm amount (two-part action: update setting AND take dose), via the shared two-step component | `confirm-increase.html` | Covered | Two acknowledgement rows — "Set your long-acting insulin dose to 14 units in Luna's settings" + "Take your 14-unit long-acting dose" — under header "To act on this, do both"; slide-to-confirm gated/disabled until BOTH acknowledged ("Slide to confirm both", "Acknowledge both actions above to continue"). Directly satisfies the two-part-action + no-accidental-accept outcome. |
| Confirm amount — Reset Required path | `confirm-reset-required.html` | Covered | "You changed your basal dose manually, so Hypo Shield reset its learning… won't suggest a new dose until it has re-learned… both five sessions and seven days of wear." Re-learning counters shown. Matches C2 (Reset = manual TDBD change). |
| Confirm Skip (decline/defer) + consequences | `confirm-skip.html` | Covered | "Skip this recommendation? Your basal stays at 12 U… you may keep waking outside range… This recommendation isn't lost — find it under Settings · Hypo Shield." Covers the "understand consequences of skipping" success metric. |
| TDBD detail view (current value, learning progress, history) | `tdbd-detail.html` | Covered | "Programmed now 12 U… You set this — Luna never changes it for you. Learning 5/5, 7/7 · Learned." Full history list (Recommended/Skipped/Applied/Reset/Set). |
| Settings — Basal Guidance / Hypo Shield (feature + state) | `settings-hypo-shield.html` | Covered | Shows Active state, plain-language description, "Always on for your study… product-level disable for T2D basal-only, not user-controllable" (C3), last recommendation, TDBD, learning & history, "How Hypo Shield works". |
| Push notification = prompt-to-open only (no dose value / no confirmable action on lock screen) — P3 / §5 | — | Missing (likely out of wireframe scope) | No lock-screen / push wireframe exists in this set. Push copy is a Jasper Phase-4 item; the *prompt-to-open* surface itself is not wireframed. Flag, do not assume. |
| Status Bar Info (with/without image) — App Map tags this to Hypo Shield in-app comms, Tier None | — | Missing | App Map row "Status Bar Info (with/without image)" tagged to Hypo Shield is not in the wireframe set (Tier None — re-skin only). Low priority. |

**Open flags carried (HypoShield):** the dose value in `confirm-increase` (14 U) and TDBD (12 U) are illustrative placeholders — the HTML comment states "The dose value (V) is the BRD's illustrative working placeholder of 14." This is the dose `[X]` open flag; final values are Eclipse outputs owned by Clinical/Eng (per §8 assumptions). Not a wireframe gap, but an unresolved input.

**Confidence: MEDIUM.** Every in-scope surface from §5 has a matching, well-copywritten wireframe and the two-part-action gesture is implemented exactly as the exec summary demands. But the precise BR-N acceptance phrasing in §6/§7 was unreadable, so I cannot confirm sub-clauses (e.g., frequency/rest cadence of the Tip Post, exact Reset-Required trigger definition, the §7 "never silently auto-applied" wording). Verify against the live BR-N text before HF lock.

---

## 2. IOB Display

BRD `1EhOOcDZvF0knvRYnP44P7YtdtErg1j_l_eD0krhvhdU`. §6 (BR-N) and §7 bodies **not machine-readable**; reconstructed from the exec summary, the §2 reconciliation paragraph (which came through), App Map, and decisions E1 / D1 / Decision 4.

| Requirement (reconstructed) | Satisfied by | Status | Notes |
|---|---|---|---|
| Home displays a single Luna-IOB number when enabled, during an active session | `home-iob-on.html` | Covered | "Active insulin · Luna — From Luna-delivered insulin only — 0.4 U." Single number, scope-labelled. |
| Residual Luna IOB carried after a session ends until it clears (Decision 4: during + residual) | `session-detail-iob.html` | Covered | "0.1 U on board at wake · Residual insulin on board · From your Luna-delivered insulin only. Still active at wake and clearing — shown so you can avoid stacking." |
| Opt-in, **default-OFF** toggle in Settings + plain-language explanation | `settings-iob.html` | Covered | "Show insulin on board — Off by default." Explanation: what IOB is, avoid stacking, "Counts Luna-delivered insulin only — not insulin you deliver outside Luna. This is information… Luna won't recommend, change, or deliver a dose based on it." Matches the comprehension + scope-legibility outcomes. |
| Pre-session IOB announcement reconciled as opt-in/acknowledgement (NOT a dose action), reusing the shared two-step component on first enable (§2 reconciliation + D1) | `pre-session-iob-announcement.html` | Partial | Screen exists and frames it correctly as opt-in: "New: see your insulin on board… Off until you turn it on." BUT the extracted copy shows only the Insight Card + opt-in messaging; I could **not** confirm from the rendered text that it invokes the shared two-step acknowledgement component the §2 paragraph/D1 calls for on first enable. App Map titles this row "Insight Card + Confirmation Modal." Verify whether the confirmation/acknowledgement step is actually wired here. |
| IOB shown at 0.1 U resolution, capital-U notation (E1) | `home-iob-on.html`, `session-detail-iob.html`, `settings-iob.html` | Covered | "0.4 U", "0.1 U" — 0.1 resolution and capital-U present throughout. |
| Non-opted-in users never exposed to the number | (by design — default-OFF; no "IOB visible without opt-in" screen exists) | Covered (by absence) | App Map: "Post-session, IOB disabled" is the default state, Tier None. No wireframe surfaces IOB without opt-in. Consistent with the protective outcome. |
| No history / reports / graph view in v1 (Decision 4, deferred) | — | Deferred-by-decision | Session-detail residual is the only history-adjacent surface; full history/reports explicitly deferred to fast-follow. Correctly absent. |

**Confidence: MEDIUM-HIGH.** Core surfaces (Home-on, settings default-OFF, residual, scope labelling, units) are all covered and the copy is precise. The one real open item is whether the **pre-session announcement actually reuses the shared two-step confirmation component** per D1, or is just an informational card — the rendered copy is ambiguous. BR-N exact wording remains unread.

---

## 3. Onboarding Update

BRD `1m3lmOTehTHCxQugJqYkoXb1cZw5b42lEd3Vzhs0782o`. §6 (BR-N) and §7 bodies **not machine-readable**; reconstructed from the exec summary, the §5 in-scope list (which came through, incl. the App-Map screen enumeration and the Tonight panel), and decisions P1 / Q10 / Ch2 / setup-sequence / E8 / D2.

| Requirement (reconstructed) | Satisfied by | Status | Notes |
|---|---|---|---|
| Five-chapter linear narrated arc, required completion, **no skip valve** (P1) | `chapter-1-frame` … `chapter-5-handoff` | Covered | All five present, each labelled "Chapter N of 5", "Continue" only (no Skip control visible). Linear order enforced by copy. |
| Ch1 — what Luna is / is not, before any data collection | `chapter-1-frame.html` | Covered | "Before we set anything up, here's what Luna is — and what it isn't… does not dose your mealtime insulin, does not run during the day. You stay in control." Directly serves the trust outcome. |
| Ch2 — capture current routine (TDBD as prescribed), "plain capture" (Ch2 decision) | `chapter-2-routine.html` | Covered | "Tell Luna your routine… Enter your TDBD exactly as your clinician prescribed it — this is just what you take now, not a change… Mealtime/bolus isn't entered here." Plain-capture framing. |
| Ch3 — pair Luna Capsule (BLE) — setup sequence step 1 | `chapter-3-pair-luna.html` | Covered | "Pair your Luna Capsule… pairs over Bluetooth." Tonight panel shows 1 of 3. |
| Ch4 — pair CGM (Dexcom G7) — setup sequence step 2 (D2 locked sensor) | `chapter-4-pair-cgm.html` | Covered | "Pair your CGM — Luna reads your glucose from your Dexcom G7." Tonight panel 2 of 3. Note: App Map tags CGM-pairing screens to Abbott Libre 3 (Full) as needing a sensor-agnostic abstraction; this wireframe hardcodes Dexcom G7 — acceptable for pivotal (D2) but see scope note. |
| Ch5 — clean handoff into Apollo Training, coordinator closeout (E8 — Onboarding owns closeout) | `chapter-5-handoff.html` | Covered | "You're set up… a coordinator walks you through setting up your device tonight — Luna Training picks up right here… Start Luna Training." Matches E8 closeout ownership and the "one onboarding" seam. |
| Recurring "Tonight" panel filling across the arc (persistent visual spine) | present in ch3/ch4/ch5/setup-landing + dedicated `tonight-panel-states.html` | Covered | "Your first night — N of 3 ready", order locked "pair Luna → pair CGM → enter TDBD". `tonight-panel-states.html` documents States 0–3. |
| Setup Landing (none / Luna complete / all) state gating | `setup-landing.html` | Covered | Shows None / "Luna done" / All states, "Luna needs all three before your first night." |
| UI Walkthrough reads as one onboarding with Apollo (BR-B5 seam) | `ui-walkthrough.html` | Covered | "Quick tour · 1 of 5… After the tour, your coordinator picks up right here… it's all one walkthrough." Matches Apollo BR-B5. |
| App-Map-tagged screens: Setup Default/Load 1–3, Setup App Walkthrough 1–5 + Done, Long-acting insulin 1/3/4, Session History Intro 1–4, Settings — Luna/Luna Controller | — | Partial / Missing | §5 explicitly enumerates these as in-scope. Only the UI Walkthrough (1 of 5) and a setup landing are wireframed. **Setup App Walkthrough 1–5+Done, Session History Intro 1–4, Long-acting insulin 1/3/4, and Settings — Luna/Luna Controller are NOT in this wireframe set.** Several are Tier None/Lean (re-skin or Commercial schema), but the walkthrough screens (Full) and the device-management surface are genuine gaps if expected here. |

**Open flags carried (Onboarding):** CGM chapter hardcodes Dexcom G7 while the App Map flags CGM pairing as needing a multi-sensor abstraction (Abbott Libre 3, Full tier). Per D2 / Decision 2 the pivotal sensor is Dexcom G7 and CGM-facing surfaces "stay sensor-agnostic regardless" — so this is acceptable for pivotal but the abstraction is not visible in the wireframe.

**Confidence: MEDIUM.** The five-chapter spine + Tonight panel + handoff are fully and well covered against the exec summary and §5. The gap is the broader App-Map-tagged setup/walkthrough/session-history-intro screen families that §5 lists as in-scope but that are absent from this folder; combined with unread BR-N wording, I cannot certify full §6 coverage.

---

## 4. Apollo Training

BRD `1h1ViWd7Uv0ue0qhOrecxdNZN10tF2zsMJGjC9l5wnlM`. §6 (the ten user steps, Evening/Morning sub-headings) was **not machine-readable** at the per-step level, BUT §5 enumerated the step grouping (evening 1–7, morning 8–10, three app-only screens, replay path) and **§7 came through in full (BR-B1…BR-B6 + App-only screens)** — used verbatim below.

### 4a. The ten user steps (§6 — step *titles* confirmed via App Map/wireframes; per-step BR body not machine-readable)

| Step (App Map / wireframe) | Satisfied by | Status | Notes |
|---|---|---|---|
| Step 01 Inventory | `step-01-inventory.html` | Covered | "Gather what you'll need: rapid-acting pen, Single-Sleep Reservoir, Luna Capsule (charged)." |
| Step 02 Open tray | `step-02-open-tray.html` | Covered | "Lift the lid until it clicks." Poster "TBD — SOONA mapping" flag. |
| Step 03 Fill reservoir | `step-03-fill.html` | Covered (with open flag) | "Dial **[X] units**… Flag dose value [X] — pending Eng/Clinical." Dose `[X]` open flag present and explicitly labelled. |
| Step 04 Remove label | `step-04-remove-label.html` | Covered | "Peel the label fully away so the reservoir seats cleanly." |
| Step 05 Attach capsule | `step-05-attach-capsule.html` | Covered | "Snap the controller on… lift straight up to remove the adhesive liner." |
| Step 06 Remove from base | `step-06-remove-base.html` | Covered | "Lift it off the base." Poster TBD flag. |
| Step 07 Apply to body | `step-07-apply-body.html` | Covered | "Apply it to your upper arm — press firmly for a few seconds." |
| Step 08 Remove device (morning) | `step-08-remove-device.html` | Covered | "Good morning. Time to remove it… before your next meal." Morning removal 1 of 3. |
| Step 09 Detach reservoir | `step-09-detach-reservoir.html` | Covered | "Peel the tab, then press the release button." |
| Step 10 Charge controller | `step-10-charge.html` | Covered | "Set the controller on its charger… ready for tonight." Done. |

### 4b. §7 cross-cutting behaviors (machine-readable — verbatim)

| Requirement | Satisfied by | Status | Notes |
|---|---|---|---|
| BR-B1 Start condition — land in Evening training as continuation of onboarding; training begins only after pairing | `intro.html` + Onboarding `chapter-5-handoff.html` | Covered | Handoff "Start Luna Training" → `intro.html` "Let's get you ready for tonight." Pairing happens in onboarding (Ch3/4), not re-taught here. |
| BR-B2 End condition — controller attached w/ insulin + last step confirmed; visibly **pauses for the night**; same-evening return resumes at a clean step boundary | `complete.html` + `overnight-handoff.html` | Partial | `complete.html` "You're all set… 10 Steps done / 1 Night logged." `overnight-handoff.html` "Active session… The session continues without you." Pause-for-night is legible. **Resume-at-clean-step-boundary on mid-session exit is not demonstrated by any wireframe** — no "resume where you left off" state shown. Verify. |
| BR-B3 Overnight pause checkpoint — paused state legible; "wear overnight, app guides removal in morning"; nothing appears pending | `overnight-handoff.html` | Covered | "Rest easy. Luna will manage your insulin overnight. A summary will be waiting in the morning… A notification will arrive in the morning." Matches plainly. |
| BR-B4 Next-morning re-entry — clear single way back into Morning training; mechanism undecided | `morning-start.html` | Partial | "Good morning. Time to remove the device… Start morning steps." A morning entry screen exists; the *mechanism* (auto-resume / persistent card / notification) is BRD-undecided, so cannot be fully validated — wireframe shows the destination, not the trigger. |
| BR-B5 Interplay with UI walkthrough — one order, clean handoff, only one active | Onboarding `ui-walkthrough.html` + `chapter-5-handoff.html` | Covered | Walkthrough "it's all one walkthrough"; handoff seam explicit. |
| BR-B6 Replay availability — Settings > Help > Training Guide | — | Missing (out of this wireframe set) | No Settings>Help>Training Guide replay screen in this folder. App Map "Setup, Training Guides (index)" / "Settings — App/About/Help" exist as rows but are not wireframed here. Flag. |
| App-only screens — three app-UI screens handled in-app (not on camera) | `intro.html`, `complete.html`, `hardware-checkpoint.html` + evening/morning outro, morning-start | Covered | Multiple app-only screens present (intro, hardware checkpoint, outros, complete). §5 says "three app-only screens (enumerated in §7)" — exact enumeration not machine-readable, so I cannot confirm the *specific* three match. |

**Open flags carried (Apollo):**
- **Dose `[X]`** — `step-03-fill.html` and spine `02-training-step.html`: "Dial [X] units… Flag dose value [X] — pending Eng/Clinical." Open, correctly flagged.
- **Hardware error-states** — `hardware-checkpoint.html` carries explicit open flags: "Open verify-before-body order" and "Open error states — Eng/Clinical." These two are unresolved by design.
- **verify-before-body ordering** — flagged open on the hardware checkpoint screen (the order in which device-on-body verification happens relative to body application is unresolved).
- Poster/asset mappings ("poster TBD — SOONA mapping", "asset: Cam+A-N") are production placeholders, not BRD gaps.

**Confidence: MEDIUM-HIGH.** This is the strongest-covered feature: all 10 steps wireframed, §7 fully readable and largely covered, open flags explicitly surfaced in the wireframes themselves. Gaps are BR-B6 replay path, BR-B2 mid-session resume state, and BR-B4 re-entry mechanism (BRD-undecided). Per-step BR body wording unread.

---

## 5. Dark UI

BRD `12868Hp1iLILPfLYEUtxI1TeI-Se5HhIqvpS_sJD7_R8` — **fully machine-readable** (lean BRD, no collapsed §6). Audited per the instruction: confirm spine + all feature screens are force-dark, with light allowed only for the dose sheet + notification chrome.

| Requirement | Satisfied by | Status | Notes |
|---|---|---|---|
| Single global force-dark theme; app renders dark regardless of system setting; no in-app light/dark toggle | `_spine/index.html` + all spine archetypes + all feature wireframes | Covered | Spine index states "Force-dark always · Midnight surfaces throughout" and "Force-dark always" is a locked pattern. No light/dark toggle appears in any settings wireframe (`settings-*`, `05-settings-list`). |
| No full screen blasts white at night | All audited feature + spine screens | Covered | Every audited screen (home, training, onboarding, settings, session history, hypo-shield, IOB) renders on Midnight dark surfaces. No light full-screen found. |
| Light permitted ONLY for the dose sheet + notification chrome | `confirm-increase.html` / `03-dose-confirmation.html` dose sheet; notification chrome | Covered (per design intent) | The dose-confirmation sheet uses a comment "screen-03 only: home indicator must sit ABOVE the dose sheet," consistent with the dose sheet being a distinct (lighter) surface; the rest stays dark. Matches the stated allowance. (Visual contrast not rendered in this text audit — confirm in browser/visual QA.) |
| Critical = Plum, never red | spine index locked pattern | Covered | "Critical = Plum, never red" is an enumerated locked pattern in the spine. |
| Apple HIG semantic colors / Dynamic Type / accessibility preserved | spine index | Covered (by claim) | Spine cites "D-DIN · 11-level HIG type." Accessibility preservation is a functional-QA item, not verifiable from static HTML — defer to QA. |
| ~38 "Unchanged" legacy screens get the dark re-skin (the actual scope of this BRD) | — | **Missing — by definition / NOTE** | This is the key carry-forward: Dark UI's scope IS the ~38 Unchanged screens enumerated in the App Map (Post-session Load 1–4, Get to Know/Legend, Pair Luna failures, Compatibility modals, Session History Swipe/No-Data, Toasts, Settings App/About/Help, Firmware OTA errors, Searching/App Error, etc.). **None of those ~38 are in this wireframe set** — the spine + feature wireframes are the *Changed* screens that establish the standard; the ~38 Unchanged still need the dark treatment applied. This is expected (Dark UI is sequenced last as a single sweep over the stable UI) but is the open coverage item to track. |

**Confidence: HIGH** on the spine/feature force-dark coverage and the design-standard establishment; the ~38 Unchanged legacy screens are correctly out of this wireframe set and remain the tracked to-do. Visual contrast/accessibility need a rendered QA pass (out of scope for a static-text audit).

---

## Prioritized Gaps summary

**P1 — verify before HF / build lock (real ambiguities):**
1. **IOB pre-session announcement — shared two-step component?** `pre-session-iob-announcement.html` frames opt-in correctly but the rendered copy does not confirm it invokes the shared two-step acknowledgement component that §2/D1 require on first enable (App Map titles it "+ Confirmation Modal"). Confirm wired vs. informational-only.
2. **Apollo BR-B2 mid-session resume state** — no wireframe shows "resume where you left off at a clean step boundary" after a same-evening exit. The pause/complete states exist; the resume state does not.
3. **Apollo BR-B6 replay path** (Settings > Help > Training Guide) — no wireframe.

**P2 — in-scope screens enumerated in BRD §5 but absent from this folder:**
4. **Onboarding** — Setup App Walkthrough 1–5 + Done, Session History Intro 1–4, Long-acting insulin 1/3/4, Settings — Luna/Luna Controller (§5 lists all as in-scope; only UI Walkthrough 1-of-5 + setup landing wireframed).
5. **HypoShield push notification** (prompt-to-open) — no lock-screen/push wireframe (push copy is Jasper Phase-4, but the prompt-to-open surface itself is unwireframed).
6. **Apollo BR-B4 morning re-entry mechanism** — BRD-undecided (auto-resume / card / notification); wireframe shows the destination only. Track as BRD-open, not a wireframe defect.

**P3 — tracked, expected:**
7. **Dark UI ~38 Unchanged legacy screens** — not in this set by design (last-sweep); still need the dark treatment applied + visual/accessibility QA.

---

## Untraceable wireframe elements (possible scope creep)

Reviewed every wireframe for elements with no BRD home. Findings — **minimal scope creep; most "extras" trace to a decision or the App Map:**

- **"Ask Luna" chat input** on `home-iob-on.html` and spine `01-home-dashboard.html` ("Ask Luna anything…"). No BRD in this set defines an Ask-Luna conversational surface. **Untraceable to the five audited BRDs** — likely belongs to a different feature/BRD. Flag for ownership.
- **`evening-outro.html` / `morning-outro.html` "Personal video"** (Tonight / Week-ahead personal videos). Apollo §5 mentions video/photo shoot dependency and app-only screens; these outros plausibly fall under Apollo's app-only screens but are not individually enumerated in machine-readable BR text. Low-risk; confirm they are among the sanctioned "three app-only screens."
- **`learning-state.html` "Dosing mode — Establishing baseline"** — matches HypoShield §5 "Dosing Mode communication," so traceable.
- Everything else mapped cleanly to a §5 in-scope item, an App Map row, or a recorded decision. No invented features beyond Ask-Luna.

---

## Sections NOT machine-readable (manual confirm needed before sign-off)

`get_document` collapsed these to heading anchors with no body — coverage of their specific sub-clauses was NOT assumed:

- **HypoShield BRD §6** (all BR-N recommendation-surface requirements) and **§7** (cross-cutting behaviors incl. the "never silently auto-applied," rest cadence, and two-step-gesture acceptance wording). §5 in-scope list, exec summary, risks/glossary anchors only.
- **IOB Display BRD §6** (BR-N IOB-surface requirements) and **§7** (cross-cutting). §2 reconciliation paragraph + exec summary were readable.
- **Onboarding BRD §6** (BR-N chapter/surface requirements) and **§7** (cross-cutting). §5 in-scope list (incl. App-Map screen enumeration + Tonight panel) was readable.
- **Apollo BRD §6** per-step BR bodies (Evening 1–7 / Morning 8–10 sub-headings came through; the individual step requirement text did not). **Apollo §7 (BR-B1–B6 + App-only) WAS fully readable.**
- Across all four prose BRDs: §9 Risks, §10 Open questions, §11 Glossary detail also collapsed (not required for coverage, noted for completeness).

**Fully readable (full confidence):** Dark UI BRD (entire), Consolidated Decisions doc (entire — C1–C3, P1–P4, E1–E8, Q10, D1–D2, Decisions 1–5), App Map sheet (entire), all five `app-map.json` files, all wireframe rendered copy.

---

## Per-feature confidence at a glance

| Feature | Coverage of readable/reconstructed requirements | Confidence | Why not higher |
|---|---|---|---|
| HypoShield | All 8 §5 in-scope surfaces covered; two-part gesture correct | MEDIUM | §6/§7 BR-N wording unread; push surface absent |
| IOB Display | Core surfaces + units + default-OFF covered | MEDIUM-HIGH | Pre-session two-step component unconfirmed; BR-N unread |
| Onboarding | 5-chapter spine + Tonight panel + handoff covered | MEDIUM | Several §5-tagged setup/walkthrough/SH-intro screens absent; BR-N unread |
| Apollo Training | 10 steps + §7 (readable) largely covered | MEDIUM-HIGH | BR-B2 resume / BR-B6 replay gaps; per-step BR body unread |
| Dark UI | Spine + feature screens force-dark; standard set | HIGH | ~38 Unchanged still pending; visual/accessibility QA outside static audit |
