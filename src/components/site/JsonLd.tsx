import { useEffect } from "react";

/** Injects a JSON-LD <script> into document.head, keyed by id. */
export const JsonLd = ({ id, data }: { id: string; data: Record<string, unknown> }) => {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.text = JSON.stringify(data);
    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, [id, data]);
  return null;
};

export default JsonLd;