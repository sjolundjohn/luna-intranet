/**
 * Kegjoy catalog — the actual non-alcoholic cold brew and kombucha *flavors*
 * Kegjoy offers on tap (scraped from each product page on kegjoy.com, not just
 * the brand index). Each flavor is one votable item; `name` is "Brand · Flavor"
 * so the winning pick reads cleanly in the reorder email.
 *
 * Static reference data — re-scrape occasionally if Kegjoy's lineup changes.
 * Votes are dynamic and live in D1 (see migrations/0002_kegerator.sql). The
 * vote store keys on `id`, so changing this list just resets votes for any
 * item whose id changed.
 */
export type KegCategory = "coldbrew" | "kombucha";

export interface KegItem {
  id: string;
  category: KegCategory;
  /** "Brand · Flavor" */
  name: string;
  brand: string;
  description: string;
}

export const KEG_CATALOG: KegItem[] = [
  // ─────────────── Cold brew coffee ───────────────
  // Bona Fide Craft Draft
  { id: "bona-fide-hair-raiser", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Hair Raiser", description: "Dark roast, on nitro." },
  { id: "bona-fide-ethiopia", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Ethiopia", description: "Medium roast, on nitro." },
  { id: "bona-fide-guatemala", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Guatemala", description: "Medium roast, on nitro." },
  { id: "bona-fide-peru", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Peru", description: "Light roast, on nitro." },
  { id: "bona-fide-nitro-espresso", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Nitro Espresso", description: "Dark-roast espresso, on nitro." },
  { id: "bona-fide-nitro-vanilla", category: "coldbrew", brand: "Bona Fide", name: "Bona Fide · Nitro Vanilla", description: "Vanilla — flavored without the syrup." },
  // Commonwealth Joe
  { id: "commonwealth-joe-nitro", category: "coldbrew", brand: "Commonwealth Joe", name: "Commonwealth Joe · Nitro", description: "Medium-blend nitro cold brew, creamy cascade." },
  // Groundwork (serving variants)
  { id: "groundwork-nitro", category: "coldbrew", brand: "Groundwork", name: "Groundwork · Nitro", description: "Organic LA cold brew, served neat on nitro." },
  { id: "groundwork-classic", category: "coldbrew", brand: "Groundwork", name: "Groundwork · Classic", description: "Organic LA cold brew, served over ice." },
  // Steeping Giant
  { id: "steeping-giant-gargantua", category: "coldbrew", brand: "Steeping Giant", name: "Steeping Giant · Gargantua", description: "Dark, bold roast." },
  { id: "steeping-giant-hond-solo", category: "coldbrew", brand: "Steeping Giant", name: "Steeping Giant · Hond Solo", description: "Single-origin Honduran." },
  { id: "steeping-giant-big-papua", category: "coldbrew", brand: "Steeping Giant", name: "Steeping Giant · Big Papua (Organic)", description: "Organic medium roast." },

  // ─────────────── Kombucha ───────────────
  // Marin
  { id: "marin-pinot-sage", category: "kombucha", brand: "Marin", name: "Marin · Pinot Sage", description: "Dry, wine-grape with sage." },
  // Babe
  { id: "babe-mowie-wowie", category: "kombucha", brand: "Babe", name: "Babe · Mowie Wowie", description: "Coconut, strawberry, banana, lime." },
  { id: "babe-sandia", category: "kombucha", brand: "Babe", name: "Babe · Sandia", description: "Watermelon, cucumber." },
  { id: "babe-hawaiian-pog", category: "kombucha", brand: "Babe", name: "Babe · Hawaiian POG", description: "Passion fruit, orange, guava." },
  // Bambucha
  { id: "bambucha-blueberry-tart", category: "kombucha", brand: "Bambucha", name: "Bambucha · Blueberry Tart", description: "Tart blueberry." },
  { id: "bambucha-hibiscus-rose", category: "kombucha", brand: "Bambucha", name: "Bambucha · Hibiscus Rose", description: "Floral hibiscus and rose." },
  { id: "bambucha-guava-punch", category: "kombucha", brand: "Bambucha", name: "Bambucha · Guava Punch", description: "Tropical guava." },
  { id: "bambucha-thai-ginger", category: "kombucha", brand: "Bambucha", name: "Bambucha · Thai Ginger", description: "Spiced Thai ginger." },
  { id: "bambucha-mango-masala", category: "kombucha", brand: "Bambucha", name: "Bambucha · Mango Masala", description: "Mango with masala spice." },
  // GT's
  { id: "gts-trilogy", category: "kombucha", brand: "GT's", name: "GT's · Trilogy", description: "Ginger, lemon, and raw kombucha." },
  { id: "gts-gingerade", category: "kombucha", brand: "GT's", name: "GT's · Gingerade", description: "Bright and gingery." },
  { id: "gts-watermelon-wonder", category: "kombucha", brand: "GT's", name: "GT's · Watermelon Wonder", description: "Watermelon." },
  { id: "gts-island-bliss", category: "kombucha", brand: "GT's", name: "GT's · Island Bliss", description: "Tropical island fruit." },
  { id: "gts-strawberry-serenity", category: "kombucha", brand: "GT's", name: "GT's · Strawberry Serenity", description: "Strawberry." },
  { id: "gts-golden-pineapple", category: "kombucha", brand: "GT's", name: "GT's · Golden Pineapple", description: "Pineapple." },
  { id: "gts-peach-paradise", category: "kombucha", brand: "GT's", name: "GT's · Peach Paradise", description: "Peach." },
  { id: "gts-pure", category: "kombucha", brand: "GT's", name: "GT's · Pure (Original)", description: "The original, unflavored raw kombucha." },
  // Health-Ade
  { id: "health-ade-pink-lady-apple", category: "kombucha", brand: "Health-Ade", name: "Health-Ade · Pink Lady Apple", description: "Crisp Pink Lady apple." },
  { id: "health-ade-pomegranate", category: "kombucha", brand: "Health-Ade", name: "Health-Ade · Pomegranate", description: "Pomegranate." },
  { id: "health-ade-berry-lemonade", category: "kombucha", brand: "Health-Ade", name: "Health-Ade · Berry Lemonade", description: "Mixed berry lemonade." },
  { id: "health-ade-tangerine-passionfruit", category: "kombucha", brand: "Health-Ade", name: "Health-Ade · Tangerine-Passionfruit", description: "Tangerine and passionfruit." },
  // MightyBooch
  { id: "mightybooch-raspberry-lemonade", category: "kombucha", brand: "MightyBooch", name: "MightyBooch · Raspberry Lemonade", description: "Raspberry lemonade." },
  { id: "mightybooch-california-citrus", category: "kombucha", brand: "MightyBooch", name: "MightyBooch · California Citrus", description: "Mixed citrus." },
  { id: "mightybooch-ginger-apple-turmeric", category: "kombucha", brand: "MightyBooch", name: "MightyBooch · Ginger, Apple & Turmeric", description: "Ginger, apple, and turmeric." },
];

export const KEG_ORDER_EMAIL = "ordersvista@kegjoy.com";

export const coldBrew = KEG_CATALOG.filter((i) => i.category === "coldbrew");
export const kombucha = KEG_CATALOG.filter((i) => i.category === "kombucha");
