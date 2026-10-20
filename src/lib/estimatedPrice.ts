// Deterministic AI-style estimated starting price per destination.
// Produces stable, realistic INR pricing tuned to domestic/international
// market ranges. Values are cached per slug for visual consistency.

type Region = "Domestic" | "International";

// Manual overrides for marquee destinations (premium curated baselines).
const OVERRIDES: Record<string, number> = {
  andaman: 20999,
  "tamil-nadu": 18999,
  goa: 6999,
  kashmir: 20999,
  kerala: 10999,
  rajasthan: 14499,
  himachal: 18999,
  "himachal-pradesh": 18999,
  "leh-ladakh": 17999,
  uttarakhand: 16499,
  "char-dham": 50999,
  "north-east": 20999,
  "madhya-pradesh": 19000,
  gujarat: 10499,
  delhi: 5999,

  thailand: 28999,
  dubai: 44999,
  bali: 48999,
  vietnam: 42999,
  "singapore-malaysia": 56999,
  maldives: 89999,
  mauritius: 74999,
  "sri-lanka": 38999,
  bhutan: 36999,
  nepal: 32999,
  hongkong: 58999,
  georgia: 54999,
  japan: 119999,
  europe: 125999,
  australia: 124999,
  "united-kingdom": 119999,
};

// Stable string hash → bounded integer.
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const cache = new Map<string, number>();

export const generateEstimatedPrice = (
  slug: string,
  region: Region,
): number => {
  if (cache.has(slug)) return cache.get(slug)!;
  if (OVERRIDES[slug]) {
    cache.set(slug, OVERRIDES[slug]);
    return OVERRIDES[slug];
  }
  const [min, max] =
    region === "International" ? [28999, 125999] : [5999, 17999];
  const span = max - min;
  const raw = min + (hash(slug) % span);
  // Round to nearest 500 then end with 999 for premium feel.
  const rounded = Math.round(raw / 1000) * 1000 - 1;
  const final = Math.max(min, Math.min(max, rounded));
  cache.set(slug, final);
  return final;
};

export const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

// Realistic roundtrip economy flight fares per person departing from Mumbai (BOM)
const FLIGHT_OVERRIDES: Record<string, number> = {
  // Domestic from Mumbai
  goa: 6500,
  delhi: 7500,
  gujarat: 6000,
  kerala: 7500,
  rajasthan: 7500,
  "madhya-pradesh": 7000,
  "tamil-nadu": 8000,
  uttarakhand: 9500,
  himachal: 10500,
  "himachal-pradesh": 10500,
  kashmir: 11500,
  "leh-ladakh": 14500,
  "char-dham": 10500,
  "north-east": 13500,
  andaman: 16500,

  // International from Mumbai
  dubai: 24000,
  thailand: 26000,
  "sri-lanka": 22000,
  nepal: 21000,
  "singapore-malaysia": 29000,
  vietnam: 32000,
  bhutan: 34000,
  maldives: 28000,
  bali: 38000,
  hongkong: 42000,
  georgia: 44000,
  mauritius: 52000,
  japan: 58000,
  "united-kingdom": 65000,
  europe: 68000,
  australia: 78000,
};

export const getEstimatedFlightPrice = (
  slug: string,
  region: Region,
): number => {
  if (FLIGHT_OVERRIDES[slug]) return FLIGHT_OVERRIDES[slug];
  return region === "International" ? 38000 : 8500;
};
