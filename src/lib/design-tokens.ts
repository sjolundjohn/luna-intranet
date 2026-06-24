/**
 * design-tokens.ts — machine-readable mirror of the design system, for the
 * in-tool Inspect mode (engineering handoff). Canonical values mirror
 * `src/styles/ios-tokens.css`; display names mirror the Design System page
 * (`design-system.astro`). The **canonical alias** (name) is the source of
 * truth for the .xcassets export (PascalCase derived from it).
 *
 * NOTE (from the adversarial pre-build pass): the wireframes largely DON'T use
 * these tokens directly — type comes from ad-hoc component CSS (often off the
 * HIG scale), colors are often raw hex / rgba literals. So the inspector reports
 * COMPUTED values and only appends a token name on an exact match; "no match"
 * is neutral, not an error.
 */

export interface ColorToken {
  /** CSS custom property, e.g. "--color-moonlight". */
  v: string;
  /** Canonical alias / display name, e.g. "Moonlight". Source of truth for PascalCase. */
  name: string;
  /** Hex value, uppercase. */
  hex: string;
}

/** All 42 color tokens (names + hexes mirror ios-tokens.css / design-system.astro). */
export const COLOR_TOKENS: ColorToken[] = [
  { v: "--color-midnight", name: "Midnight", hex: "#041E42" },
  { v: "--color-moonlight", name: "Moonlight", hex: "#68D2DF" },
  { v: "--color-white", name: "White", hex: "#FFFFFF" },
  { v: "--color-moonlight-deep", name: "Moonlight Deep", hex: "#0A9AAE" },
  { v: "--color-moonlight-ice", name: "Moonlight Ice", hex: "#C9F8FE" },
  { v: "--color-moonlight-tint", name: "Moonlight Tint", hex: "#E8FCFF" },
  { v: "--color-soft-paper", name: "Soft Paper", hex: "#FBFDFE" },
  { v: "--color-cloud-lilac", name: "Cloud Lilac", hex: "#F2F3FA" },
  { v: "--color-periwinkle-mist", name: "Periwinkle Mist", hex: "#E7EBF8" },
  { v: "--color-pebble-blue", name: "Pebble Blue", hex: "#BAC6D9" },
  { v: "--color-graphite", name: "Graphite", hex: "#535D65" },
  { v: "--color-slate", name: "Slate", hex: "#7A8892" },
  { v: "--color-lunar-lavender", name: "Lunar Lavender", hex: "#D6D3E9" },
  { v: "--color-step-surface", name: "Step Surface", hex: "#F5F6F8" },
  { v: "--color-midnight-deep", name: "Midnight Deep", hex: "#133465" },
  { v: "--color-midnight-soft", name: "Midnight Soft", hex: "#0F1C40" },
  { v: "--color-midnight-floor", name: "Midnight Floor", hex: "#031632" },
  { v: "--color-ink", name: "Ink", hex: "#041E42" },
  { v: "--color-text-2", name: "Text 2 (Graphite)", hex: "#535D65" },
  { v: "--color-text-3", name: "Text 3 (Slate)", hex: "#7A8892" },
  { v: "--color-disabled", name: "Disabled", hex: "#BAC6D9" },
  { v: "--color-on-dark", name: "On-Dark", hex: "#FFFFFF" },
  { v: "--color-on-dark-sub", name: "On-Dark Sub", hex: "#ACC1DF" },
  { v: "--color-divider", name: "Divider", hex: "#BAC6D9" },
  { v: "--color-border-subtle", name: "Border Subtle", hex: "#EDF0F7" },
  { v: "--color-border-default", name: "Border Default", hex: "#D1D6E0" },
  { v: "--color-border-strong", name: "Border Strong", hex: "#ACC1DF" },
  { v: "--color-border-focus", name: "Border Focus", hex: "#68D2DF" },
  { v: "--color-success", name: "Success", hex: "#2E7D32" },
  { v: "--color-success-ink", name: "Success Ink", hex: "#2E7D32" },
  { v: "--color-success-light", name: "Success Light", hex: "#B0F9B3" },
  { v: "--color-success-fill", name: "Success Fill", hex: "#B0F9B3" },
  { v: "--color-success-bg", name: "Success BG", hex: "#E7F8E8" },
  { v: "--color-info", name: "Info", hex: "#68D2DF" },
  { v: "--color-info-ink", name: "Info Ink", hex: "#0A9AAE" },
  { v: "--color-info-bg", name: "Info BG", hex: "#E8FCFF" },
  { v: "--color-warning", name: "Warning", hex: "#F9CD86" },
  { v: "--color-warning-ink", name: "Warning Ink", hex: "#6B4B10" },
  { v: "--color-warning-bg", name: "Warning BG", hex: "#FFF4DD" },
  { v: "--color-critical", name: "Critical (Plum)", hex: "#8E3655" },
  { v: "--color-critical-ink", name: "Critical Ink", hex: "#8E3655" },
  { v: "--color-critical-bg", name: "Critical BG", hex: "#F7E4EA" },
];

export interface TypeToken {
  /** Class name, e.g. "title-1". */
  cls: string;
  /** Display name, e.g. "Title 1". */
  name: string;
  size: number;
  weight: number;
  lh: number;
}

/** The 11-level iOS HIG type scale (mirrors ios-tokens.css ~L128–139). */
export const TYPE_SCALE: TypeToken[] = [
  { cls: "large-title", name: "Large Title", size: 34, weight: 400, lh: 1.12 },
  { cls: "title-1", name: "Title 1", size: 28, weight: 400, lh: 1.18 },
  { cls: "title-2", name: "Title 2", size: 22, weight: 400, lh: 1.25 },
  { cls: "title-3", name: "Title 3", size: 20, weight: 400, lh: 1.3 },
  { cls: "headline", name: "Headline", size: 17, weight: 600, lh: 1.4 },
  { cls: "body", name: "Body", size: 17, weight: 400, lh: 1.5 },
  { cls: "callout", name: "Callout", size: 16, weight: 400, lh: 1.45 },
  { cls: "subhead", name: "Subhead", size: 15, weight: 400, lh: 1.45 },
  { cls: "footnote", name: "Footnote", size: 13, weight: 400, lh: 1.4 },
  { cls: "caption-1", name: "Caption 1", size: 12, weight: 400, lh: 1.35 },
  { cls: "caption-2", name: "Caption 2", size: 11, weight: 400, lh: 1.3 },
];

export interface IconDef {
  /** A distinctive SVG path `d` substring used to recognise the icon. */
  d: string;
  /** Canonical asset name (matches the eventual SVG export filename). */
  name: string;
  /** SF Symbol name if this maps to one; null = custom asset to export. */
  sf: string | null;
}

/**
 * Curated icon recognition map (Phase 1, partial by design). Keyed by a
 * distinctive path-`d` fragment. Custom icons (sf: null) become SVG exports;
 * SF-Symbol icons are labeled, not exported. Unknown SVGs report "Unmapped icon".
 * The CSS-drawn moon mark (pseudo-elements) is NOT detectable here — handled in
 * Phase 2 when it's authored as a real SVG.
 */
export const ICONS: IconDef[] = [
  { d: "A9 9 0 1 1 11.2 3", name: "moon-mark", sf: null },
  { d: "A9 9 0 1 1 11.21 3", name: "moon-mark", sf: null },
  { d: "M9 6l6 6-6 6", name: "chevron-right", sf: "chevron.right" },
  { d: "M15 18l-6-6 6-6", name: "chevron-left", sf: "chevron.left" },
  { d: "M20 6L9 17l-5-5", name: "checkmark", sf: "checkmark" },
  { d: "M9 12.5l2 2 4.5-5", name: "checkmark", sf: "checkmark" },
  { d: "20 6 9 17 4 12", name: "checkmark", sf: "checkmark" },
  { d: "M18 6L6 18", name: "xmark", sf: "xmark" },
  { d: "M12 9v4M12 17h.01", name: "info", sf: "info.circle" },
  { d: "M12 16v-4M12 8h.01", name: "info", sf: "info.circle" },
  { d: "M10.3 3.9 1.8 18", name: "warning-triangle", sf: "exclamationmark.triangle" },
  { d: "M12 19V5M5 12l7-7 7 7", name: "arrow-up", sf: "arrow.up" },
  { d: "M12 5v14M19 12l-7 7-7-7", name: "arrow-down", sf: "arrow.down" },
  { d: "M5 12h14M13 5l7 7-7 7", name: "arrow-right", sf: "arrow.right" },
  { d: "M5 3l9 5-9 5V3z", name: "play", sf: "play.fill" },
  { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18", name: "bell", sf: "bell.fill" },
  { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5", name: "message", sf: "message.fill" },
  { d: "M12 21s-7.5-4.7-10-9.3", name: "apple-health-heart", sf: null },
  { d: "M12 2.7S5 9.5 5 14.5", name: "droplet", sf: "drop.fill" },
  { d: "M12 2s6 7 6 11", name: "droplet", sf: "drop.fill" },
  { d: "M3 11l9-8 9 8", name: "home", sf: "house.fill" },
  { d: "M12 8v4l3 2", name: "clock", sf: "clock" },
  { d: "M7 11V7a5 5 0 0 1 10 0v4", name: "lock", sf: "lock.fill" },
  { d: "M12 2v4M12 18v4M2 12h4", name: "sun", sf: "sun.max.fill" },
  { d: "M19 12a7 7 0 0 0-.1-1", name: "settings-gear", sf: "gearshape.fill" },
  { d: "M21 12a9 9 0 1 1-3-6.7", name: "relearn", sf: "arrow.triangle.2.circlepath" },
  // ── registry completion (audited from the wireframes) ──
  { d: "A9 9 0 1111.2 3", name: "moon-mark", sf: null },
  { d: "M17 2l4 4-4 4M21 6H7", name: "loop", sf: "arrow.triangle.2.circlepath" },
  { d: "M12 11v5M12 8h.01", name: "info", sf: "info.circle" },
  { d: "M12 2v2M12 20v2M4.2 4.2", name: "sun", sf: "sun.max.fill" },
  { d: "6 4 20 12 6 20 6 4", name: "play", sf: "play.fill" },
  { d: "1 4 1 10 7 10", name: "restart", sf: "arrow.clockwise" },
  { d: "M3 9h18M8 3v4M16 3v4", name: "calendar", sf: "calendar" },
  { d: "M4 6h16M7 12h10M10 18h4", name: "filter", sf: "line.3.horizontal.decrease" },
  { d: "M12 5v14M5 12h14", name: "plus", sf: "plus" },
  { d: "M8.5 12.5l2.5 2.5 4.5-5", name: "checkmark", sf: "checkmark" },
  { d: "M21 4H8l-7 8 7 8h13", name: "backspace", sf: "delete.left" },
  { d: "M1 4.5C3 2.5", name: "wifi", sf: "wifi" },
  { d: "M9 7h6M9 10h6M9 13h6", name: "reservoir", sf: null },
  // illustrations / hero art (custom; not SF Symbols)
  { d: "M 0,118 Q 200,112", name: "cgm-trace-hero", sf: null },
  { d: "M0,58 C30,54", name: "cgm-graph", sf: null },
  { d: "M12 3v18M5 8c2.5 0 4 1.5 4 4", name: "sprout", sf: null },
  { d: "M12 2v3M4.5 6.5l1.5 1.5", name: "sun-rays", sf: null },
  { d: "M5 8h11a2 2 0 0 1 2 2v4", name: "device-chip", sf: null },
  { d: "m7 7 10 10-5 5V2l5 5L7 17", name: "wand", sf: null },
];

// ── lookups ───────────────────────────────────────────────────────────────

/** Normalise any CSS color (rgb/rgba/#hex) to "#RRGGBB" uppercase; alpha dropped. null if not resolvable/transparent. */
export function toHex(color: string): string | null {
  if (!color) return null;
  const c = color.trim().toLowerCase();
  if (c === "transparent" || c === "rgba(0, 0, 0, 0)" || c === "none") return null;
  if (c.startsWith("#")) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    if (h.length >= 6) return "#" + h.slice(0, 6).toUpperCase();
    return null;
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((p) => p.trim());
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (a === 0) return null;
    const [r, g, b] = parts.slice(0, 3).map((p) => Math.round(parseFloat(p)));
    const hx = (n: number) => n.toString(16).padStart(2, "0");
    return "#" + (hx(r) + hx(g) + hx(b)).toUpperCase();
  }
  return null;
}

/** Token names sharing a hex (e.g. "#68D2DF" → ["Moonlight","Info","Border Focus"]). */
export function tokensForHex(hex: string): ColorToken[] {
  const H = hex.toUpperCase();
  return COLOR_TOKENS.filter((t) => t.hex.toUpperCase() === H);
}

/** Exact type-token match by size + weight (line-height is advisory). null = off-scale. */
export function matchType(size: number, weight: number): TypeToken | null {
  const s = Math.round(size);
  return (
    TYPE_SCALE.find((t) => Math.round(t.size) === s && t.weight === weight) ??
    null
  );
}

/** The design-system type token whose size is closest to `size` (always returns one). */
export function nearestType(size: number): TypeToken {
  return TYPE_SCALE.reduce((best, t) =>
    Math.abs(t.size - size) < Math.abs(best.size - size) ? t : best
  );
}

/** Recognise an icon from a concatenated geometry signature (all child path `d`s). null = unmapped. */
export function matchIcon(signature: string): IconDef | null {
  return ICONS.find((i) => signature.includes(i.d)) ?? null;
}

/** PascalCase an alias for the .xcassets color name, e.g. "Moonlight Deep" → "MoonlightDeep". */
export function pascalCase(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
