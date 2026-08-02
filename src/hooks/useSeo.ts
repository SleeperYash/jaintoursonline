import { useEffect } from "react";

/** Canonical production origin. Never use window.location.origin — preview and
 *  Netlify deploy-preview hosts would emit duplicate/incorrect canonical URLs. */
export const SITE_ORIGIN = "https://jaintoursonline.com";

/** Only the production domain may be indexed. */
const isIndexableHost = () =>
  typeof window === "undefined" ||
  window.location.hostname === "jaintoursonline.com" ||
  window.location.hostname === "www.jaintoursonline.com";

/** Normalise a path: no query string, no hash, no trailing slash (except root). */
const cleanPath = (path: string) => {
  const p = (path || "/").split("?")[0].split("#")[0];
  if (p !== "/" && p.endsWith("/")) return p.slice(0, -1);
  return p || "/";
};

/**
 * Sets document title, meta description, canonical URL, Open Graph and
 * Twitter Card tags for a page. Lightweight, no router-state coupling.
 */
export function useSeo({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product" | "profile";
  noIndex?: boolean;
}) {
  useEffect(() => {
    document.title = title;

    // Remove duplicate metadata: keep the first node of each kind, drop the rest.
    const dedupe = (selector: string) => {
      const nodes = Array.from(document.head.querySelectorAll(selector));
      nodes.slice(1).forEach((n) => n.remove());
      return (nodes[0] as HTMLElement | undefined) ?? null;
    };

    const setMeta = (name: string, content: string) => {
      let el = dedupe(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", description);

    const path = cleanPath(canonicalPath ?? window.location.pathname);
    const canonicalUrl = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;

    setMeta("robots", noIndex || !isIndexableHost() ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("googlebot", noIndex || !isIndexableHost() ? "noindex, nofollow" : "index, follow");

    const setProp = (property: string, content: string) => {
      let el = dedupe(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setProp("og:title", title);
    setProp("og:description", description);
    setProp("og:type", ogType);
    setProp("og:site_name", "Jain Tours & Travels");
    setProp("og:locale", "en_IN");
    setProp("og:url", canonicalUrl);
    if (ogImage) setProp("og:image", ogImage);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:url", canonicalUrl);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Exactly one canonical link per page.
    let link = dedupe('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);
  }, [title, description, canonicalPath, ogImage, ogType, noIndex]);
}
