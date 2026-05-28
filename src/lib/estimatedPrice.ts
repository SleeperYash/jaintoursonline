// Deterministic AI-style estimated starting price per destination.
// Produces stable, realistic INR pricing tuned to domestic/international
// market ranges. Values are cached per slug for visual consistency.

type Region = "Domestic" | "International";

// Manual overrides for marquee destinations (premium curated baselines).
const OVERRIDES: Record<string, number> = {
  andaman: 18999,
  "tamil-nadu": 12499,
  goa: 9999,
  kashmir: 24999,
  kerala: 16999,
  rajasthan: 14999,
  himachal: 13999,
  "leh-ladakh": 28999,
  spiti: 26999,
  uttarakhand: 12999,
  "char-dham": 17999,
  "north-east": 22999,
  "madhya-pradesh": 14499,
  gujarat: 11999,
  delhi: 8999,

  thailand: 32999,
  dubai: 44999,
  bali: 48999,
  vietnam: 42999,
  "singapore-malaysia": 56999,
  maldives: 89999,
  mauritius: 74999,
  "sri-lanka": 38999,
  bhutan: 36999,
  hongkong: 58999,
  georgia: 54999,
  japan: 119999,
  europe: 125999,
  australia: 124999,
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
    region === "International" ? [28999, 125999] : [8999, 35999];
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
