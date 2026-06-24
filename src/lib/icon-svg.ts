/**
 * icon-svg.ts — string builder for shared glyphs rendered via `set:html`
 * (frontmatter `const x = iconSvg(…)`). Mirrors Icon.astro but returns the raw
 * SVG markup string (self-closing children, matching how these glyphs were
 * authored inline) so the built HTML is byte-identical. Geometry lives once in
 * icon-geom.ts. For markup in the template, prefer the <Icon> component.
 */
import { ICON_GEOM, type IconName } from "./icon-geom";

export function iconSvg(name: IconName, size: number, sw: number | string, color = "currentColor"): string {
  const g = ICON_GEOM[name];
  return `<svg width="${size}" height="${size}" viewBox="${g.vb}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${g.body}</svg>`;
}
