import { useCallback, useEffect, useState } from "react";
import type { GlobeDestination } from "@/data/globeDestinations";

export function useGlobeRotation(items: GlobeDestination[]) {
  const [index, setIndex] = useState(0);

  const select = useCallback((i: number) => {
    if (!items.length) return;
    const next = ((i % items.length) + items.length) % items.length;
    setIndex(next);
  }, [items.length]);

  const next = useCallback(() => select(index + 1), [index, select]);
  const prev = useCallback(() => select(index - 1), [index, select]);
  const surprise = useCallback(() => {
    if (items.length < 2) return;
    let r = index;
    while (r === index) r = Math.floor(Math.random() * items.length);
    select(r);
  }, [index, items.length, select]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return { index, active: items[index], select, next, prev, surprise };
}
