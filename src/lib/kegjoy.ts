/**
 * Kegjoy catalog — the non-alcoholic cold brew and kombucha products Kegjoy
 * offers on tap, scraped from kegjoy.com/products. Each product is one votable
 * item (the kegerator holds one cold brew + one kombucha keg, so picking the
 * product IS picking "which flavor we want next").
 *
 * Static reference data — re-scrape occasionally if Kegjoy's lineup changes.
 * Votes are dynamic and live in D1 (see migrations/0002_kegerator.sql).
 * To add finer per-flavor granularity later, split a brand into multiple rows
 * (e.g. id "gts-gingerade") — the vote store keys on `id`, so nothing else
 * needs to change.
 */
export type KegCategory = "coldbrew" | "kombucha";

export interface KegItem {
  id: string;
  category: KegCategory;
  name: string;
  description: string;
}

export const KEG_CATALOG: KegItem[] = [
  // ---- Cold brew coffee ----
  { id: "bona-fide", category: "coldbrew", name: "Bona Fide Craft Draft", description: "Small-batch nitro cold brew — smooth, creamy cascade, naturally sweet, no dairy." },
  { id: "commonwealth-joe", category: "coldbrew", name: "Commonwealth Joe Nitro", description: "Nitro cold brew on tap — velvety head, bold and low-acid." },
  { id: "groundwork", category: "coldbrew", name: "Groundwork", description: "Organic LA-roasted cold brew — bold, chocolatey, full-bodied." },
  { id: "steeping-giant", category: "coldbrew", name: "Steeping Giant", description: "Slow-steeped craft cold brew — clean, smooth, low-acid." },

  // ---- Kombucha (non-alcoholic) ----
  { id: "marin", category: "kombucha", name: "Marin Kombucha", description: "Small-batch California booch — light, dry, lightly effervescent." },
  { id: "babe", category: "kombucha", name: "Babe Kombucha", description: "Crisp and low-sugar — easy-drinking, not too tart." },
  { id: "bambucha", category: "kombucha", name: "Bambucha", description: "San Diego craft kombucha — bright, fruit-forward, fizzy." },
  { id: "gts", category: "kombucha", name: "GT's Kombucha", description: "The original raw kombucha — tart, vinegary, probiotic-rich." },
  { id: "health-ade", category: "kombucha", name: "Health-Ade", description: "Fermented in glass — bold, balanced, fruit-forward flavors." },
  { id: "mightybooch", category: "kombucha", name: "MightyBooch", description: "Bold, full-flavored kombucha built for the tap." },
];

export const KEG_ORDER_EMAIL = "ordersvista@kegjoy.com";

export const coldBrew = KEG_CATALOG.filter((i) => i.category === "coldbrew");
export const kombucha = KEG_CATALOG.filter((i) => i.category === "kombucha");
