/**
 * icon-build.mjs — Phase 2 icon de-dup (v0.6).
 *
 * Gives each repeated glyph (chevrons, checkmarks, moon, arrows, …) ONE source of
 * truth. Two replacement paths, both BYTE-IDENTICAL (proven by scripts/gate.mjs):
 *   • TEMPLATE inline <svg>            → <Icon name … />            (Astro component)
 *   • FRONTMATTER  const x = '<svg…>'  → iconSvg("name", …)         (string helper,
 *     for glyphs rendered via set:html)
 *
 * Correctness contract: a glyph is only rewritten when its inner body is an EXACT
 * match (whitespace-canonicalised) for the registry's canonical body AND its <svg>
 * attributes are EXACTLY the standard skeleton (width=height, viewBox, fill=none,
 * stroke, stroke-width, linecap/linejoin=round) in that order — nothing extra. Any
 * variant (rare differing geometry, extra style/transform/aria attrs, off-skeleton
 * order) is left untouched. Geometry source of truth: src/lib/icon-geom.ts.
 *
 *   node scripts/icon-build.mjs gen     # (re)generate src/lib/icon-geom.ts from source
 *   node scripts/icon-build.mjs apply   # rewrite glyphs + add imports
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "src/components/ux");

/** name ← distinctive substring of the icon's inner body. First match wins. */
const GLYPHS = [
  { name: "moon-mark", sig: "M21 12.8A9 9 0 1 1 11.2 3" },
  { name: "check", sig: 'points="20 6 9 17 4 12"' },
  { name: "chevron-right", sig: "M9 6l6 6-6 6" },
  { name: "chevron-left", sig: "M15 18l-6-6 6-6" },
  { name: "arrow-up", sig: "M12 19V5M5 12l7-7 7 7" },
  { name: "arrow-right", sig: "M5 12h14M13 5l7 7-7 7" },
  { name: "check-circle", sig: "M9 12.5l2 2 4.5-5" },
  { name: "info-circle", sig: "M12 11v5M12 8h.01" },
  { name: "warning-triangle", sig: "M10.3 3.9 1.8 18" },
  { name: "bell", sig: "M18 8A6 6 0 0 0 6 8" },
  { name: "loop", sig: "M17 2l4 4-4 4M21 6H7" },
  { name: "droplet", sig: "M12 2.7S5 9.5 5 14.5" },
  { name: "backspace", sig: "M21 4H8l-7 8" },
  { name: "lock", sig: "M7 11V7a5 5 0 0 1 10 0v4" },
  { name: "heart", sig: "M12 21s-7.5-4.7-10-9.3" },
  { name: "message", sig: "M21 15a2 2 0 0 1-2 2H7" },
  { name: "info-lined", sig: '<circle cx="12" cy="12" r="10"/>' }, // info circle (r10 + line "i")
];

// ── files ───────────────────────────────────────────────────────────────────
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.astro$/.test(p)) files.push(p);
  }
})(base);

const svgRe = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/g;
const vbOf = (attrs) => (attrs.match(/viewBox="([^"]*)"/) || [, "0 0 24 24"])[1];
const nameForBody = (body) => GLYPHS.find((g) => body.includes(g.sig))?.name ?? null;
/** Canonical RAW (self-closing) body — drop only space before "/>", trim ends. */
const canon = (s) => s.trim().replace(/\s+\/>/g, "/>");

// Split an .astro file into [frontmatter, template]. Frontmatter is the first
// ---\n…\n--- block (TS); the rest is template. SVGs in frontmatter are JS
// strings (set:html) — they must NOT become <Icon> (a component tag), only iconSvg.
function split(src) {
  const m = src.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return m ? [m[0], src.slice(m[0].length)] : ["", src];
}

// strict skeleton parse — returns {name,size,sw,color} or null if not rewritable
const CANON_ATTRS = ["width", "height", "viewBox", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"];
const attrNames = (attrs) =>
  [...attrs.trim().matchAll(/([a-zA-Z][a-zA-Z-]*)(?:=(?:"[^"]*"|\{[^}]*\}))?/g)].map((m) => m[1]).filter(Boolean);
const pick = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\b${name}=(?:"([^"]*)"|\\{([^}]*)\\})`));
  if (!m) return null;
  return m[1] !== undefined ? { v: m[1], dyn: false } : { v: m[2], dyn: true };
};
function parse(attrs, body, byBody) {
  const hit = byBody.get(canon(body));
  if (!hit) return null;
  if (attrNames(attrs).join(",") !== CANON_ATTRS.join(",")) return null;
  const w = pick(attrs, "width"), h = pick(attrs, "height");
  const vb = pick(attrs, "viewBox"), fill = pick(attrs, "fill");
  const stroke = pick(attrs, "stroke"), sw = pick(attrs, "stroke-width");
  const lc = pick(attrs, "stroke-linecap"), lj = pick(attrs, "stroke-linejoin");
  if (!w || !h || w.dyn || h.dyn || w.v !== h.v) return null;
  if (!vb || vb.v !== hit.vb) return null;
  if (!fill || fill.v !== "none") return null;
  if (!lc || lc.v !== "round" || !lj || lj.v !== "round") return null;
  if (!stroke || !sw) return null;
  return { name: hit.name, size: w.v, sw, stroke };
}

const mode = process.argv[2];

if (mode === "gen") {
  // Count each canonical body per glyph; the DOMINANT (most-used) body becomes
  // canonical. Rare variants stay inline (reported by `apply`). Keeps every
  // rewrite byte-identical without forcing one geometry onto differing variants.
  const counts = {}; // name -> Map(body -> {n, vb})
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(svgRe)) {
      const [, attrs, body] = m;
      const name = nameForBody(body);
      if (!name) continue;
      const b = canon(body);
      (counts[name] ??= new Map());
      const cur = counts[name].get(b) || { n: 0, vb: vbOf(attrs) };
      cur.n++;
      counts[name].set(b, cur);
    }
  }
  const reg = {};
  for (const g of GLYPHS) {
    const m = counts[g.name];
    if (!m) continue;
    const [body, info] = [...m.entries()].sort((a, b) => b[1].n - a[1].n)[0];
    reg[g.name] = { vb: info.vb, body };
  }
  const order = GLYPHS.map((g) => g.name).filter((n) => reg[n]);
  const lines = order.map(
    (n) => `  ${JSON.stringify(n)}: { vb: ${JSON.stringify(reg[n].vb)}, body: ${JSON.stringify(reg[n].body)} },`
  );
  writeFileSync(
    join(root, "src/lib/icon-geom.ts"),
    `/**
 * icon-geom.ts — GENERATED by scripts/icon-build.mjs (do not hand-edit).
 * Canonical RAW (self-closing) inner geometry + viewBox per shared glyph. Used by
 * Icon.astro (expanded to match Astro's output) and iconSvg() (verbatim string).
 */
export interface IconGeom { vb: string; body: string; }
export const ICON_GEOM: Record<string, IconGeom> = {
${lines.join("\n")}
};
export type IconName = keyof typeof ICON_GEOM;
`
  );
  console.log(`✓ icon-geom.ts: ${order.length} glyphs → ${order.join(", ")}`);
} else if (mode === "apply") {
  const { ICON_GEOM } = await import("../src/lib/icon-geom.ts");
  const byBody = new Map();
  for (const [name, g] of Object.entries(ICON_GEOM)) byBody.set(g.body, { name, vb: g.vb });

  const iconSvgCall = (p) => {
    const args = [`"${p.name}"`, p.size, p.sw.v];
    if (p.stroke.dyn) args.push(`(${p.stroke.v})`);
    else if (p.stroke.v !== "currentColor") args.push(`"${p.stroke.v}"`);
    return `iconSvg(${args.join(", ")})`;
  };
  const iconTag = (p) => {
    const props = [`name="${p.name}"`, `size={${p.size}}`, `sw={${p.sw.v}}`];
    if (p.stroke.dyn) props.push(`color={${p.stroke.v}}`);
    else if (p.stroke.v !== "currentColor") props.push(`color="${p.stroke.v}"`);
    return `<Icon ${props.join(" ")} />`;
  };
  const importLine = (f, what, sub) => {
    const rel = relative(dirname(f), join(root, sub)).replace(/\\/g, "/");
    return `import ${what} from "${rel.startsWith(".") ? rel : "./" + rel}";`;
  };

  let tpl = 0, str = 0;
  const changed = [];
  const variantsLeft = new Map();
  for (const f of files) {
    let [fm, body] = split(readFileSync(f, "utf8"));
    let nT = 0, nS = 0;

    // TEMPLATE: inline <svg> → <Icon>
    body = body.replace(svgRe, (whole, attrs, inner) => {
      const p = parse(attrs, inner, byBody);
      if (!p) {
        if (nameForBody(inner)) variantsLeft.set(f, (variantsLeft.get(f) || 0) + 1);
        return whole;
      }
      nT++;
      return iconTag(p);
    });

    // FRONTMATTER: a quoted string that is EXACTLY one <svg>…</svg> → iconSvg(…)
    fm = fm.replace(/(['"])(<svg\b[^>]*>[\s\S]*?<\/svg>)\1/g, (whole, q, svg) => {
      if (svg.includes("${")) return whole; // dynamic builder, leave as-is
      const m = svg.match(/^<svg\b([^>]*)>([\s\S]*?)<\/svg>$/);
      const p = m && parse(m[1], m[2], byBody);
      if (!p) return whole;
      nS++;
      return iconSvgCall(p);
    });

    if (nT || nS) {
      const imports = [];
      if (nT && !/from\s+["'][^"']*Icon\.astro["']/.test(fm)) imports.push(importLine(f, "Icon", "src/components/ux/Icon.astro"));
      if (nS && !/\{\s*iconSvg\s*\}/.test(fm)) imports.push(importLine(f, "{ iconSvg }", "src/lib/icon-svg.ts").replace('.ts"', '"'));
      if (imports.length) {
        if (/^---\r?\n/.test(fm)) fm = fm.replace(/^---\r?\n/, `---\n${imports.join("\n")}\n`);
        else fm = `---\n${imports.join("\n")}\n---\n` + fm;
      }
      writeFileSync(f, fm + body);
      tpl += nT; str += nS;
      changed.push(`${relative(root, f)} (${nT ? nT + " tpl" : ""}${nT && nS ? ", " : ""}${nS ? nS + " str" : ""})`);
    }
  }
  console.log(`✓ ${tpl} template <svg>→<Icon>, ${str} string→iconSvg, across ${changed.length} files:`);
  console.log(changed.map((x) => "   " + x).join("\n"));
  if (variantsLeft.size) {
    const tot = [...variantsLeft.values()].reduce((a, b) => a + b, 0);
    console.log(`\nℹ ${tot} glyph variant(s) left inline (differing geometry/attrs) in ${variantsLeft.size} files — byte-identical preserved.`);
  }
} else {
  console.error("usage: node scripts/icon-build.mjs [gen|apply]");
  process.exit(1);
}
