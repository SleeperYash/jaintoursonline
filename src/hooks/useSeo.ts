import { useEffect } from "react";

/**
 * Sets document title, meta description and canonical URL for a page.
 * Lightweight, no router-state coupling.
 */
export function useSeo({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description: string;
  canonicalPath?: string;
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

    const path = canonicalPath ?? window.location.pathname;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}${path}`);
  }, [title, description, canonicalPath]);
}
