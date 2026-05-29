// system.jsx — Luna design tokens, shared atoms, copy variants

// ─────────────────────────────────────────────────────────────
// Luna tokens (from Luna Design System v1.0, April 2026)
// ─────────────────────────────────────────────────────────────
const LUNA = {
  // Primary
  midnight: '#041E42',
  midnightSoft: '#0F1C40',
  midnightDeep: '#031632',
  moonlight: '#68D2DF',
  moonlightDeep: '#0A9AAE',
  moonlightIce: '#C9F8FE',
  moonlightTint: '#E8FCFF',
  white: '#FFFFFF',

  // Neutrals
  softPaper: '#FBFDFE',
  cloudLilac: '#F2F3FA',
  periwinkleMist: '#E7EBF8',
  lunarLavender: '#D6D3E9',
  pebbleBlue: '#BAC4D9',
  slate: '#7A8892',
  graphite: '#535D65',

  // Borders
  borderSubtle: '#EDF0F7',
  borderDefault: '#D1D1D1',
  borderStrong: '#ACC1DF',

  // Alerts
  successInk: '#2E7D32',
  successFill: '#B0F9B3',
  successSoft: '#E7F8E8',
  warningInk: '#6B4B10',
  warningFill: '#F9CD85',
  warningSoft: '#FFF3DC',
  criticalInk: '#8E3655',
  criticalFill: '#E0A4B8',
  criticalSoft: '#F7E4EA',
  infoInk: '#0A9AAE',

  // On-dark ink
  onDark: '#FFFFFF',
  onDarkSub: '#ACC1DF',

  // Shadows
  shadowCard: '0 5px 50px rgba(0,0,0,0.10)',
  shadowRaised: '0 2px 8px rgba(5,30,66,0.08)',
  shadowAmbient: '0 3px 10px rgba(104,210,223,0.40)',
  shadowModal: '0 20px 60px rgba(5,30,66,0.25)',
  gradientMidnight: 'linear-gradient(180deg, #133465 0%, #031632 100%)',

  // Type stacks
  // Per Luna brand context (May 2026): D-DIN is the brand font at all weights.
  // Inter / SF Pro fall back in iOS system contexts only.
  fontUI: `'D-DIN', 'Inter', -apple-system, 'SF Pro Text', system-ui, sans-serif`,
  fontDisplay: `'D-DIN', 'Inter', -apple-system, sans-serif`,
};

// Accent alternates (for tweak)
const ACCENTS = {
  Moonlight: { mid: '#68D2DF', deep: '#0A9AAE', tint: '#E8FCFF', ice: '#C9F8FE' },
  Aurora:    { mid: '#8BE0C4', deep: '#2E9C78', tint: '#EAFBF3', ice: '#C8F1DE' },
  Lavender:  { mid: '#B8A8F0', deep: '#6E58C4', tint: '#F1ECFC', ice: '#DDD0F7' },
  Coral:     { mid: '#F5A887', deep: '#C4663F', tint: '#FCEFE6', ice: '#F7D7C2' },
};

// ─────────────────────────────────────────────────────────────
// Luna wordmark — tiny SVG (reused in Intro)
// ─────────────────────────────────────────────────────────────
function LunaWordmark({ size = 22, accent = LUNA.moonlight, ink = LUNA.onDark }) {
  // Simplified: 4 moon phases + "luna". Tight viewBox so flex-centering actually centers the glyphs.
  return (
    <svg width={size * 2.65} height={size * 1.6} viewBox="-2 0 70 48" fill="none" style={{ display: 'block' }}>
      {/* Moon phases */}
      <circle cx="8" cy="10" r="5" fill="none" stroke={accent} strokeWidth="1.3" />
      <g transform="translate(22, 5)">
        <circle cx="5" cy="5" r="5" fill={accent} fillOpacity="0.28" />
        <path d="M 5 0 A 5 5 0 0 1 5 10 A 2.5 5 0 0 0 5 0 Z" fill={accent} />
      </g>
      <g transform="translate(38, 5)">
        <circle cx="5" cy="5" r="5" fill={accent} fillOpacity="0.28" />
        <path d="M 5 0 A 5 5 0 0 1 5 10 A 5 5 0 0 0 5 0 Z" fill={accent} />
      </g>
      <circle cx="55" cy="10" r="5" fill={accent} />
      {/* Wordmark */}
      <text x="0" y="42" fontFamily="D-DIN, Inter, system-ui" fontSize="28" fontWeight="700" letterSpacing="-0.02em" fill={ink}>luna</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress header — bar / dots / numeric (tweakable)
// ─────────────────────────────────────────────────────────────
function ProgressHeader({ step, total, surface, accent, style, onBack, showBack = true, gateLabel, gateProgress }) {
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  const isGate = !!gateLabel;
  const title = isGate
    ? gateLabel
    : step <= 7 ? 'Evening setup' : 'Morning removal';
  const ink = isDark ? LUNA.onDark : LUNA.midnight;
  const muted = isDark ? 'rgba(255,255,255,0.6)' : LUNA.slate;
  const progBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(4,30,66,0.10)';
  const pct = isGate ? (gateProgress ?? 100) : (step / total) * 100;

  return (
    <div style={{ flexShrink: 0, paddingTop: 4 }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        {showBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 24, color: accent, lineHeight: 1, width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: LUNA.fontUI,
            }}
          >‹</button>
        ) : <div style={{ width: 24 }} />}
        <span style={{
          fontSize: 13, fontWeight: isGate ? 600 : 500, color: isGate ? ink : muted,
          flex: 1, fontFamily: LUNA.fontUI,
          letterSpacing: isGate ? '-0.005em' : 0,
        }}>{title}</span>
        {style === 'numeric' && !isGate && (
          <span style={{ fontSize: 12, fontWeight: 500, color: muted, fontFamily: LUNA.fontUI }}>{step} of {total}</span>
        )}
        {false && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: accent, fontFamily: LUNA.fontUI,
            background: isDark ? 'rgba(104,210,223,0.10)' : LUNA.moonlightTint,
            border: `1px solid ${accent}55`,
            borderRadius: 999, padding: '3px 8px',
          }}>Gate</span>
        )}
      </div>
      {style === 'bar' && (
        <div style={{ margin: '0 20px', height: 3, background: progBg, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: accent,
            borderRadius: 2, transition: 'width 320ms cubic-bezier(0.65,0,0.35,1)',
          }} />
        </div>
      )}
      {style === 'dots' && (
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '0 20px' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i + 1 === step ? 16 : 5, height: 5, borderRadius: 999,
              background: i < step ? accent : progBg,
              transition: 'all 260ms cubic-bezier(0.65,0,0.35,1)',
            }} />
          ))}
        </div>
      )}
      {style === 'numeric' && (
        <div style={{ margin: '0 20px', height: 2, background: progBg, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: accent,
            transition: 'width 320ms cubic-bezier(0.65,0,0.35,1)',
          }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Video / still placeholder
// ─────────────────────────────────────────────────────────────
function MediaTile({ kind = 'video', surface, accent, tag, duration, playing, onReplay, height = 210 }) {
  const isDark = surface === 'dark';
  const borderAlpha = isDark ? 0.45 : 0.20;
  const bg = isDark ? 'rgba(4,30,66,0.55)' : LUNA.cloudLilac;
  const border = isDark
    ? `1.5px dashed rgba(104,210,223,${borderAlpha})`
    : `1.5px dashed rgba(4,30,66,0.15)`;
  const tagColor = isDark ? 'rgba(104,210,223,0.62)' : LUNA.slate;
  const durColor = isDark ? 'rgba(255,255,255,0.38)' : LUNA.slate;

  return (
    <div
      onClick={onReplay}
      style={{
        margin: '16px 20px 0', height, borderRadius: 14,
        background: bg, border,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: onReplay ? 'pointer' : 'default',
      }}
    >
      {/* Soft scanning/shimmer when "playing" */}
      {kind === 'video' && playing && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(100deg, transparent 30%, ${accent}22 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: 'lunaShimmer 2.4s linear infinite',
        }} />
      )}

      {/* Placeholder glyph */}
      {kind === 'video' ? (
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: isDark ? `${accent}33` : 'rgba(4,30,66,0.08)',
          border: `1.5px solid ${isDark ? `${accent}88` : 'rgba(4,30,66,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms ease',
          transform: playing ? 'scale(1.08)' : 'scale(1)',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginLeft: 3 }}>
            <path d="M5 3l9 5-9 5V3z" fill={isDark ? accent : LUNA.midnight} />
          </svg>
        </div>
      ) : (
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: isDark ? `${accent}99` : LUNA.slate,
          fontFamily: LUNA.fontUI,
        }}>
          Top-down still
        </div>
      )}

      <span style={{
        position: 'absolute', bottom: 8, left: 10,
        fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: tagColor, fontFamily: LUNA.fontUI,
      }}>{tag}</span>
      {duration && (
        <span style={{
          position: 'absolute', bottom: 8, right: 10,
          fontSize: 9, color: durColor, fontFamily: LUNA.fontUI,
        }}>{duration}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primary button — pill, Luna DS
// ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, surface, accent, disabled, style = {} }) {
  // On dark: moonlight fill, midnight text
  // On light: midnight fill, white text
  const isDark = surface === 'dark' || surface === 'midnight-flat';
  const fill = disabled ? LUNA.pebbleBlue : (isDark ? accent : LUNA.midnight);
  const text = isDark ? LUNA.midnight : LUNA.white;
  const shadow = disabled ? 'none' : (isDark ? `0 3px 14px ${accent}66` : '0 2px 10px rgba(4,30,66,0.22)');

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 52,
        background: fill, color: text,
        border: 'none', borderRadius: 999,
        fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em',
        fontFamily: LUNA.fontUI,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 160ms ease-out, box-shadow 160ms ease-out, background 200ms',
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(1px) scale(0.995)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Moon pulse — Luna's signature motion, 3.2s cubic-bezier
// ─────────────────────────────────────────────────────────────
function MoonPulse({ accent, size = 80 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', width: size, height: size, borderRadius: '50%',
        border: `2px solid ${accent}40`,
        animation: 'lunaPulseOuter 3.2s cubic-bezier(0.65,0,0.35,1) infinite',
      }} />
      <div style={{
        position: 'absolute', width: size * 0.74, height: size * 0.74, borderRadius: '50%',
        border: `2px solid ${accent}88`,
        background: `${accent}22`,
        animation: 'lunaPulseMid 3.2s cubic-bezier(0.65,0,0.35,1) infinite',
      }} />
      <div style={{
        width: size * 0.22, height: size * 0.22, borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 24px ${accent}`,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Copy tone variants — used for step headlines
// ─────────────────────────────────────────────────────────────
const COPY = {
  concise: {
    introTitle: "Let's get you set up for tonight",
    introBody: 'Walk through each step to prepare your Luna device. Takes about 5 minutes.',
    1: { head: 'Have the following ready', sub: '' },
    2: { head: 'Open the reservoir tray', sub: '' },
    3: { head: 'Fill with insulin', sub: 'Dial 7 units, then press the plunger until it stops.' },
    4: { head: 'Remove the label from the reservoir', sub: '' },
    5: { head: 'Attach the Luna Capsule to the Single-Sleep Reservoir and lift straight up to remove the adhesive liner.', sub: '' },
    6: { head: 'Remove from base', sub: '' },
    7: { head: 'Apply to body', sub: 'Press firmly on your upper arm for 3 seconds.' },
    8: { head: 'Before your next meal, remove Luna from your body.', sub: '' },
    9: { head: 'Detach the reservoir', sub: 'Peel the tab, then press the release button.' },
    10: { head: 'Place on charger', sub: '' },
    completeHead: "You're set up.",
    completeBody: "Luna is ready for tonight. You won't need to do this again — each session is just the evening setup steps.",
    morningHead: 'Your session is complete.',
    morningBody: 'Time to remove the device and charge the controller for tonight.',
    overnightHead: 'Luna is active.',
    overnightBody: "Luna will manage your insulin overnight. You'll get a summary in the morning.",
  },
  warm: {
    introTitle: "Let's get you ready for tonight",
    introBody: "A short walk through each step. Five minutes, and Luna is ready for the night.",
    1: { head: "Gather what you'll need", sub: '' },
    2: { head: 'Open the reservoir tray', sub: '' },
    3: { head: 'Fill the reservoir with insulin', sub: 'Dial to 7 units, then press the plunger all the way down.' },
    4: { head: 'Remove the label from the reservoir', sub: '' },
    5: { head: 'Snap the controller on', sub: '' },
    6: { head: 'Lift it off the base', sub: '' },
    7: { head: "Apply it to your upper arm", sub: 'Press firmly for a few seconds.' },
    8: { head: 'Good morning. Time to remove it.', sub: '' },
    9: { head: 'Detach the reservoir', sub: 'Peel the tab, then press the release button.' },
    10: { head: 'Place it on the charger', sub: '' },
    completeHead: "You're all set.",
    completeBody: "Luna is ready for tonight. From here, it's just the evening steps — you'll know them by heart.",
    morningHead: 'Good morning.',
    morningBody: 'Time to remove the device and place the controller on its charger for tonight.',
    overnightHead: 'Luna is watching over you.',
    overnightBody: "Rest easy. Luna will manage your insulin overnight. A summary will be waiting in the morning.",
  },
  clinical: {
    introTitle: 'Session 1 · Device setup',
    introBody: 'Complete all 10 steps to initialize your Luna device. Estimated duration: 5 minutes.',
    1: { head: 'Prepare supplies', sub: 'Confirm all three items are present before proceeding.' },
    2: { head: 'Open reservoir tray', sub: '' },
    3: { head: 'Fill reservoir with insulin', sub: 'Prescribed dose: 7 units. Depress plunger fully.' },
    4: { head: 'Invert and expose reservoir', sub: '' },
    5: { head: 'Attach controller to reservoir', sub: '' },
    6: { head: 'Detach assembly from base', sub: '' },
    7: { head: 'Apply to upper arm', sub: 'Hold firm pressure on the adhesive for 3 seconds.' },
    8: { head: 'Remove device', sub: '' },
    9: { head: 'Separate reservoir from controller', sub: 'Press release tab, then pull apart.' },
    10: { head: 'Place controller on charger', sub: '' },
    completeHead: 'Setup complete.',
    completeBody: 'Luna is ready for session 1. Subsequent sessions require only the evening setup sequence (steps 1–7).',
    morningHead: 'Session 1 complete.',
    morningBody: 'Proceed to device removal and controller charging.',
    overnightHead: 'Session active.',
    overnightBody: 'Automated insulin delivery in progress. Morning summary will be available on wake.',
  },
};

// Inventory labels (shared)
const INVENTORY = [
  { n: 1, label: 'Your rapid-acting insulin pen' },
  { n: 2, label: 'Single-Sleep Reservoir' },
  { n: 3, label: 'Luna Capsule (charged)' },
];

// Step metadata
const STEPS = [
  { n: 1, kind: 'still',  tag: 'Step 01 · Type A · Still', duration: null,   surface: 'dark',  inventory: true },
  { n: 2, kind: 'video',  tag: 'Step 02 · Type B · Video', duration: '~26s', surface: 'dark' },
  { n: 3, kind: 'video',  tag: 'Step 03 · Type B · Video', duration: '~30s', surface: 'dark' },
  { n: 4, kind: 'video',  tag: 'Step 04 · Type B · Video', duration: '~28s', surface: 'dark' },
  { n: 5, kind: 'video',  tag: 'Step 05 · Type B · Video', duration: '~28s', surface: 'dark' },
  { n: 6, kind: 'video',  tag: 'Step 06 · Type B · Video', duration: '~25s', surface: 'dark' },
  { n: 7, kind: 'video',  tag: 'Step 07 · On-body · Video', duration: '~28s', surface: 'dark' },
  { n: 8, kind: 'video',  tag: 'Step 08 · On-body · Video', duration: '~32s', surface: 'light' },
  { n: 9, kind: 'video',  tag: 'Step 09 · Type B · Video', duration: '~28s', surface: 'light' },
  { n: 10, kind: 'video', tag: 'Step 10 · Type A · Video', duration: '~25s', surface: 'light' },
];

Object.assign(window, {
  LUNA, ACCENTS, LunaWordmark, ProgressHeader, MediaTile,
  PrimaryButton, MoonPulse, COPY, INVENTORY, STEPS,
});
