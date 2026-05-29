// app.jsx — router + state + tweaks

const { useState, useEffect, useRef } = React;

// Intro/Checkpoint/Overnight variant options
const INTRO_VARIANTS = ['A', 'B', 'C'];
const CHECKPOINT_VARIANTS = ['A', 'B', 'C'];
const OVERNIGHT_VARIANTS = ['A', 'B', 'C'];

// Flow definition
// 0 = intro, 1..10 = steps, 11 = overnight, 12 = morning intro, 13..X handled through step 10, 14 = complete
// Simpler: use named phases
const PHASES = [
  'intro',         // 0
  'step1',         // 1
  'step2',         // 2
  'step3',         // 3
  'step4',         // 4
  'step5',         // 5
  'step6',         // 6
  'step7',         // 7
  'checkpoint',    // 8
  'eveningOutro',  // 9   personal video — preview tonight
  'overnight',     // 10
  'morning',       // 11
  'step8',         // 12
  'step9',         // 13
  'step10',        // 14
  'complete',      // 15  personal video — week of learning
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Moonlight",
  "eveningSurface": "gradient",
  "progressStyle": "bar",
  "copyTone": "concise",
  "showInventoryChecks": true,
  "fontPairing": "ui",
  "introVariant": "A",
  "checkpointVariant": "A",
  "overnightVariant": "A"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [overnightTick, setOvernightTick] = useState(0);
  const [morningFade, setMorningFade] = useState(false);
  const phase = PHASES[phaseIdx];

  const accentTokens = ACCENTS[tweaks.accent] || ACCENTS.Moonlight;
  const accent = accentTokens.mid;

  const next = () => setPhaseIdx((i) => Math.min(i + 1, PHASES.length - 1));
  const back = () => setPhaseIdx((i) => Math.max(i - 1, 0));
  const goTo = (name) => setPhaseIdx(PHASES.indexOf(name));
  const close = () => goTo('intro');

  // Overnight: animate the clock forward to suggest time passing, but DO
  // NOT auto-advance. Per brief, the reviewer must explicitly tap the
  // simulated push notification to enter the morning session.
  useEffect(() => {
    if (phase !== 'overnight') return;
    setOvernightTick(0);
    const tickId = setInterval(() => setOvernightTick((t) => Math.min(t + 1, 3)), 1200);
    return () => { clearInterval(tickId); };
  }, [phase]);

  // Morning fade overlay — brief sunrise glow when transitioning from
  // overnight to morning, triggered by the user's notification tap.
  const goToMorning = () => {
    setMorningFade(true);
    setTimeout(() => { setMorningFade(false); goTo('morning'); }, 700);
  };
  // Current overnight time (4 stops as the user dwells on the screen)
  const overnightTimes = ['11:23 PM', '12:47 AM', '3:14 AM', '5:48 AM'];
  const currentTime = overnightTimes[Math.min(overnightTick, overnightTimes.length - 1)];

  // Status-bar time per phase
  const timeForPhase = (() => {
    if (phase === 'intro') return '11:14 PM';
    if (phase.startsWith('step')) {
      const n = parseInt(phase.slice(4), 10);
      if (n <= 7) return ['11:14 PM','11:16 PM','11:17 PM','11:18 PM','11:19 PM','11:19 PM','11:20 PM'][n - 1];
      return ['7:13 AM', '7:14 AM', '7:15 AM'][n - 8];
    }
    if (phase === 'checkpoint') return '11:21 PM';
    if (phase === 'eveningOutro') return '11:22 PM';
    if (phase === 'overnight')  return currentTime;
    if (phase === 'morning')    return '7:12 AM';
    if (phase === 'complete')   return '7:16 AM';
    return '9:41';
  })();

  // Surface for a given step
  const eveningSurfaceForStep = (() => {
    if (tweaks.eveningSurface === 'flat') return 'midnight-flat';
    if (tweaks.eveningSurface === 'paper') return 'paper';
    return 'dark'; // gradient
  })();

  // Render the active phase into the frame
  const renderPhase = () => {
    if (phase === 'intro') {
      return <IntroScreen variant={tweaks.introVariant} accent={accent}
        copyTone={tweaks.copyTone} onStart={next} onClose={close}
        fontPairing={tweaks.fontPairing} />;
    }
    if (phase === 'step1') {
      return <InventoryStep accent={accent} copyTone={tweaks.copyTone}
        progressStyle={tweaks.progressStyle} showChecks={tweaks.showInventoryChecks}
        onNext={next} onBack={back} />;
    }
    if (phase.startsWith('step')) {
      const n = parseInt(phase.slice(4), 10);
      const surface = n <= 7 ? eveningSurfaceForStep : 'paper';
      return <VideoStep step={n} accent={accent} copyTone={tweaks.copyTone}
        progressStyle={tweaks.progressStyle} surface={surface}
        onNext={n === 10 ? () => goTo('complete') : next} onBack={back} />;
    }
    if (phase === 'checkpoint') {
      return <HardwareCheckpointScreen variant={tweaks.checkpointVariant} accent={accent}
        progressStyle={tweaks.progressStyle} onNext={next} onBack={back} />;
    }
    if (phase === 'eveningOutro') {
      return <PersonalOutro
        accent={accent}
        eyebrow="Personal video · Tonight"
        title="You're all set for tonight."
        body="Here's a quick note on what to expect on your first night with Luna — how it feels, what the alerts sound like, and what to do if anything surprises you."
        mediaTag="Personal video · Tonight"
        buttonLabel="Continue"
        onContinue={next} />;
    }
    if (phase === 'overnight') {
      return <OvernightScreen variant={tweaks.overnightVariant} accent={accent}
        copyTone={tweaks.copyTone} onContinue={goToMorning}
        currentTime={currentTime} />;
    }
    if (phase === 'morning') {
      return <MorningScreen accent={accent} copyTone={tweaks.copyTone}
        progressStyle={tweaks.progressStyle} onStart={() => goTo('step8')} onBack={back} />;
    }
    if (phase === 'complete') {
      return <PersonalOutro
        accent={accent}
        eyebrow="Personal video · The week ahead"
        title="Nice work — your morning's complete."
        body="Over the next week, Luna is learning your patterns. A quick note on what we'll be watching for, what you'll see in the app, and when to check in."
        mediaTag="Personal video · Week of learning"
        buttonLabel="Go to dashboard"
        onContinue={() => goTo('intro')} />;
    }
    return null;
  };

  // Phase label for data-screen-label
  const phaseLabel = (() => {
    const map = {
      intro: '01 Intro',
      step1: '02 Step 01 Inventory',
      step2: '03 Step 02 Open Tray',
      step3: '04 Step 03 Fill Insulin',
      step4: '05 Step 04 Flip',
      step5: '06 Step 05 Snap',
      step6: '07 Step 06 Remove Base',
      step7: '08 Step 07 Apply',
      checkpoint: '09 Hardware Checkpoint',
      eveningOutro: '10 Evening Outro',
      overnight: '11 Luna Active',
      morning: '12 Morning',
      step8: '13 Step 08 Remove',
      step9: '14 Step 09 Detach',
      step10: '15 Step 10 Charge',
      complete: '16 Morning Outro',
    };
    return map[phase] || phase;
  })();

  return (
    <div style={{
      minHeight: '100vh', background: LUNA.cloudLilac,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px 32px',
      fontFamily: LUNA.fontUI, position: 'relative',
    }}>
      <TopBar phase={phase} phaseIdx={phaseIdx} total={PHASES.length}
        onJump={goTo} accent={accent} />

      <div data-screen-label={phaseLabel} style={{ position: 'relative', marginTop: 28 }}>
        {/* Morning fade overlay */}
        {morningFade && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 48, zIndex: 100,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,195,92,0.55) 0%, rgba(255,195,92,0.20) 40%, rgba(255,255,255,0.9) 85%)',
            animation: 'lunaMorningFade 800ms ease-in forwards',
            pointerEvents: 'none',
          }} />
        )}
        <IOSDevice width={376} height={780} dark={phase !== 'morning' && phase !== 'checkpoint' && phase !== 'step8' && phase !== 'step9' && phase !== 'step10'}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Status bar overlay — covers IOSDevice's built-in status bar (z-index 10)
                with our own opaque layer matching the screen surface, so we show the
                contextual training time (11:14 PM, 7:12 AM, etc) instead of 9:41. */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 30,
              pointerEvents: 'none',
              background: (() => {
                const isLightSurface = phase === 'morning' || phase === 'checkpoint'
                  || ['step8','step9','step10'].includes(phase);
                if (isLightSurface) return LUNA.softPaper;
                if (tweaks.eveningSurface === 'flat' && phase !== 'overnight') return LUNA.midnight;
                if (phase === 'overnight') return LUNA.midnight;
                return '#0D2550'; /* matches gradient top */
              })(),
            }}>
              <div style={{
                position: 'absolute', top: 20, left: 0, right: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 26px', whiteSpace: 'nowrap',
                fontFamily: LUNA.fontUI, fontSize: 13, fontWeight: 600,
                color: (phase === 'morning' || phase === 'checkpoint' || ['step8','step9','step10'].includes(phase))
                  ? LUNA.midnight : LUNA.onDark,
              }}>
                <span>{timeForPhase}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <SignalGlyph dark={!(phase === 'morning' || phase === 'checkpoint' || ['step8','step9','step10'].includes(phase))} />
                  <WifiGlyph dark={!(phase === 'morning' || phase === 'checkpoint' || ['step8','step9','step10'].includes(phase))} />
                  <BatteryGlyph dark={!(phase === 'morning' || phase === 'checkpoint' || ['step8','step9','step10'].includes(phase))} />
                </span>
              </div>
            </div>
            {renderPhase()}
          </div>
        </IOSDevice>
      </div>

      <TweaksUI tweaks={tweaks} setTweak={setTweak} onJump={goTo} />
      <ReviewerFlags />
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top bar — slim phase nav + branding
// ─────────────────────────────────────────────────────────────
function TopBar({ phase, phaseIdx, total, onJump, accent }) {
  const session = (() => {
    if (phase === 'intro') return { label: 'Evening', kind: 'evening' };
    if (phase.startsWith('step') && parseInt(phase.slice(4), 10) <= 7) return { label: 'Evening', kind: 'evening' };
    if (phase === 'checkpoint') return { label: 'Evening', kind: 'evening' };
    if (phase === 'eveningOutro') return { label: 'Evening', kind: 'evening' };
    if (phase === 'overnight') return { label: 'Overnight', kind: 'overnight' };
    if (phase === 'morning' || ['step8','step9','step10'].includes(phase)) return { label: 'Morning', kind: 'morning' };
    if (phase === 'complete') return { label: 'Morning', kind: 'morning' };
    return { label: '—', kind: 'evening' };
  })();

  const sessionColors = {
    evening:   { bg: 'rgba(4,30,66,0.06)', ink: LUNA.midnight, dot: LUNA.midnight },
    overnight: { bg: `${accent}1f`,         ink: LUNA.midnight, dot: accent },
    morning:   { bg: 'rgba(249,205,133,0.20)', ink: '#7C5316', dot: '#D9A24A' },
  }[session.kind];

  return (
    <div style={{
      position: 'absolute', top: 20, left: 24, right: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: LUNA.fontUI,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LunaWordmark size={14} accent={accent} ink={LUNA.midnight} />
        <div style={{ height: 14, width: 1, background: LUNA.borderStrong }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: LUNA.midnight, letterSpacing: '-0.005em' }}>Apollo — Training flow</div>
          <div style={{ fontSize: 9.5, color: LUNA.slate, marginTop: 1, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>v2.2 · Interactive prototype</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
          color: sessionColors.ink, background: sessionColors.bg,
          borderRadius: 999, padding: '4px 10px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sessionColors.dot }} />
          {session.label}
        </span>
        <span style={{ fontSize: 11, color: LUNA.slate, fontWeight: 500 }}>
          {phaseIdx + 1} / {total}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status-bar glyphs (no emoji — brand rule)
// ─────────────────────────────────────────────────────────────
function SignalGlyph({ dark }) {
  const c = dark ? '#FFFFFF' : '#041E42';
  return (
    <svg width="17" height="10" viewBox="0 0 17 10" fill={c}>
      <rect x="0"  y="7" width="2.6" height="3"   rx="0.6" />
      <rect x="4"  y="5" width="2.6" height="5"   rx="0.6" />
      <rect x="8"  y="2.5" width="2.6" height="7.5" rx="0.6" />
      <rect x="12" y="0" width="2.6" height="10"  rx="0.6" />
    </svg>
  );
}
function WifiGlyph({ dark }) {
  const c = dark ? '#FFFFFF' : '#041E42';
  return (
    <svg width="15" height="10" viewBox="0 0 15 10" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 3.7a11 11 0 0 1 13 0" />
      <path d="M3.3 6a7.5 7.5 0 0 1 8.4 0" />
      <path d="M5.5 8.3a4 4 0 0 1 4 0" />
      <circle cx="7.5" cy="9.4" r="0.6" fill={c} stroke="none" />
    </svg>
  );
}
function BatteryGlyph({ dark }) {
  const c = dark ? '#FFFFFF' : '#041E42';
  return (
    <svg width="26" height="11" viewBox="0 0 26 11">
      <rect x="0.6" y="0.6" width="22" height="9.8" rx="2.4" ry="2.4"
            fill="none" stroke={c} strokeOpacity="0.55" strokeWidth="0.9" />
      <rect x="23.4" y="3.6" width="1.6" height="3.8" rx="0.8" fill={c} fillOpacity="0.55" />
      <rect x="2" y="2" width="17" height="7" rx="1.2" fill={c} />
    </svg>
  );
}

function Footer() {
  return (
    <div style={{
      marginTop: 24, fontSize: 10.5, color: LUNA.slate,
      fontFamily: LUNA.fontUI, textAlign: 'center', maxWidth: 520,
      letterSpacing: '0.02em',
    }}>
      Luna Design System v1.0 · Tap the phone to walk the flow · Turn on <b style={{ color: LUNA.graphite }}>Tweaks</b> in the toolbar to explore variants.
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reviewer Flags — honest gap list per the brief's "flag, don't guess"
// directive. Floating button on the left side; opens a modal panel.
// ─────────────────────────────────────────────────────────────
function ReviewerFlags() {
  const [open, setOpen] = useState(false);
  const FLAGS = [
    {
      kind: 'reconciled',
      title: 'Aligned to Luna mobile design context (May 2026)',
      body: "Updated per Finch Brands' Luna Visual System Extension: D-DIN is now the primary brand font at all weights (was display-only); tagline updated to \u201cSleep well. Wake up well. Better.\u201d on the wordmark-led intro; CGM references are now sensor-agnostic; the \u201cEncouraging\u201d copy tone was softened and renamed \u201cWarm\u201d to match brand tone words (Quiet \u00b7 Calm \u00b7 Protector \u00b7 Sleep) \u2014 no \u201cyou\u2019ve got this\u201d energy.",
    },
    {
      kind: 'reconciled',
      title: 'Step count reconciled to BRD (10, not 11)',
      body: "Wireframes v2.1 read \u201cX of 11\u201d on several screens. The BRD defines 10 steps total (1\u20137 evening, 8\u201310 morning). The progress header now uses 10. Hardware Checkpoint and Morning intro are unnumbered gates.",
    },
    {
      kind: 'reconciled',
      title: 'Third Bluetooth checkpoint added at Step 09 (Detach)',
      body: "Wireframes only showed two BT events (entry Hardware Checkpoint + Step 10 charge confirm). Per BRD, three exist; the third verifies reservoir disconnection at Step 09. Implemented as an in-step BT gate that disables Next until confirmed.",
    },
    {
      kind: 'open',
      title: 'Step 03 dose: shown as [X] placeholder',
      body: "The personalized dose formula is owned by Clinical and Eng. We do not invent a value. The Fill step renders a clearly marked [X] token with an \u2018Open\u2019 flag inline.",
    },
    {
      kind: 'open',
      title: 'Bluetooth checkpoint event behavior',
      body: "Exact event names, retry policy, timeout, and failure UX for the three BT checkpoints are not specified in v2.1. The prototype shows a generic searching \u2192 confirmed pattern; production behavior must be defined by Firmware before HF testing.",
    },
    {
      kind: 'open',
      title: 'Morning re-entry mechanism',
      body: "Three mechanisms were considered: auto-resume on app open, an in-app card, or a push notification. The prototype shows the push-notification path as the most defensible from cold-start (and the most testable in HF). Confirm with PM.",
    },
    {
      kind: 'substitution',
      title: 'Time labels and overnight tick are illustrative',
      body: "Status-bar times (11:14 PM \u2192 7:12 AM) and the 4-stop overnight clock are visual placeholders to convey time-of-day. Real timing comes from device state, not the prototype.",
    },
    {
      kind: 'substitution',
      title: 'Videos are simulated',
      body: "Step videos render as a tagged placeholder tile with a shimmer for \u2018playing\u2019. Replay (\u2018Watch again\u2019) is wired to re-trigger the simulated playback only.",
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 80,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: LUNA.white, border: `1px solid ${LUNA.borderSubtle}`,
          borderRadius: 999, padding: '8px 14px',
          fontFamily: LUNA.fontUI, fontSize: 12, fontWeight: 600,
          color: LUNA.midnight,
          boxShadow: LUNA.shadowRaised, cursor: 'pointer',
        }}
      >
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: LUNA.warningSoft, border: `1px solid ${LUNA.warningFill}`,
          color: LUNA.warningInk,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: LUNA.fontUI,
        }}>{FLAGS.length}</span>
        Reviewer flags
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(4,30,66,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: LUNA.fontUI,
            animation: 'lunaFadeIn 180ms ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(640px, 92vw)', maxHeight: '80vh', overflow: 'auto',
              background: LUNA.white, borderRadius: 24,
              boxShadow: LUNA.shadowModal,
              padding: 0,
            }}
          >
            <div style={{ padding: '22px 26px 14px', borderBottom: `1px solid ${LUNA.borderSubtle}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: LUNA.slate }}>Apollo Training</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: LUNA.midnight, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Reviewer flags</h2>
                </div>
                <button onClick={() => setOpen(false)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: LUNA.slate, padding: 4,
                }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: LUNA.graphite, margin: '8px 0 0', lineHeight: 1.55, maxWidth: 540 }}>
                Honest gap list versus the v2.1 wireframes and the BRD. Tier-A regulated training artifact — entry/exit conditions must be HF-defensible. Where the BRD is silent, the prototype uses obvious placeholders rather than inventing.
              </p>
            </div>
            <div style={{ padding: '6px 12px 18px' }}>
              {FLAGS.map((f, i) => <FlagItem key={i} flag={f} />)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FlagItem({ flag }) {
  const palette = {
    open:        { bg: LUNA.warningSoft, ink: LUNA.warningInk, dot: '#D9A24A', label: 'Open' },
    reconciled:  { bg: LUNA.moonlightTint, ink: LUNA.moonlightDeep, dot: LUNA.moonlight, label: 'Reconciled' },
    substitution:{ bg: LUNA.cloudLilac, ink: LUNA.graphite, dot: LUNA.pebbleBlue, label: 'Substitution' },
  }[flag.kind];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '110px 1fr',
      padding: '14px', gap: 14,
      borderRadius: 12, margin: '6px 4px',
    }}>
      <div style={{
        height: 'fit-content',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        background: palette.bg, color: palette.ink,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        justifySelf: 'start',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.dot }} />
        {palette.label}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: LUNA.midnight, letterSpacing: '-0.005em' }}>{flag.title}</div>
        <div style={{ fontSize: 12.5, color: LUNA.graphite, marginTop: 4, lineHeight: 1.55, textWrap: 'pretty' }}>{flag.body}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tweaks UI
// ─────────────────────────────────────────────────────────────
function TweaksUI({ tweaks, setTweak, onJump }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Surface">
        <TweakSelect label="Accent color"
          value={tweaks.accent}
          options={Object.keys(ACCENTS)}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Evening surface"
          value={tweaks.eveningSurface}
          options={[
            { value: 'gradient', label: 'Gradient' },
            { value: 'flat', label: 'Flat Midnight' },
            { value: 'paper', label: 'Soft Paper' },
          ]}
          onChange={(v) => setTweak('eveningSurface', v)} />
        <TweakRadio label="Font pairing"
          value={tweaks.fontPairing}
          options={[
            { value: 'ui', label: 'Inter only' },
            { value: 'display', label: 'D-DIN + Inter' },
          ]}
          onChange={(v) => setTweak('fontPairing', v)} />
      </TweakSection>
      <TweakSection title="Content">
        <TweakRadio label="Progress style"
          value={tweaks.progressStyle}
          options={[
            { value: 'bar', label: 'Bar' },
            { value: 'dots', label: 'Dots' },
            { value: 'numeric', label: 'Numeric' },
          ]}
          onChange={(v) => setTweak('progressStyle', v)} />
        <TweakRadio label="Copy tone"
          value={tweaks.copyTone}
          options={[
            { value: 'concise', label: 'Concise' },
            { value: 'warm', label: 'Warm' },
            { value: 'clinical', label: 'Clinical' },
          ]}
          onChange={(v) => setTweak('copyTone', v)} />
        <TweakToggle label="Inventory checkboxes"
          value={tweaks.showInventoryChecks}
          onChange={(v) => setTweak('showInventoryChecks', v)} />
      </TweakSection>
      <TweakSection title="Screen variations">
        <TweakRadio label="Intro"
          value={tweaks.introVariant}
          options={INTRO_VARIANTS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => setTweak('introVariant', v)} />
        <TweakRadio label="Hardware Checkpoint"
          value={tweaks.checkpointVariant}
          options={CHECKPOINT_VARIANTS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => setTweak('checkpointVariant', v)} />
        <TweakRadio label="Luna is Active"
          value={tweaks.overnightVariant}
          options={OVERNIGHT_VARIANTS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => setTweak('overnightVariant', v)} />
      </TweakSection>
      <TweakSection title="Jump to phase">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            ['Intro', 'intro'],
            ['Step 01', 'step1'], ['Step 02', 'step2'], ['Step 03', 'step3'],
            ['Step 04', 'step4'], ['Step 05', 'step5'], ['Step 06', 'step6'],
            ['Step 07', 'step7'], ['Checkpoint', 'checkpoint'], ['Evening Outro', 'eveningOutro'],
            ['Overnight', 'overnight'], ['Morning', 'morning'], ['Step 08', 'step8'],
            ['Step 09', 'step9'], ['Step 10', 'step10'], ['Morning Outro', 'complete'],
          ].map(([label, name]) => (
            <TweakButton key={name} onClick={() => onJump(name)}>{label}</TweakButton>
          ))}
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
