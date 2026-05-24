import { useEffect } from "react";

/**
 * Sets document title, meta description, canonical URL, Open Graph and
 * Twitter Card tags for a page. Lightweight, no router-state coupling.
 */
export function useSeo({
  title,
  description,
  canonicalPath,
  ogImage,
}: {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
}) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", description);

    const setProp = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setProp("og:title", title);
    setProp("og:description", description);
    setProp("og:type", "website");
    setProp("og:url", `${window.location.origin}${canonicalPath ?? window.location.pathname}`);
    if (ogImage) setProp("og:image", ogImage);

    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setTwitter("twitter:title", title);
    setTwitter("twitter:description", description);
    if (ogImage) setTwitter("twitter:image", ogImage);

    const path = canonicalPath ?? window.location.pathname;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}${path}`);
  }, [title, description, canonicalPath, ogImage]);
}
