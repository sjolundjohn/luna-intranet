// DoseSheet — Luna canonical two-step dose-confirmation component.
// Bottom-sheet modal. Read → acknowledge BOTH required actions → slide to confirm.
// Variants: increase · decrease · nochange · reset · disabled · skip
//
// Two-part action requirement (spec §3): acting on a Luna recommendation requires
//   1) updating the programmed TDBD setting in Luna, AND
//   2) taking the actual physical basal dose.
// Both are surfaced explicitly and both must be acknowledged in the gesture.

const { useState, useRef, useEffect, useCallback } = React;

/* ---------- tiny icon set (Lucide geometry, 1.5 stroke) ---------- */
const DS_ICONS = {
  up: "M12 19V5M5 12l7-7 7 7",
  down: "M12 5v14M19 12l-7 7-7-7",
  check: "M20 6L9 17l-5-5",
  arrowRight: "M5 12h14M13 5l7 7-7 7",
  pause: "M10 4H6v16h4zM18 4h-4v16h4z",
  minus: "M5 12h14",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
};
const DSIcon = ({ name, size = 18, color = "currentColor", strokeWidth = 1.5, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
    <path d={DS_ICONS[name]}></path>
  </svg>
);

/* ---------- moon-phase glyph (house mark) ---------- */
const MoonMark = ({ size = 26 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--color-midnight)",
                position: "relative", overflow: "hidden", flex: "none" }}>
    <div style={{ position: "absolute", right: -size * 0.22, top: size * 0.1, width: size * 0.62,
                  height: size * 0.62, borderRadius: "50%", background: "var(--color-moonlight)" }} />
    <div style={{ position: "absolute", right: -size * 0.05, top: size * 0.18, width: size * 0.46,
                  height: size * 0.46, borderRadius: "50%", background: "var(--color-midnight)" }} />
  </div>
);

/* ---------- acknowledgement check row (44px tap target) ---------- */
const AckRow = ({ checked, onToggle, label, sub, interactive }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={interactive ? onToggle : undefined}
    style={{
      display: "flex", alignItems: "flex-start", gap: 14, width: "100%",
      minHeight: 44, padding: "10px 4px", background: "none", border: "none",
      textAlign: "left", cursor: interactive ? "pointer" : "default", font: "inherit",
    }}
  >
    <span style={{
      width: 26, height: 26, flex: "none", marginTop: 1, borderRadius: 8,
      border: checked ? "none" : "1.5px solid var(--color-border-strong)",
      background: checked ? "var(--color-midnight)" : "var(--color-white)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 160ms cubic-bezier(0.2,0,0,1)",
    }}>
      {checked && <DSIcon name="check" size={16} color="var(--color-moonlight)" strokeWidth={2.4} />}
    </span>
    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: "var(--color-ink)",
                     letterSpacing: "-0.005em" }}>{label}</span>
      {sub && <span style={{ fontSize: 13, lineHeight: 1.4, color: "var(--color-slate)" }}>{sub}</span>}
    </span>
  </button>
);

/* ---------- slide-to-confirm gesture ---------- */
const SlideConfirm = ({ enabled, confirmed, onConfirm, demoProgress = 0, label = "Slide to confirm both" }) => {
  const trackRef = useRef(null);
  const [p, setP] = useState(demoProgress);          // 0..1 progress
  const [dragging, setDragging] = useState(false);
  const done = confirmed || p >= 0.995;
  const THUMB = 52, PAD = 4, H = 60;

  useEffect(() => { if (!enabled && !confirmed) setP(0); }, [enabled, confirmed]);
  useEffect(() => { if (confirmed) setP(1); }, [confirmed]);

  const maxTravel = useCallback(() => {
    const w = trackRef.current ? trackRef.current.clientWidth : 320;
    return w - THUMB - PAD * 2;
  }, []);

  const move = useCallback((clientX) => {
    const el = trackRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left - PAD - THUMB / 2;
    setP(Math.max(0, Math.min(1, x / maxTravel())));
  }, [maxTravel]);

  const start = (e) => {
    if (!enabled || done) return;
    setDragging(true);
    move(e.clientX ?? (e.touches && e.touches[0].clientX));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => move(e.clientX ?? (e.touches && e.touches[0].clientX));
    const onUp = () => {
      setDragging(false);
      setP((cur) => {
        if (cur >= 0.85) { onConfirm && onConfirm(); return 1; }
        return 0;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [dragging, move, onConfirm]);

  // keyboard a11y: arrow / enter completes
  const onKey = (e) => {
    if (!enabled || done) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); onConfirm && onConfirm(); setP(1); }
  };

  const thumbX = PAD + p * maxTravel();
  const trailW = thumbX + THUMB / 2;

  let trackBg = "var(--color-cloud-lilac)";
  if (done) trackBg = "var(--color-success-bg)";
  else if (enabled) trackBg = "var(--color-periwinkle-mist)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={enabled && !done ? 0 : -1}
        aria-label={label}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}
        aria-disabled={!enabled && !done}
        onKeyDown={onKey}
        style={{
          position: "relative", height: H, borderRadius: 999, background: trackBg,
          overflow: "hidden", userSelect: "none", touchAction: "none",
          transition: dragging ? "none" : "background 220ms cubic-bezier(0.2,0,0,1)",
          border: enabled && !done ? "none" : (done ? "none" : "1px solid var(--color-border-subtle)"),
        }}
      >
        {/* filled trail */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: trailW,
          background: done ? "var(--color-success-fill)" : "var(--color-moonlight-ice)",
          transition: dragging ? "none" : "width 240ms cubic-bezier(0.2,0,0,1), background 220ms",
        }} />
        {/* center label */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, pointerEvents: "none",
          fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em",
          color: done ? "var(--color-success-ink)" : (enabled ? "var(--color-midnight)" : "var(--color-disabled)"),
          opacity: done ? 1 : Math.max(0, 1 - p * 2.2),
          transition: dragging ? "none" : "opacity 200ms, color 220ms",
        }}>
          {done ? <><DSIcon name="check" size={18} color="var(--color-success-ink)" strokeWidth={2.4} /> Confirmed</>
                : label}
        </div>
        {/* thumb */}
        <div
          onPointerDown={start}
          style={{
            position: "absolute", top: PAD, left: thumbX, width: THUMB, height: THUMB,
            borderRadius: "50%",
            background: done ? "var(--color-success-ink)" : (enabled ? "var(--color-midnight)" : "var(--color-white)"),
            border: enabled || done ? "none" : "1px solid var(--color-border-default)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: enabled && !done ? "grab" : "default",
            boxShadow: enabled && !done ? "0 2px 8px rgba(4,30,66,0.20)" : "none",
            transition: dragging ? "none" : "left 240ms cubic-bezier(0.2,0,0,1), background 220ms",
          }}
        >
          <DSIcon name={done ? "check" : "arrowRight"} size={22}
                  color={done ? "var(--color-white)" : (enabled ? "var(--color-moonlight)" : "var(--color-disabled)")}
                  strokeWidth={2.2} />
        </div>
      </div>
      {!enabled && !done && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-slate)", paddingLeft: 4 }}>
          <DSIcon name="info" size={14} color="var(--color-slate)" />
          Acknowledge both actions above to continue
        </div>
      )}
    </div>
  );
};

/* ---------- direction chip (icon + word — never colour alone) ---------- */
const DirChip = ({ dir }) => {
  const map = {
    up:   { icon: "up",   word: "Increase" },
    down: { icon: "down", word: "Decrease" },
  }[dir];
  if (!map) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px 5px 9px",
      borderRadius: 4, background: "var(--color-moonlight-tint)", color: "var(--color-moonlight-deep)",
      fontSize: 13, fontWeight: 600, letterSpacing: "-0.003em",
    }}>
      <DSIcon name={map.icon} size={15} color="var(--color-moonlight-deep)" strokeWidth={2.2} />
      {map.word}
    </span>
  );
};

/* ---------- the sheet ---------- */
const DoseSheet = ({
  variant = "increase",
  value = 14, prevValue = 12, units = "U",
  rationale,
  initialChecked = false,
  initialConfirmed = false,
  slideDemo = 0,
}) => {
  const isRec = variant === "increase" || variant === "decrease";
  const [ackSet, setAckSet] = useState(initialChecked);
  const [ackDose, setAckDose] = useState(initialChecked);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const both = ackSet && ackDose;

  const dir = variant === "increase" ? "up" : variant === "decrease" ? "down" : null;
  const defaultRationale = {
    increase: "Over the past several nights your glucose drifted up without Luna insulin. You appear to need a little more basal.",
    decrease: "Over the past several nights your glucose ran low overnight. You appear to need a little less basal.",
  }[variant];

  /* eyebrow + status banner config per variant */
  return (
    <div style={{
      background: "var(--color-white)", borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: "14px 26px 30px", boxShadow: "0 -8px 40px rgba(4,30,66,0.18)",
      fontFamily: "var(--font-body)",
    }}>
      {/* grabber */}
      <div style={{ width: 40, height: 5, borderRadius: 999, background: "var(--color-lunar-lavender)",
                    margin: "0 auto 18px" }} />

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
        <MoonMark size={24} />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
                       color: "var(--color-slate)" }}>Basal Guidance</span>
      </div>

      {isRec && <RecBody dir={dir} value={value} prevValue={prevValue} units={units}
                         rationale={rationale || defaultRationale}
                         ackSet={ackSet} setAckSet={setAckSet} ackDose={ackDose} setAckDose={setAckDose}
                         both={both} confirmed={confirmed} setConfirmed={setConfirmed} slideDemo={slideDemo} />}
      {variant === "nochange" && <NoChangeBody value={value} units={units} rationale={rationale} />}
      {variant === "reset"    && <ResetBody />}
      {variant === "disabled" && <DisabledBody />}
      {variant === "skip"     && <SkipBody value={value} units={units} dir={dir || "up"} />}
    </div>
  );
};

/* ---- recommendation body ---- */
const RecBody = ({ dir, value, prevValue, units, rationale, ackSet, setAckSet, ackDose, setAckDose, both, confirmed, setConfirmed, slideDemo }) => (
  <>
    <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                 color: "var(--color-ink)", lineHeight: 1.25 }}>
      A new nightly basal dose
    </h2>

    {/* the value */}
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 76, fontWeight: 700, lineHeight: 0.95,
                     letterSpacing: "-0.03em", color: "var(--color-midnight)" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700,
                     color: "var(--color-midnight)", letterSpacing: "-0.01em" }}>{units}</span>
      <span style={{ marginLeft: 2 }}><DirChip dir={dir} /></span>
    </div>
    <div style={{ fontSize: 13, color: "var(--color-slate)", marginBottom: 18 }}>
      Current TDBD <span style={{ textDecoration: "line-through" }}>{prevValue} {units}</span>
    </div>

    <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.55, color: "var(--color-graphite)",
                maxWidth: "60ch" }}>{rationale}</p>

    {/* the two required actions */}
    <div style={{ background: "var(--color-cloud-lilac)", borderRadius: 16, padding: "16px 18px 14px",
                  marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
                    color: "var(--color-graphite)", marginBottom: 4 }}>
        To act on this, do both
      </div>
      <AckRow interactive checked={ackSet} onToggle={() => setAckSet(v => !v)}
              label={`Set your Luna TDBD to ${value} ${units}`} sub="Updates the value Luna programs for you" />
      <div style={{ height: 1, background: "var(--color-border-subtle)", margin: "2px 0 2px 40px" }} />
      <AckRow interactive checked={ackDose} onToggle={() => setAckDose(v => !v)}
              label={`Take your ${value} ${units} basal dose`} sub="Your actual injection tonight" />
    </div>

    <SlideConfirm enabled={both} confirmed={confirmed} onConfirm={() => setConfirmed(true)} demoProgress={slideDemo} />

    <div style={{ display: "flex", justifyContent: "center", marginTop: 16, height: confirmed ? 0 : "auto",
                  overflow: "hidden", transition: "opacity 200ms", opacity: confirmed ? 0 : 1 }}>
      <button type="button" style={{
        background: "none", border: "none", font: "inherit", cursor: "pointer",
        fontSize: 15, fontWeight: 600, color: "var(--color-slate)", padding: "8px 16px",
      }}>Skip this recommendation</button>
    </div>
  </>
);

/* ---- no-change body ---- */
const NoChangeBody = ({ value, units, rationale }) => (
  <>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52,
                  borderRadius: "50%", background: "var(--color-success-bg)", marginBottom: 18 }}>
      <DSIcon name="check" size={26} color="var(--color-success-ink)" strokeWidth={2.2} />
    </div>
    <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                 color: "var(--color-ink)", lineHeight: 1.25 }}>
      No change needed tonight
    </h2>
    <p style={{ margin: "0 0 8px", fontSize: 15, lineHeight: 1.55, color: "var(--color-graphite)", maxWidth: "58ch" }}>
      {rationale || "Your current TDBD seems appropriate for your body's needs. Luna will continue to observe and inform you if this changes."}
    </p>
    <div style={{ fontSize: 13, color: "var(--color-slate)", marginBottom: 26 }}>
      Current TDBD holding at <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>{value} {units}</strong>
    </div>
    <PrimaryButton>Got it</PrimaryButton>
  </>
);

/* ---- reset-required body ---- */
const ResetBody = () => (
  <>
    <StatusBanner tone="info" icon="pause" label="Recommendations paused" />
    <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                 color: "var(--color-ink)", lineHeight: 1.25 }}>
      Luna is re-learning your nights
    </h2>
    <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.55, color: "var(--color-graphite)", maxWidth: "58ch" }}>
      Your basal setting changed, so Luna reset its learning. Basal Guidance is paused until Luna has observed
      enough of your nights again.
    </p>
    <div style={{ background: "var(--color-cloud-lilac)", borderRadius: 16, padding: "14px 18px", marginBottom: 24,
                  display: "flex", flexDirection: "column", gap: 10 }}>
      <ResetMetric label="Luna sessions observed" value="2 of 5" />
      <div style={{ height: 1, background: "var(--color-border-subtle)" }} />
      <ResetMetric label="Days of wear" value="3 of 7" />
    </div>
    <PrimaryButton>Got it</PrimaryButton>
  </>
);
const ResetMetric = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
    <span style={{ fontSize: 14, color: "var(--color-graphite)" }}>{label}</span>
    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
  </div>
);

/* ---- disabled body ---- */
const DisabledBody = () => (
  <>
    <StatusBanner tone="neutral" icon="minus" label="Basal Guidance off" />
    <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                 color: "var(--color-ink)", lineHeight: 1.25 }}>
      Basal Guidance isn't on for you
    </h2>
    <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.55, color: "var(--color-graphite)", maxWidth: "58ch" }}>
      Your care setup doesn't include Luna basal dose recommendations. Luna keeps monitoring overnight, but won't
      suggest dose changes. Talk to your care team if you think this should change.
    </p>
    <PrimaryButton variant="secondary">Close</PrimaryButton>
  </>
);

/* ---- skip-confirmation body ---- */
const SkipBody = ({ value, units, dir }) => (
  <>
    <StatusBanner tone="critical" icon="info" label="Confirm you're skipping" />
    <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                 color: "var(--color-ink)", lineHeight: 1.25 }}>
      Skip the {dir === "up" ? "increase" : "decrease"} to {value} {units}?
    </h2>
    <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.55, color: "var(--color-graphite)", maxWidth: "58ch" }}>
      Your TDBD stays where it is and you take your usual dose tonight. Luna will keep this recommendation in mind
      and may suggest it again.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <PrimaryButton>Skip this recommendation</PrimaryButton>
      <PrimaryButton variant="ghost">Back</PrimaryButton>
    </div>
  </>
);

/* ---- shared status banner (icon + text, never colour alone) ---- */
const StatusBanner = ({ tone, icon, label }) => {
  const t = {
    info:     { bg: "var(--color-info-bg)",     ink: "var(--color-info-ink)" },
    neutral:  { bg: "var(--color-cloud-lilac)", ink: "var(--color-graphite)" },
    critical: { bg: "var(--color-critical-bg)", ink: "var(--color-critical-ink)" },
  }[tone];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px 6px 11px",
                  borderRadius: 999, background: t.bg, color: t.ink, marginBottom: 16, whiteSpace: "nowrap",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.01em" }}>
      <DSIcon name={icon} size={15} color={t.ink} strokeWidth={2} style={{ flex: "none" }} />
      {label}
    </div>
  );
};

/* ---- shared primary button (pill) ---- */
const PrimaryButton = ({ children, variant = "primary" }) => {
  const styles = {
    primary:   { background: "var(--color-midnight)", color: "var(--color-white)", border: "none",
                 boxShadow: "0 2px 8px rgba(4,30,66,0.20)" },
    secondary: { background: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-border-strong)",
                 boxShadow: "none" },
    ghost:     { background: "transparent", color: "var(--color-slate)", border: "none", boxShadow: "none" },
  }[variant];
  return (
    <button type="button" style={{
      width: "100%", height: 54, borderRadius: 58, font: "inherit", fontSize: 16, fontWeight: 600,
      letterSpacing: "-0.005em", cursor: "pointer", ...styles,
    }}>{children}</button>
  );
};

Object.assign(window, { DoseSheet });
