/**
 * Automated SEO sanity check.
 * Validates:
 *   - public/sitemap.xml exists, is well-formed, lists current routes
 *   - index.html has required JSON-LD blocks (parseable)
 *   - index.html has required Open Graph + Twitter Card tags
 *
 * Exits non-zero on failure so it can gate publish/build.
 * Usage: bunx tsx scripts/seo-check.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

type Result = { ok: boolean; label: string; detail?: string };
const results: Result[] = [];
const pass = (label: string, detail?: string) => results.push({ ok: true, label, detail });
const fail = (label: string, detail?: string) => results.push({ ok: false, label, detail });

const ROOT = resolve(process.cwd());
const SITEMAP = resolve(ROOT, "public/sitemap.xml");
const INDEX = resolve(ROOT, "index.html");

// ---------- Sitemap ----------
if (!existsSync(SITEMAP)) {
  fail("sitemap.xml exists", `Missing ${SITEMAP}`);
} else {
  const xml = readFileSync(SITEMAP, "utf8");
  if (!xml.startsWith("<?xml")) fail("sitemap.xml well-formed", "Missing XML declaration");
  else pass("sitemap.xml well-formed");

  if (!/<urlset[\s>]/.test(xml)) fail("sitemap.xml has <urlset>");
  else pass("sitemap.xml has <urlset>");

  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  if (locs.length === 0) fail("sitemap.xml has URLs");
  else pass("sitemap.xml has URLs", `${locs.length} entries`);

  const required = ["/", "/destinations", "/services", "/reviews", "/about", "/contact"];
  const missing = required.filter((p) => !locs.some((u) => u.endsWith(p) || (p === "/" && /\/$/.test(u))));
  if (missing.length) fail("sitemap.xml includes core routes", `Missing: ${missing.join(", ")}`);
  else pass("sitemap.xml includes core routes");

  const bad = locs.filter((u) => !/^https?:\/\//.test(u));
  if (bad.length) fail("sitemap.xml URLs are absolute", `${bad.length} relative URLs`);
  else pass("sitemap.xml URLs are absolute");

  const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
  if (dupes.length) fail("sitemap.xml has no duplicate URLs", `${dupes.length} duplicates`);
  else pass("sitemap.xml has no duplicate URLs");
}

// ---------- index.html ----------
if (!existsSync(INDEX)) {
  fail("index.html exists");
} else {
  const html = readFileSync(INDEX, "utf8");

  const hasMeta = (name: string, attr: "name" | "property" = "name") =>
    new RegExp(`<meta\\s+[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, "i").test(html) ||
    new RegExp(`<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${name}["']`, "i").test(html);

  // Title + description
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) fail("Page has <title>");
  else if (titleMatch[1].length > 60) fail("Title length ≤ 60 chars", `${titleMatch[1].length} chars`);
  else pass("Title present and ≤ 60 chars", `${titleMatch[1].length} chars`);

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (!descMatch) fail("Meta description present");
  else if (descMatch[1].length > 160) fail("Description ≤ 160 chars", `${descMatch[1].length} chars`);
  else pass("Meta description present", `${descMatch[1].length} chars`);

  // Open Graph
  const ogTags = ["og:title", "og:description", "og:type", "og:image", "og:site_name"];
  ogTags.forEach((t) => (hasMeta(t, "property") ? pass(`OG tag ${t}`) : fail(`OG tag ${t} missing`)));

  // Twitter
  const twTags = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  twTags.forEach((t) => (hasMeta(t) ? pass(`Twitter tag ${t}`) : fail(`Twitter tag ${t} missing`)));

  // JSON-LD
  const ldBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1].trim());

  if (ldBlocks.length === 0) fail("JSON-LD blocks present");
  else pass("JSON-LD blocks present", `${ldBlocks.length} block(s)`);

  let foundOrg = false;
  ldBlocks.forEach((block, i) => {
    try {
      const parsed = JSON.parse(block);
      pass(`JSON-LD block #${i + 1} is valid JSON`);
      const types = ([] as string[]).concat(parsed["@type"] ?? []);
      if (types.some((t) => /TravelAgency|LocalBusiness|Organization/.test(t))) foundOrg = true;
    } catch (e) {
      fail(`JSON-LD block #${i + 1} is valid JSON`, (e as Error).message);
    }
  });
  if (foundOrg) pass("JSON-LD has Organization/TravelAgency/LocalBusiness");
  else fail("JSON-LD has Organization/TravelAgency/LocalBusiness");

  // Canonical: per-route hook injects; sitewide should NOT pin to "/"
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (canonical && canonical[1].replace(/https?:\/\/[^/]+/, "") === "/") {
    fail("Sitewide canonical not pinned to /", canonical[1]);
  } else pass("Sitewide canonical OK (per-route or absent)");
}

// ---------- Report ----------
const failed = results.filter((r) => !r.ok);
const passed = results.filter((r) => r.ok);
console.log("\nSEO Sanity Check\n────────────────");
passed.forEach((r) => console.log(`  ✓ ${r.label}${r.detail ? ` — ${r.detail}` : ""}`));
failed.forEach((r) => console.log(`  ✗ ${r.label}${r.detail ? ` — ${r.detail}` : ""}`));
console.log(`\n${passed.length} passed, ${failed.length} failed`);

if (failed.length) {
  console.error("\nSEO check failed. Fix the issues above before publishing.\n");
  process.exit(1);
}
console.log("All SEO checks passed.\n");