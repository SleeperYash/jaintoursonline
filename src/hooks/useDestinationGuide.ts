import { useEffect, useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type GuideDay = {
  day: number;
  location: string;
  description: string;
  activities: string[];
};
export type DestinationGuide = {
  stops: string[];
  bestMonths: number[];
  days: GuideDay[];
};

const cacheKey = (slug: string) => `jt_guide_${slug}_v1`;

export const useDestinationGuide = (
  slug: string,
  payload: { name: string; country: string; duration: string; highlights: string[] },
) => {
  const [guide, setGuide] = useState<DestinationGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !payload.name) return;
    let cancelled = false;

    // localStorage cache
    try {
      const raw = localStorage.getItem(cacheKey(slug));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.days?.length) {
          setGuide(parsed);
          return;
        }
      }
    } catch {}

    setLoading(true);
    setError(null);
    fetch(`${SUPABASE_URL}/functions/v1/destination-guide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error ?? `Failed (${r.status})`);
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const g: DestinationGuide = {
          stops: data.stops ?? [],
          bestMonths: data.bestMonths ?? [],
          days: data.days ?? [],
        };
        setGuide(g);
        try { localStorage.setItem(cacheKey(slug), JSON.stringify(g)); } catch {}
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return { guide, loading, error };
};
