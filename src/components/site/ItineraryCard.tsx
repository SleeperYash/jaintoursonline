import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";

const ACCENTS = [
  { bar: "bg-sky-500", pill: "bg-sky-500" },
  { bar: "bg-violet-500", pill: "bg-violet-500" },
  { bar: "bg-emerald-500", pill: "bg-emerald-500" },
  { bar: "bg-rose-500", pill: "bg-rose-500" },
  { bar: "bg-amber-500", pill: "bg-amber-500" },
  { bar: "bg-fuchsia-500", pill: "bg-fuchsia-500" },
];

type Props = {
  id: string;
  title: string;
  image?: string;
  destinationSlug: string;
  locationLabel: string;
  index?: number;
  initialPrice?: string | null;
};

const ItineraryCard = ({
  id,
  title,
  image,
  destinationSlug,
  locationLabel,
  index = 0,
  initialPrice = null,
}: Props) => {
  const accent = ACCENTS[index % ACCENTS.length];
  const [price, setPrice] = useState<string | null>(initialPrice);
  const [loadingPrice, setLoadingPrice] = useState(!initialPrice);

  useEffect(() => {
    if (initialPrice) {
      setPrice(initialPrice);
      setLoadingPrice(false);
      return;
    }
    let cancelled = false;
    setLoadingPrice(true);
    supabase.functions
      .invoke("parse-itinerary", { body: { itinerary_id: id } })
      .then((res) => {
        if (cancelled) return;
        const p = res.data?.parsed?.starting_price ?? null;
        setPrice(p);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPrice(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, initialPrice]);

  // Duration parse from title e.g. "Amazing Dubai 03N / 04D"
  const m = title.match(/(\d+)\s*N(?:ights?)?\s*\/?\s*(\d+)?\s*D?/i);
  const nights = m ? parseInt(m[1], 10) : null;
  const days = m && m[2] ? parseInt(m[2], 10) : nights ? nights + 1 : null;
  const duration =
    nights && days
      ? `${nights} Night${nights > 1 ? "s" : ""} · ${days} Day${days > 1 ? "s" : ""}`
      : days
        ? `${days} Day${days > 1 ? "s" : ""}`
        : null;

  const cleanTitle = title.replace(/\s*\d+\s*N(?:ights?)?\s*\/?\s*\d*\s*D?\s*$/i, "").trim() || title;

  return (
    <Link
      to={`/destinations/${destinationSlug}/${slugify(title)}`}
      className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-foreground/30 transition-colors"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={cleanTitle}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${accent.bar}`} />
      </div>
      <div className="p-4 md:p-5">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-foreground/55 font-medium">
          {locationLabel}
        </p>
        <h3 className="font-serif text-lg md:text-xl text-foreground mt-1.5 leading-snug line-clamp-2">
          {cleanTitle}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs md:text-sm text-foreground/60">
            {duration ?? "Custom duration"}
          </span>
          <span
            className={`inline-flex items-center justify-center min-w-[72px] px-3 py-1.5 rounded-full text-white text-xs md:text-sm font-semibold ${accent.pill} transition-opacity duration-500 ${
              loadingPrice ? "opacity-60" : "opacity-100"
            }`}
          >
            {loadingPrice ? "···" : price ?? "On request"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItineraryCard;