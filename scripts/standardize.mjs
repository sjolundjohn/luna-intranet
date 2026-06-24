/**
 * standardize.mjs — v0.6 "aggressive snap": rewrite every wireframe font-size
 * to the nearest HIG type token (no new tokens). Deterministic + re-runnable;
 * review the result as a git diff. Targets the wireframe design system only
 * (ios-spine.css + components/ux), NOT the token defs, the design-system demo,
 * or the tool UI. Run: node scripts/standardize.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS = [11, 12, 13, 15, 16, 17, 20, 22, 28, 34, 56]; // HIG scale + Display 56 (px)

function snap(v) {
  let best = TOKENS[0];
  for (const t of TOKENS) {
    const d = Math.abs(t - v), bd = Math.abs(best - v);
    if (d < bd || (d === bd && t > best)) best = t; // ties → larger
  }
  return best;
}

// collect target files
const files = [join(root, "src/styles/ios-spine.css")];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.astro$/.test(p)) files.push(p);
  }
})(join(root, "src/components/ux"));

const RADII = [8, 12, 20, 28]; // chip / input / card / modal (pill 999 + circle 50% untouched)
function snapR(v) {
  if (v >= 100) return v; // leave pill (999)
  let best = RADII[0];
  for (const t of RADII) {
    const d = Math.abs(t - v), bd = Math.abs(best - v);
    if (d < bd || (d === bd && t > best)) best = t;
  }
  return best;
}

const reFont = /font-size:( ?)([0-9.]+)px/g;
const reRad = /border-radius:( ?)([0-9.]+)px/g; // single-value only; multi-value/% left as-is
const changes = new Map();
let fz = 0, rd = 0;
for (const f of files) {
  let src = readFileSync(f, "utf8");
  src = src.replace(reFont, (m, sp, num) => {
    const v = parseFloat(num), s = snap(v);
    if (s !== v) { changes.set(`font ${num}→${s}`, (changes.get(`font ${num}→${s}`) || 0) + 1); fz++; }
    return `font-size:${sp}${s}px`;
  });
  src = src.replace(reRad, (m, sp, num) => {
    const v = parseFloat(num), s = snapR(v);
    if (s !== v) { changes.set(`radius ${num}→${s}`, (changes.get(`radius ${num}→${s}`) || 0) + 1); rd++; }
    return `border-radius:${sp}${s}px`;
  });
  writeFileSync(f, src);
}
console.log(`✓ snapped ${fz} font-size + ${rd} border-radius values across ${files.length} files`);
console.log([...changes.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `   ${k}px ×${n}`).join("\n"));
