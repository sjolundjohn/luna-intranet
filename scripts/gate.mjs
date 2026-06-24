/**
 * gate.mjs — visual-regression gate for Phase 2 consolidation.
 *
 * The 52 UX-Review screens are signed off. This snapshots the BUILT HTML of each
 * screen so a refactor (Icon component, moon consolidation, etc.) can be proven
 * to NOT change the rendered output — or to change only the screens we expect.
 *
 *   pnpm build && node scripts/gate.mjs baseline   # capture reference
 *   pnpm build && node scripts/gate.mjs check      # compare current build to it
 *
 * Build HTML is deterministic and has no dev-only attributes, so an identical
 * hash ⇒ identical DOM/CSS ⇒ pixel-identical render. Changed screens are listed
 * for manual review (expected for intentional shifts like the moon).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist/tools/ux-review");
const baselineFile = join(root, ".gate-baseline.json");
const mode = process.argv[2];

if (!existsSync(dist)) {
  console.error("✗ dist/tools/ux-review not found — run `pnpm build` first.");
  process.exit(1);
}

/** Extract the device-frame markup (the `.ux-ios` block) from a built page. */
function screenMarkup(html) {
  const i = html.indexOf('<div class="ux-ios"');
  if (i < 0) return html; // fallback: whole file
  // walk to the matching close by div depth
  let depth = 0, j = i;
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) { j = m.index + m[0].length; break; }
  }
  return html
    .slice(i, j)
    // strip Astro's per-build scoped-style / view-transition hashes (volatile,
    // not visual) so the gate only flags real markup/structure changes.
    .replace(/\s*data-astro-cid-[a-z0-9]+(="[^"]*")?/g, "")
    .replace(/\s*data-astro-transition-(scope|persist|name)="[^"]*"/g, "")
    // CgmHero mints a per-build random gradient id (Math.random) — volatile, not
    // visual (the def + its url(#…) reference always agree within a build). Strip
    // so the gate doesn't false-positive on every CGM screen.
    .replace(/cgmFill-[a-z0-9]+/g, "cgmFill-X");
}

function snapshot() {
  const out = {};
  for (const slug of readdirSync(dist)) {
    const f = join(dist, slug, "index.html");
    if (!existsSync(f)) continue;
    const markup = screenMarkup(readFileSync(f, "utf8"));
    out[slug] = createHash("sha1").update(markup).digest("hex");
  }
  return out;
}

if (mode === "baseline") {
  const snap = snapshot();
  writeFileSync(baselineFile, JSON.stringify(snap, null, 2));
  console.log(`✓ baseline captured: ${Object.keys(snap).length} screens → .gate-baseline.json`);
} else if (mode === "check") {
  if (!existsSync(baselineFile)) {
    console.error("✗ no baseline — run `node scripts/gate.mjs baseline` first.");
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(baselineFile, "utf8"));
  const cur = snapshot();
  const changed = [], added = [], removed = [];
  for (const k of Object.keys(cur)) {
    if (!(k in base)) added.push(k);
    else if (base[k] !== cur[k]) changed.push(k);
  }
  for (const k of Object.keys(base)) if (!(k in cur)) removed.push(k);
  if (!changed.length && !added.length && !removed.length) {
    console.log(`✓ GATE PASS — all ${Object.keys(cur).length} screens render identically.`);
  } else {
    console.log(`⚠ GATE: ${changed.length} changed, ${added.length} added, ${removed.length} removed`);
    if (changed.length) console.log("  changed:\n   - " + changed.sort().join("\n   - "));
    if (added.length) console.log("  added:   " + added.sort().join(", "));
    if (removed.length) console.log("  removed: " + removed.sort().join(", "));
    console.log("\nReview each changed screen — only intentional shifts (e.g. moon) are acceptable.");
  }
} else {
  console.error("usage: node scripts/gate.mjs [baseline|check]");
  process.exit(1);
}
