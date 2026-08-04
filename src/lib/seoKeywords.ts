/**
 * Central keyword sets used to enrich page metadata naturally.
 * Grouped by intent so pages only pull the terms that genuinely match them.
 */

export const PRIMARY_KEYWORDS = [
  "Travel Agency Mumbai",
  "Tour Operator Mumbai",
  "International Tour Packages",
  "Domestic Tour Packages",
  "Holiday Packages from Mumbai",
];

export const SERVICE_KEYWORDS = [
  "Visa Services Mumbai",
  "Air Ticket Booking Mumbai",
  "Cruise Packages",
  "Customized Holidays",
  "Luxury Holidays",
  "Family Holiday Packages",
  "Honeymoon Packages",
  "Corporate Travel",
  "MICE Travel",
  "Group Tours",
  "Educational Tours",
  "Senior Citizen Tours",
];

export const DESTINATION_KEYWORDS = [
  "Dubai Tour Package from Mumbai",
  "Bali Tour Package from Mumbai",
  "Thailand Tour Package from Mumbai",
  "Singapore Tour Package from Mumbai",
  "Japan Tour Package from Mumbai",
  "Europe Tour Package from Mumbai",
  "Switzerland Tour Package",
  "Paris Tour Package",
  "Spain Tour Package",
  "Vietnam Tour Package",
  "Sri Lanka Tour Package",
  "Baku Tour Package",
  "Kashmir Tour Package",
  "Kerala Tour Package",
  "Hong Kong Tour Package",
];

/** Extra long-tail terms mapped to individual destination slugs. */
const SLUG_KEYWORDS: Record<string, string[]> = {
  dubai: ["Dubai Tour Package from Mumbai", "Dubai holiday packages", "Dubai visa services Mumbai"],
  bali: ["Bali Tour Package from Mumbai", "Bali honeymoon packages"],
  thailand: ["Thailand Tour Package from Mumbai", "Bangkok Pattaya Phuket packages"],
  "singapore-malaysia": ["Singapore Tour Package from Mumbai", "Singapore Malaysia family holiday packages"],
  japan: ["Japan Tour Package from Mumbai", "Japan cherry blossom tour"],
  europe: [
    "Europe Tour Package from Mumbai",
    "Switzerland Tour Package",
    "Paris Tour Package",
    "Spain Tour Package",
    "Customized Europe Tours",
  ],
  vietnam: ["Vietnam Tour Package", "Vietnam holiday packages from Mumbai"],
  "sri-lanka": ["Sri Lanka Tour Package", "Sri Lanka family holidays"],
  georgia: ["Baku Tour Package", "Georgia Tour Package from Mumbai"],
  kashmir: ["Kashmir Tour Package", "Kashmir honeymoon packages"],
  kerala: ["Kerala Tour Package", "Kerala backwaters holiday packages"],
  hongkong: ["Hong Kong Tour Package", "Hong Kong Macau holidays"],
  maldives: ["Maldives honeymoon packages", "Maldives Tour Package from Mumbai"],
  goa: ["Goa holiday packages", "Goa family tour packages"],
};

/** Keywords for a destination page — long-tail first, then supporting terms. */
export const destinationKeywords = (slug: string, name: string, region: string) => [
  ...(SLUG_KEYWORDS[slug] ?? [`${name} Tour Package`, `${name} holiday packages from Mumbai`]),
  region === "Domestic" ? "Domestic Tour Packages" : "International Tour Packages",
  "Holiday Packages from Mumbai",
  "Travel Agency Mumbai",
  "Customized Holidays",
];

export const ALL_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...DESTINATION_KEYWORDS,
  ...SERVICE_KEYWORDS,
];
