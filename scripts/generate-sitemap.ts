// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const DESTINATION_SLUGS = [
  "andaman","tamil-nadu","goa","gujarat","kerala","kashmir","leh-ladakh",
  "madhya-pradesh","north-east","himachal","rajasthan","uttarakhand",
  "char-dham","delhi","europe","georgia","hongkong","japan","mauritius",
  "australia","dubai","thailand","singapore-malaysia","bali","vietnam",
  "maldives","bhutan","sri-lanka","nepal","united-kingdom",
];

const BASE_URL = "https://jaintoursonline.lovable.app";
const SUPABASE_URL = "https://tddtcsdbqrlabbqqotqd.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZHRjc2RicXJsYWJicXFvdHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTcwNDMsImV4cCI6MjA5NDM5MzA0M30.WsKd0iLhSym3nOSy5wFnAfyOmM6Sd0z1RGmfAj7JnX8";

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/destinations", changefreq: "weekly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/reviews", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

async function fetchItineraries(): Promise<{ title: string; destination_slug: string }[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/itineraries?select=title,destination_slug`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function render(entries: Entry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries: Entry[] = [...staticEntries];

  for (const slug of DESTINATION_SLUGS) {
    entries.push({ path: `/destinations/${slug}`, priority: "0.7" });
  }

  const itineraries = await fetchItineraries();
  for (const it of itineraries) {
    if (!it.destination_slug || !it.title) continue;
    entries.push({
      path: `/destinations/${it.destination_slug}/${slugify(it.title)}`,
      priority: "0.6",
    });
  }

  writeFileSync(resolve("public/sitemap.xml"), render(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();