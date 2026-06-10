# Hypo Shield v0.4 — consolidated revision round (Jun 2026)

Source: John's consolidated screen-by-screen feedback (2026-06-10) + PM-pass decisions.
Locked decisions: **(D1)** "long-acting insulin / long-acting dose" everywhere — basal + TDBD retired
from user-facing copy (TDBD appears once as a parenthetical in the education sheet). **(D2)** TDBD Detail
merged into Settings · Hypo Shield; Home chip deep-links there. **(D3)** "Not now" = snooze until morning
(reappears as the Home tip card; never expires; always retrievable in Settings).

| ID | Tier | Target | Change | Status |
|---|---|---|---|---|
| G1 | Global | all Hypo screens + DoseSheet | Terminology sweep per D1 | ✅ |
| G2 | Global | [slug].astro + ux-review.ts | Prev/next navigation within the current feature flow (all feature sets), with position indicator + arrow keys | ✅ |
| G3 | Global | ios-spine.css + Hypo cards | Hypo Shield card contrast: 3 directions mocked on Home—Default Tip; recommended one applied fleet-wide pending John's pick | ✅ |
| G4 | Global | ios-spine.css + DoseSheet + push app icon | Center the moon-mark crescent vertically (was 1–2px high in every CSS moon: ask-luna, tip-card, tip-post, learn-card, sheet, dose-moon, push app-ico) | ✅ |
| G5 | Global | all | "Hypo Shield" two-word naming everywhere | ✅ |
| F1 | Flow | NEW RecommendationDetailScreen | Full-screen recommendation takeover — old vs new dose contrast, what Luna noticed (personal data), how Luna decided, education link. Gates EVERY recommendation: home tip post, mid-session announcement and push all converge here before the two-step confirm | ✅ |
| F2 | Flow | hypo-confirm-increase | Deleted (duplicate of dose-confirmation-spine) | ✅ |
| F3 | Flow | hypo-confirm-reset-required → NEW ConfirmSuccessScreen | Replaced with positive confirmation: settings updated, take-the-dose-this-evening reminder, relearning started (7 days + 5 sessions). Manual-change-resets-learning message moved to a Learning State banner | ✅ |
| F4 | Flow | hypo-tdbd-detail → Settings | Merged per D2; Settings gains learning progress + history; standalone screen deleted | ✅ |
| F5 | Flow | NEW HypoHowItWorksScreen | "How Hypo Shield works" education screen, linked from Learning State, Settings, and the takeover | ✅ |
| F6 | Flow | ux-review.ts + app-map.json + ScreenRenderer | FLOWS / FLOW_NEXT / REGISTRY / FRAME / manifest updated for the new spine; sentence-case titles | ✅ |
| S1 | Screen | HomeTipDefault | Chip full-width; card communicates "learning about you" (bubble = communication-only rule); long-acting copy | ✅ |
| S2 | Screen | LearningState | CGM graph added for context; symmetric AND divider; de-duplicated copy + education link; personalized with the user's own nights; high-contrast card | ✅ |
| S3 | Screen | HomeTipPost | Compact notice (fits on screen); only action opens the takeover (F1) | ✅ |
| S4 | Screen | MidSessionAnnouncement | Tab bar restored in backdrop (bottom nav never missing); "Not now" = snooze-until-morning per D3, annotated; CTA → takeover | ✅ |
| S5 | Screen | PushNotification | New copy (suggestion ready / open Luna / you act manually); "Tap to open Luna" hint removed; iOS bottom-stack convention noted | ✅ |
| S6 | Screen | DoseConfirmation / DoseSheet | Top padding fix (compressed logo); chip "Increase your long-acting dose"; ack items single-line (subtext removed); item 2 per John's wording | ✅ |
| S7 | Screen | ConfirmSkip | Terminology sweep | ✅ |
| S8 | Screen | SettingsHypoShield | "Always on for your study" + T2D footnote removed; learning + history merged in (F4) | ✅ |

PM flags carried into the build (for John's review):
1. Dose-confirm ack #2 now reads "Increase your long-acting dose to 14 units" per John's note — flagged: it no longer
   explicitly says *take the physical dose*, which the two-step safety spec depends on. Recommend
   "Take your 14-unit long-acting dose tonight" if the distinction must stay explicit.
2. Lock-screen push stays bottom-stacked (iOS 16+ accurate); top placement is the unlocked-banner variant.
3. Tab bar kept visible on the takeover per "never missing" rule — deviates from stock iOS full-screen modal behavior.
