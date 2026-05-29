// screens.jsx — All training screens as presentational components

// ─────────────────────────────────────────────────────────────
// FlagBadge — visible "BRD reconciliation needed" marker used
// to honor the brief's rule: flag, don't fabricate.
// ─────────────────────────────────────────────────────────────
function FlagBadge({ children, surface = 'paper' }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: isDark ? 'rgba(249,205,133,0.10)' : LUNA.warningSoft,
      border: `1px dashed ${LUNA.warningFill}`,
      borderRadius: 8, padding: '5px 9px',
      fontSize: 10, fontWeight: 600,
      color: isDark ? LUNA.warningFill : LUNA.warningInk,
      fontFamily: LUNA.fontUI,
      letterSpacing: '0.02em'
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Open</span>
      <span style={{ fontWeight: 500 }}>{children}</span>
    </div>);

}


// Screen container — the inner 'scr' that sits inside the IOS device frame
function ScreenShell({ surface, accent, children, sunriseGlow }) {
  const bg = surface === 'dark' ?
  LUNA.gradientMidnight :
  surface === 'midnight-flat' ? LUNA.midnight :
  surface === 'paper' ? LUNA.softPaper :
  LUNA.softPaper;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: bg,
      display: 'flex', flexDirection: 'column',
      paddingTop: 54, /* room for status bar / dynamic island */
      fontFamily: LUNA.fontUI
    }}>
      {sunriseGlow &&
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,195,92,0.30) 0%, rgba(255,195,92,0.10) 35%, rgba(255,195,92,0) 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      }
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, minHeight: 0 }}>
        {children}
      </div>
      {/* home indicator safe area */}
      <div style={{ height: 34, flexShrink: 0 }} />
    </div>);

}

function StepBadge({ surface, accent, step }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  const c = isDark ? accent : LUNA.graphite;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: c, marginBottom: 6,
      fontFamily: LUNA.fontUI
    }}>
      <span style={{ width: 4, height: 4, borderRadius: 999, background: c }} />
      Step {String(step).padStart(2, '0')}
    </div>);

}

function Headline({ surface, children, size = 22 }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  return (
    <h1 style={{
      fontSize: size, fontWeight: 700, lineHeight: 1.2,
      color: isDark ? LUNA.onDark : LUNA.midnight,
      letterSpacing: '-0.02em', margin: 0,
      fontFamily: LUNA.fontUI,
      textWrap: 'pretty'
    }}>{children}</h1>);

}

function SubCopy({ surface, children }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  return (
    <p style={{
      fontSize: 13, lineHeight: 1.55, margin: '6px 0 0 0',
      color: isDark ? 'rgba(255,255,255,0.60)' : LUNA.graphite,
      fontFamily: LUNA.fontUI
    }}>{children}</p>);

}

// ─────────────────────────────────────────────────────────────
// Intro — variant A (default), B (video-led), C (wordmark focus)
// ─────────────────────────────────────────────────────────────
function IntroScreen({ variant, accent, copyTone, onStart, onClose, fontPairing }) {
  const copy = COPY[copyTone];

  const displayFont = fontPairing === 'display' ? LUNA.fontDisplay : LUNA.fontUI;

  if (variant === 'B') {
    return (
      <ScreenShell surface="dark" accent={accent}>
        <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>✕</button>
        <MediaTile kind="video" surface="dark" accent={accent}
        tag="Intro · Personal video" playing={false} height={280} />
        <div style={{ padding: '28px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...eyebrowStyle(accent), marginBottom: 14 }}>First session setup</div>
          <Headline surface="dark" size={24}>{copy.introTitle}</Headline>
          <div style={{ marginTop: 16 }}>
            <SubCopy surface="dark">{copy.introBody}</SubCopy>
          </div>
        </div>
        <div style={{ padding: '0 20px 24px' }}>
          <PrimaryButton surface="dark" accent={accent} onClick={onStart}>Let's start</PrimaryButton>
        </div>
      </ScreenShell>);

  }

  if (variant === 'C') {
    // Wordmark-led, calm, no video. Tagline-forward per brand voice.
    return (
      <ScreenShell surface="dark" accent={accent}>
        <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>✕</button>
        {/* Wordmark sits in the upper third per brand placement rule. */}
        <div style={{ paddingTop: 16, display: 'flex', justifyContent: 'center' }}>
          <LunaWordmark size={26} accent={accent} ink={LUNA.onDark} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
          <div style={eyebrowStyle(accent)}>First session setup</div>
          <h1 style={{
            fontSize: 32, fontWeight: 400, color: LUNA.onDark,
            letterSpacing: '-0.02em', margin: '6px 0 14px',
            fontFamily: LUNA.fontDisplay, lineHeight: 1.1
          }}>Sleep well.<br />Wake up well.<br />Better.</h1>
          <SubCopy surface="dark">{copy.introBody}</SubCopy>
        </div>
        <div style={{ padding: '0 20px 24px' }}>
          <PrimaryButton surface="dark" accent={accent} onClick={onStart}>Begin setup</PrimaryButton>
        </div>
      </ScreenShell>);

  }

  // Default — A: wordmark + icon + title + pill. Wordmark in upper third per brand rule.
  return (
    <ScreenShell surface="dark" accent={accent}>
      <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>✕</button>
      <div style={{ paddingTop: 16, display: 'flex', justifyContent: 'center' }}>
        <LunaWordmark size={24} accent={accent} ink={LUNA.onDark} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `${accent}22`, border: `1.5px solid ${accent}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
        <div style={eyebrowStyle(accent)}>First session setup</div>
        <Headline surface="dark" size={26}>{COPY[copyTone].introTitle}</Headline>
        <SubCopy surface="dark">{COPY[copyTone].introBody}</SubCopy>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <PrimaryButton surface="dark" accent={accent} onClick={onStart}>Let's start</PrimaryButton>
      </div>
    </ScreenShell>);

}

const closeBtnStyle = {
  position: 'absolute', top: 16, right: 16,
  width: 30, height: 30, borderRadius: '50%',
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', zIndex: 5, fontFamily: 'Inter, sans-serif'
};

function eyebrowStyle(accent) {
  return {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: accent, marginBottom: 10,
    fontFamily: LUNA.fontUI
  };
}

function Pill({ accent, children, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `${accent}1f`, border: `1px solid ${accent}44`,
      borderRadius: 999, padding: '6px 14px',
      fontSize: 11, color: 'rgba(255,255,255,0.78)',
      fontFamily: LUNA.fontUI,
      ...style
    }}>{children}</span>);

}

function ClockGlyph({ color = '#68D2DF', size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// Inventory step (Step 01) — with optional checkboxes
// ─────────────────────────────────────────────────────────────
function InventoryStep({ accent, copyTone, progressStyle, showChecks, onNext, onBack }) {
  const [checked, setChecked] = React.useState({ 1: false, 2: false, 3: false });
  const allChecked = !showChecks || checked[1] && checked[2] && checked[3];
  const copy = COPY[copyTone][1];

  const toggle = (n) => setChecked((c) => ({ ...c, [n]: !c[n] }));

  return (
    <ScreenShell surface="dark" accent={accent}>
      <ProgressHeader step={1} total={10} surface="dark" accent={accent} style={progressStyle} onBack={onBack} />
      <MediaTile kind="still" surface="dark" accent={accent}
      tag="Step 01 · Type A · Still" height={240} />
      <div style={{ padding: '14px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StepBadge surface="dark" accent={accent} step={1} />
        <Headline surface="dark" size={20}>{copy.head}</Headline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
          {INVENTORY.map((item) => {
            const isOn = checked[item.n];
            return (
              <div
                key={item.n}
                onClick={showChecks ? () => toggle(item.n) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isOn ? `${accent}22` : `${accent}12`,
                  borderRadius: 12, padding: '10px 12px',
                  border: `1px solid ${isOn ? `${accent}88` : `${accent}28`}`,
                  transition: 'all 200ms ease',
                  cursor: showChecks ? 'pointer' : 'default'
                }}>
                
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: isOn || !showChecks ? accent : 'transparent',
                  border: !isOn && showChecks ? `1.5px solid ${accent}88` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: LUNA.midnight,
                  flexShrink: 0, transition: 'all 200ms ease'
                }}>
                  {showChecks ?
                  isOn ? <CheckIcon /> : null :
                  item.n}
                </div>
                <div style={{ fontSize: 13, color: LUNA.onDark, fontFamily: LUNA.fontUI }}>
                  {item.label}
                </div>
              </div>);

          })}
        </div>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <PrimaryButton surface="dark" accent={accent} onClick={onNext} disabled={!allChecked}>
          {showChecks && !allChecked ? `Check all items (${Object.values(checked).filter(Boolean).length}/3)` : "Ready — let's go"}
        </PrimaryButton>
      </div>
    </ScreenShell>);

}

function CheckIcon({ color = LUNA.midnight, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// Video step (Steps 02–07, 08–10) — shared template
// ─────────────────────────────────────────────────────────────
function VideoStep({ step, accent, copyTone, progressStyle, surface, onNext, onBack }) {
  const [playKey, setPlayKey] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  // 3rd BT checkpoint, at Step 09 (Detach): per BRD, the controller verifies
  // reservoir disconnection over Bluetooth. We gate Next on it.
  const [detachBT, setDetachBT] = React.useState('idle'); // idle | searching | confirmed
  const meta = STEPS[step - 1];
  const copy = COPY[copyTone][step];

  React.useEffect(() => {
    setPlaying(true);
    const t = setTimeout(() => setPlaying(false), 2400);
    return () => clearTimeout(t);
  }, [playKey, step]);

  // Auto-arm the detach BT check once the video has played through.
  React.useEffect(() => {
    if (step !== 9) return;
    setDetachBT('idle');
    const arm = setTimeout(() => setDetachBT('searching'), 2400);
    const ok = setTimeout(() => setDetachBT('confirmed'), 4200);
    return () => {clearTimeout(arm);clearTimeout(ok);};
  }, [step, playKey]);

  const replay = () => {setPlayKey((k) => k + 1);};

  const isMorning = step >= 8;
  const nextDisabled = step === 9 && detachBT !== 'confirmed';

  return (
    <ScreenShell surface={surface} accent={accent}>
      <ProgressHeader step={step} total={10} surface={surface} accent={accent} style={progressStyle} onBack={onBack} />
      <MediaTile
        kind={meta.kind} surface={surface === 'paper' ? 'light' : 'dark'}
        accent={accent} tag={meta.tag} duration={meta.duration}
        playing={playing} onReplay={replay} height={260} />
      
      <div style={{ padding: '16px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StepBadge surface={surface} accent={accent} step={step} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 12 }}>
        <Headline surface={surface} size={20}>{copy.head}</Headline>
        {step === 3 ?
        <>
            <SubCopy surface={surface}>
              Dial <DoseToken surface={surface} /> units, then press the plunger until it stops.
            </SubCopy>
          </> :
        copy.sub ?
        <SubCopy surface={surface}>{copy.sub}</SubCopy> :
        null}
        </div>
      </div>
      {step === 9 && <BluetoothDetachCheckpoint accent={accent} surface={surface} status={detachBT} />}
      {step === 10 && <InlineCheckpoint accent={accent} label="Controller charging" />}
      <div style={{ padding: '0 20px 24px' }}>
        <button onClick={replay} style={{
          background: 'transparent', border: 'none', width: '100%',
          textAlign: 'center', fontSize: 12, marginBottom: 10,
          color: surface === 'dark' ? 'rgba(255,255,255,0.48)' : LUNA.slate,
          cursor: 'pointer', padding: '4px 0', fontFamily: LUNA.fontUI
        }}>Watch again</button>
        <PrimaryButton surface={surface} accent={accent} onClick={onNext} disabled={nextDisabled}>
          {nextDisabled ?
          detachBT === 'searching' ? 'Verifying detach…' : 'Waiting for controller…' :
          step === 10 ? 'Done' : 'Next'}
        </PrimaryButton>
      </div>
    </ScreenShell>);

}

// DoseToken — visible [X] placeholder for the open-blocker dose value.
// Per brief: do NOT invent a number. Show a real placeholder, flagged.
function DoseToken({ surface }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline',
      padding: '1px 8px', borderRadius: 5,
      background: isDark ? 'rgba(249,205,133,0.18)' : LUNA.warningSoft,
      border: `1px dashed ${LUNA.warningFill}`,
      color: isDark ? LUNA.warningFill : LUNA.warningInk,
      fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.02em',
      fontFamily: LUNA.fontUI, fontSize: 13
    }}>[X]</span>);

}

// BluetoothDetachCheckpoint — the 3rd BT checkpoint, per BRD.
function BluetoothDetachCheckpoint({ accent, surface, status }) {
  const isPaper = surface === 'paper';
  const isConfirmed = status === 'confirmed';
  const isSearching = status === 'searching';
  return (
    <div style={{
      margin: '12px 20px 0',
      background: isConfirmed ?
      isPaper ? LUNA.moonlightTint : 'rgba(104,210,223,0.10)' :
      isPaper ? LUNA.cloudLilac : 'rgba(255,255,255,0.04)',
      borderRadius: 12, padding: '11px 14px',
      border: `1px solid ${isConfirmed ? `${accent}66` : isPaper ? LUNA.borderSubtle : 'rgba(255,255,255,0.10)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 250ms ease',
      fontFamily: LUNA.fontUI
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={isConfirmed ? accent : isPaper ? LUNA.slate : 'rgba(255,255,255,0.55)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5l11 11-5.5 5.5V1l5.5 5.5-11 11" />
        </svg>
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: isPaper ? LUNA.midnight : LUNA.onDark
          }}>Reservoir detach</div>
          <div style={{
            fontSize: 10, marginTop: 1,
            color: isPaper ? LUNA.slate : 'rgba(255,255,255,0.50)',
            letterSpacing: '0.02em'
          }}>Bluetooth checkpoint</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 500 }}>
        {status === 'idle' &&
        <span style={{ color: isPaper ? LUNA.slate : 'rgba(255,255,255,0.45)' }}>Awaiting hardware</span>
        }
        {isSearching &&
        <>
            <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isPaper ? LUNA.slate : 'rgba(255,255,255,0.5)',
            animation: 'lunaBlink 1.1s ease-in-out infinite'
          }} />
            <span style={{ color: isPaper ? LUNA.slate : 'rgba(255,255,255,0.55)' }}>Verifying…</span>
          </>
        }
        {isConfirmed &&
        <>
            <span style={{
            width: 7, height: 7, borderRadius: '50%', background: LUNA.successInk,
            boxShadow: `0 0 8px ${LUNA.successInk}aa`,
            animation: 'lunaFadeIn 280ms ease-out'
          }} />
            <span style={{ color: LUNA.successInk, animation: 'lunaFadeIn 280ms ease-out' }}>Confirmed</span>
          </>
        }
      </div>
    </div>);

}

function InlineCheckpoint({ accent, label }) {
  return (
    <div style={{
      margin: '12px 20px 0', background: LUNA.moonlightTint,
      borderRadius: 12, padding: '10px 14px',
      border: `1px solid ${accent}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: LUNA.fontUI
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: LUNA.midnight }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: LUNA.successInk, fontWeight: 500 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: LUNA.successInk, boxShadow: `0 0 6px ${LUNA.successInk}88` }} />
        Confirmed
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Hardware Checkpoint — variants A/B/C
// ─────────────────────────────────────────────────────────────
function HardwareCheckpointScreen({ variant, accent, progressStyle, onNext, onBack }) {
  const [ctrl, setCtrl] = React.useState('searching'); // searching | connected | failed
  const [cgm, setCgm] = React.useState('searching');

  React.useEffect(() => {
    setCtrl('searching');setCgm('searching');
    const t1 = setTimeout(() => setCtrl('connected'), 1200);
    const t2 = setTimeout(() => setCgm('connected'), 2100);
    return () => {clearTimeout(t1);clearTimeout(t2);};
  }, []);

  const bothConnected = ctrl === 'connected' && cgm === 'connected';

  // Variant C: dark surface
  const surface = variant === 'C' ? 'dark' : 'paper';
  const isDark = surface === 'dark';

  return (
    <ScreenShell surface={surface} accent={accent}>
      <ProgressHeader
        surface={surface} accent={accent} style={progressStyle} onBack={onBack}
        gateLabel="Hardware checkpoint" gateProgress={70} />
      
      <div style={{ padding: '20px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {variant === 'A' &&
        <CheckpointCardA accent={accent} bothConnected={bothConnected} />
        }
        {variant === 'B' &&
        <CheckpointCardB accent={accent} bothConnected={bothConnected} />
        }
        {variant === 'C' &&
        <CheckpointCardC accent={accent} bothConnected={bothConnected} />
        }

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <ConnRow label="Luna Controller" status={ctrl} accent={accent} dark={isDark} />
          <ConnRow label="Your CGM sensor" status={cgm} accent={accent} dark={isDark} />
        </div>

        <div style={{ flex: 1 }} />
      </div>
      <div style={{ padding: '16px 20px 24px' }}>
        <PrimaryButton surface={isDark ? 'dark' : 'paper'} accent={accent}
        onClick={onNext} disabled={!bothConnected}>
          {bothConnected ? 'Confirm and continue' : 'Searching for devices…'}
        </PrimaryButton>
      </div>
    </ScreenShell>);

}

function CheckpointCardA({ accent, bothConnected }) {
  // Light, rounded, moonlight-bordered card
  return (
    <div style={{
      background: LUNA.white, borderRadius: 18, padding: 22,
      boxShadow: LUNA.shadowCard,
      border: `2px solid ${bothConnected ? accent : `${accent}55`}`,
      textAlign: 'center', transition: 'border-color 300ms'
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: LUNA.moonlightTint,
        border: `1.5px solid ${accent}88`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px', position: 'relative',
        transition: 'all 300ms'
      }}>
        {bothConnected ?
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg> :

        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'lunaSpin 1.1s linear infinite' }} />
        }
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: LUNA.midnight, marginBottom: 6, fontFamily: LUNA.fontUI }}>
        {bothConnected ? 'Device connected' : 'Connecting…'}
      </div>
      <div style={{ fontSize: 13, color: LUNA.slate, lineHeight: 1.5, fontFamily: LUNA.fontUI }}>
        {bothConnected ?
        "Luna can see your device and sensor. You're ready to start your first session." :
        'Hold the controller near your phone and keep the CGM in range.'}
      </div>
    </div>);

}

function CheckpointCardB({ accent, bothConnected }) {
  // Radial halo, icon centered
  return (
    <div style={{
      padding: '20px 0 10px',
      textAlign: 'center'
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}22 0%, ${accent}00 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 20, borderRadius: '50%',
          border: `2px solid ${accent}`,
          animation: bothConnected ? 'none' : 'lunaPulseOuter 1.8s ease-out infinite'
        }} />
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 24px ${accent}55`,
          transition: 'all 300ms'
        }}>
          {bothConnected ?
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={LUNA.midnight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg> :

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LUNA.midnight} strokeWidth="2.2" strokeLinecap="round">
              <path d="M2 8.5a15 15 0 0 1 20 0" />
              <path d="M5 12a11 11 0 0 1 14 0" />
              <path d="M8.5 15.5a6 6 0 0 1 7 0" />
              <circle cx="12" cy="19" r="1" fill={LUNA.midnight} />
            </svg>
          }
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: LUNA.midnight, marginBottom: 6, fontFamily: LUNA.fontUI }}>
        {bothConnected ? "You're connected" : 'Pairing your hardware'}
      </div>
      <div style={{ fontSize: 13, color: LUNA.slate, lineHeight: 1.5, fontFamily: LUNA.fontUI, padding: '0 8px' }}>
        {bothConnected ?
        'Luna sees both your controller and sensor.' :
        'Keep the controller and phone nearby until both signals lock in.'}
      </div>
    </div>);

}

function CheckpointCardC({ accent, bothConnected }) {
  // Dark surface version — moon pulse with status
  return (
    <div style={{
      padding: '20px 0',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <MoonPulse accent={accent} size={88} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: LUNA.onDark, marginBottom: 6, fontFamily: LUNA.fontUI, letterSpacing: '-0.02em' }}>
        {bothConnected ? 'Device connected' : 'Connecting…'}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, fontFamily: LUNA.fontUI, padding: '0 14px' }}>
        {bothConnected ?
        "Luna can see your device and sensor." :
        'Hold the controller close to your phone.'}
      </div>
    </div>);

}

function ConnRow({ label, status, accent, dark }) {
  const bg = dark ? 'rgba(104,210,223,0.08)' : LUNA.moonlightTint;
  const border = dark ? 'rgba(104,210,223,0.25)' : `${accent}55`;
  const lblColor = dark ? LUNA.onDark : LUNA.midnight;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: bg, borderRadius: 12, padding: '12px 14px',
      border: `1px solid ${border}`,
      transition: 'all 250ms',
      fontFamily: LUNA.fontUI
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: lblColor }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500 }}>
        {status === 'searching' ?
        <>
            <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: dark ? 'rgba(255,255,255,0.4)' : LUNA.slate,
            animation: 'lunaBlink 1.1s ease-in-out infinite'
          }} />
            <span style={{ color: dark ? 'rgba(255,255,255,0.55)' : LUNA.slate }}>Searching…</span>
          </> :

        <>
            <div style={{
            width: 8, height: 8, borderRadius: '50%', background: LUNA.successInk,
            boxShadow: `0 0 8px ${LUNA.successInk}aa`,
            animation: 'lunaFadeIn 280ms ease-out'
          }} />
            <span style={{ color: LUNA.successInk, animation: 'lunaFadeIn 280ms ease-out' }}>Connected</span>
          </>
        }
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Luna is Active (Overnight) — variants A (pulse), B (orbit), C (time hero)
// Per brief: requires an obvious, user-initiated control to simulate
// "next morning" — we show a simulated push notification card. The
// session does NOT auto-advance; the reviewer must tap it.
// ─────────────────────────────────────────────────────────────
function OvernightScreen({ variant, accent, copyTone, onContinue, currentTime }) {
  const copy = COPY[copyTone];
  const [notifShown, setNotifShown] = React.useState(false);
  React.useEffect(() => {
    // Show the simulated 7:12 AM push after a short "time-lapse".
    setNotifShown(false);
    const t = setTimeout(() => setNotifShown(true), 3200);
    return () => clearTimeout(t);
  }, [variant]);

  // The morning notification card — shared across variants.
  const morningNotif =
  <MorningNotification
    visible={notifShown} accent={accent} onTap={onContinue} />;



  if (variant === 'B') {
    // Orbit: small moon orbiting a central dot
    return (
      <ScreenShell surface="midnight-flat" accent={accent}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, position: 'relative', marginBottom: 22 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `1px dashed ${accent}44`
            }} />
            <div style={{
              position: 'absolute', inset: 12, borderRadius: '50%',
              border: `1px solid ${accent}22`,
              animation: 'lunaOrbit 6s linear infinite'
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 14, height: 14, borderRadius: '50%', background: accent,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 28px ${accent}`
            }} />
            <div style={{
              position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
              width: 10, height: 10, borderRadius: '50%', background: accent,
              animation: 'lunaOrbitDot 6s linear infinite'
            }} />
          </div>
          <div style={eyebrowStyle(accent)}>Active session</div>
          <Headline surface="midnight-flat" size={26}>{copy.overnightHead}</Headline>
          <div style={{ fontFamily: LUNA.fontDisplay, fontSize: 40, fontWeight: 400, color: accent, margin: '14px 0 4px', letterSpacing: '-0.02em' }}>
            {currentTime}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: LUNA.fontUI, marginBottom: 14 }}>Session started</div>
          <SubCopy surface="midnight-flat">{copy.overnightBody}</SubCopy>
        </div>
        <div style={{ padding: '0 16px 24px' }}>
          {morningNotif}
        </div>
      </ScreenShell>);

  }

  if (variant === 'C') {
    // Time hero — big D-DIN time, minimal
    return (
      <ScreenShell surface="midnight-flat" accent={accent}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <MoonPulse accent={accent} size={56} />
          </div>
          <div style={{
            fontFamily: LUNA.fontDisplay, fontSize: 68, fontWeight: 400,
            color: LUNA.onDark, letterSpacing: '-0.04em', lineHeight: 1,
            margin: '0 0 6px'
          }}>{currentTime}</div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.14em', color: accent, marginBottom: 22,
            fontFamily: LUNA.fontUI
          }}>Luna is active</div>
          <SubCopy surface="midnight-flat">{copy.overnightBody}</SubCopy>
        </div>
        <div style={{ padding: '0 16px 24px' }}>
          {morningNotif}
        </div>
      </ScreenShell>);

  }

  // Default A — moon pulse
  return (
    <ScreenShell surface="midnight-flat" accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{ marginBottom: 22 }}>
          <MoonPulse accent={accent} size={86} />
        </div>
        <div style={eyebrowStyle(accent)}>Active session</div>
        <Headline surface="midnight-flat" size={28}>{copy.overnightHead}</Headline>
        <div style={{ fontFamily: LUNA.fontDisplay, fontSize: 36, fontWeight: 400, color: accent, margin: '18px 0 4px', letterSpacing: '-0.02em' }}>{currentTime}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: LUNA.fontUI, marginBottom: 16 }}>Session started</div>
        <SubCopy surface="midnight-flat">{copy.overnightBody}</SubCopy>
      </div>
      <div style={{ padding: '0 16px 24px' }}>
        {morningNotif}
      </div>
    </ScreenShell>);

}

// MorningNotification — simulated iOS push notification card. Tapping
// "opens" the morning session. Until it appears (~3s), the prototype
// makes clear the user is meant to put the phone down.
function MorningNotification({ visible, accent, onTap }) {
  return (
    <div style={{ position: 'relative', minHeight: 88 }}>
      {!visible &&
      <div style={{
        textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.42)',
        fontFamily: LUNA.fontUI, padding: '24px 12px', letterSpacing: '0.02em',
        animation: 'lunaFadeIn 400ms ease-out'
      }}>
          Put the phone down. The session continues without you.<br />
          <span style={{ color: 'rgba(255,255,255,0.32)' }}>
            A notification will arrive in the morning.
          </span>
        </div>
      }
      {visible &&
      <button
        onClick={onTap}
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
          fontFamily: LUNA.fontUI,
          animation: 'lunaNotifSlide 420ms cubic-bezier(0.2,0,0,1) both'
        }}>
        
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
            width: 32, height: 32, borderRadius: 8, background: LUNA.midnight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: LUNA.midnight }}>LUNA</span>
                <span style={{ fontSize: 10, color: LUNA.slate }}>now</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: LUNA.midnight, marginTop: 2, lineHeight: 1.35 }}>
                Good morning.
              </div>
              <div style={{ fontSize: 12, color: LUNA.graphite, lineHeight: 1.4 }}>
                Your session is complete. Tap to remove the device.
              </div>
            </div>
          </div>
        </button>
      }
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Morning Notification
// ─────────────────────────────────────────────────────────────
function MorningScreen({ accent, copyTone, progressStyle, onStart, onBack }) {
  const copy = COPY[copyTone];
  return (
    <ScreenShell surface="paper" accent={accent} sunriseGlow>
      <ProgressHeader
        surface="paper" accent={accent} style={progressStyle} onBack={onBack}
        gateLabel="Morning · session start" gateProgress={70} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, background: LUNA.moonlightTint,
          borderRadius: '50%', border: `2px solid ${accent}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
        </div>
        <div style={eyebrowStyle(accent)}>Good morning</div>
        <Headline surface="paper" size={24}>{copy.morningHead}</Headline>
        <SubCopy surface="paper">{copy.morningBody}</SubCopy>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <PrimaryButton surface="paper" accent={accent} onClick={onStart}>Start morning steps</PrimaryButton>
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────────
// Complete
// ─────────────────────────────────────────────────────────────
function CompleteScreen({ accent, copyTone, onDone }) {
  const copy = COPY[copyTone];
  return (
    <ScreenShell surface="midnight-flat" accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 22, boxShadow: `0 4px 28px ${accent}66`,
          animation: 'lunaPopIn 480ms cubic-bezier(0.34,1.56,0.64,1)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={LUNA.midnight} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <Headline surface="midnight-flat" size={30}>{copy.completeHead}</Headline>
        <SubCopy surface="midnight-flat">{copy.completeBody}</SubCopy>
        <div style={{ display: 'flex', gap: 10, marginTop: 26, width: '100%' }}>
          <StatCard value="10" label="Steps done" accent={accent} />
          <StatCard value="1" label="Night logged" accent={accent} />
        </div>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <PrimaryButton surface="dark" accent={accent} onClick={onDone}>Go to dashboard</PrimaryButton>
      </div>
    </ScreenShell>);

}

function StatCard({ value, label, accent }) {
  return (
    <div style={{
      flex: 1, background: `${accent}14`,
      borderRadius: 14, padding: '14px 10px',
      textAlign: 'center', border: `1px solid ${accent}2e`,
      fontFamily: LUNA.fontUI
    }}>
      <div style={{ fontSize: 24, fontWeight: 400, color: accent, fontFamily: LUNA.fontDisplay, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{label}</div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// PersonalOutro — a personalized video screen used at two
// junctions: end of the evening session (preview tonight) and
// end of the morning session (introduce the week of learning).
// ─────────────────────────────────────────────────────────────
function PersonalOutro({ accent, eyebrow, title, body, mediaTag, buttonLabel, onContinue, surface = 'dark' }) {
  const [playing, setPlaying] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setPlaying(false), 2400);
    return () => clearTimeout(t);
  }, []);
  const replay = () => setPlaying(true);
  const isDark = surface === 'dark' || surface === 'midnight-flat';

  return (
    <ScreenShell surface={surface} accent={accent}>
      <div style={{ height: 54, flexShrink: 0 }} />
      <MediaTile kind="video" surface={isDark ? 'dark' : 'light'} accent={accent}
        tag={mediaTag} duration="~24s" playing={playing} onReplay={replay} height={260} />
      <div style={{ padding: '20px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: accent, marginBottom: 12, fontFamily: LUNA.fontUI,
        }}>{eyebrow}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 12 }}>
          <Headline surface={surface} size={22}>{title}</Headline>
          <SubCopy surface={surface}>{body}</SubCopy>
        </div>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <button onClick={replay} style={{
          background: 'transparent', border: 'none', width: '100%',
          textAlign: 'center', fontSize: 12, marginBottom: 10,
          color: isDark ? 'rgba(255,255,255,0.48)' : LUNA.slate,
          cursor: 'pointer', padding: '4px 0', fontFamily: LUNA.fontUI,
        }}>Watch again</button>
        <PrimaryButton surface={surface} accent={accent} onClick={onContinue}>{buttonLabel}</PrimaryButton>
      </div>
    </ScreenShell>
  );
}

Object.assign(window, {
  ScreenShell, IntroScreen, InventoryStep, VideoStep,
  HardwareCheckpointScreen, OvernightScreen, MorningScreen, CompleteScreen, PersonalOutro,
  CheckIcon, FlagBadge, DoseToken, BluetoothDetachCheckpoint, MorningNotification
});