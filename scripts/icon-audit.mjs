/**
 * icon-audit.mjs — diagnostic for the Phase 2 icon de-dup. Extracts every inline
 * <svg> in src/components/ux, normalises its inner geometry (path/circle/line/
 * polyline children, whitespace-collapsed), and groups identical geometries so we
 * can see what ACTUALLY repeats (componentization wins) vs. one-off illustrations
 * (no win). Read-only. Run: node scripts/icon-audit.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "src/components/ux");

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.astro$/.test(p)) files.push(p);
  }
})(base);

// crude but adequate: match <svg ...>...</svg> (non-greedy, dotall)
const svgRe = /<svg\b[^>]*>([\s\S]*?)<\/svg>/g;
// geometry = the d="" / points="" values of children, concatenated + ws-collapsed
function geom(inner) {
  const vals = [];
  for (const m of inner.matchAll(/\b(?:d|points)="([^"]*)"/g)) vals.push(m[1]);
  // also note non-path primitives (circle/rect) by their shape attrs
  for (const m of inner.matchAll(/<(circle|rect|ellipse)\b([^>]*)>/g)) vals.push(m[1] + ":" + m[2].replace(/\s+/g, " ").trim());
  return vals.join(" | ").replace(/\s+/g, " ").trim();
}

const groups = new Map(); // geom -> [{file, opening}]
let total = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(svgRe)) {
    total++;
    const g = geom(m[1]) || "(empty)";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(relative(root, f));
  }
}

const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
console.log(`Total inline <svg>: ${total}  |  distinct geometries: ${groups.size}\n`);
console.log("── repeated (≥2 uses) — componentization candidates ──");
let repeated = 0, repeatedUses = 0;
for (const [g, uses] of sorted) {
  if (uses.length < 2) continue;
  repeated++; repeatedUses += uses.length;
  const short = g.length > 70 ? g.slice(0, 70) + "…" : g;
  console.log(`  ×${uses.length}  ${short}`);
}
console.log(`\n  ${repeated} distinct glyphs repeat, covering ${repeatedUses} of ${total} SVGs.`);
const singletons = total - repeatedUses;
console.log(`  ${singletons} SVGs are one-offs (singletons) — no componentization win.`);
