import { destinations, findDestination } from "./destinations";

export type GlobeDestination = {
  slug: string;
  name: string;
  country: string;
  region: "Domestic" | "International";
  lat: number;
  lng: number;
  duration: string;
  tagline: string;
  image: string;
};

// Approximate lat/lng for each destination (decimal degrees)
const COORDS: Record<string, { lat: number; lng: number }> = {
  "kashmir": { lat: 34.08, lng: 74.79 },
  "leh-ladakh": { lat: 34.16, lng: 77.58 },
  "rajasthan": { lat: 26.91, lng: 75.78 },
  "kerala": { lat: 9.93, lng: 76.27 },
  "goa": { lat: 15.30, lng: 74.12 },
  "andaman": { lat: 11.74, lng: 92.65 },
  "himachal": { lat: 32.24, lng: 77.19 },
  "uttarakhand": { lat: 30.07, lng: 79.01 },
  "north-east": { lat: 26.20, lng: 92.93 },
  "tamil-nadu": { lat: 11.12, lng: 78.65 },
  "nepal": { lat: 27.7172, lng: 85.3240 },
  "gujarat": { lat: 23.02, lng: 72.57 },
  "madhya-pradesh": { lat: 23.25, lng: 77.41 },
  "char-dham": { lat: 30.73, lng: 79.06 },

  "maldives": { lat: 3.20, lng: 73.22 },
  "sri-lanka": { lat: 7.87, lng: 80.77 },
  "bali": { lat: -8.34, lng: 115.09 },
  "thailand": { lat: 13.75, lng: 100.50 },
  "singapore": { lat: 1.35, lng: 103.82 },
  "dubai": { lat: 25.20, lng: 55.27 },
  "europe": { lat: 46.20, lng: 6.14 },
  "japan": { lat: 35.68, lng: 139.69 },
  "vietnam": { lat: 14.06, lng: 108.28 },
  "bhutan": { lat: 27.51, lng: 90.43 },
  "egypt": { lat: 26.82, lng: 30.80 },
  "mauritius": { lat: -20.35, lng: 57.55 },
  "georgia": { lat: 42.32, lng: 43.36 },
  "hongkong": { lat: 22.32, lng: 114.17 },
};

// Curated headline list — order matters for the strip
const FEATURED_SLUGS = [
  "kashmir",
  "rajasthan",
  "kerala",
  "leh-ladakh",
  "goa",
  "maldives",
  "bali",
  "dubai",
  "georgia",
  "japan",
  "thailand",
  "hongkong",
];

export const globeDestinations: GlobeDestination[] = FEATURED_SLUGS
  .map((slug) => {
    const d = findDestination(slug);
    const c = COORDS[slug];
    if (!d || !c) return null;
    return {
      slug: d.slug,
      name: d.name,
      country: d.country,
      region: d.region,
      lat: c.lat,
      lng: c.lng,
      duration: d.duration,
      tagline: d.tagline,
      image: d.image,
    } as GlobeDestination;
  })
  .filter(Boolean) as GlobeDestination[];

// Format coordinate as 08°24'S · 115°11'E
export const formatCoord = (lat: number, lng: number) => {
  const fmt = (v: number, pos: string, neg: string) => {
    const abs = Math.abs(v);
    const deg = Math.floor(abs);
    const min = Math.floor((abs - deg) * 60);
    return `${String(deg).padStart(2, "0")}°${String(min).padStart(2, "0")}'${v >= 0 ? pos : neg}`;
  };
  return `${fmt(lat, "N", "S")} · ${fmt(lng, "E", "W")}`;
};
