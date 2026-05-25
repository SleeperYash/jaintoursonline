import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import { slugify } from "@/lib/slug";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  parsed_data: { days?: { title: string }[] } | null;
};

const ItineraryViewer = ({
  destinationSlug,
  destinationName,
  fallbackImage,
}: {
  destinationSlug: string;
  destinationName: string;
  fallbackImage?: string;
}) => {
  const [items, setItems] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("itineraries")
        .select("id,title,file_path,file_size,parsed_data")
        .eq("destination_slug", destinationSlug)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        const list = (data ?? []) as Itinerary[];
        setItems(list);
        setLoading(false);
        // Lazy-parse any itineraries that don't yet have parsed_data
        // so day counts populate automatically after upload.
        const unparsed = list.filter((it) => !it.parsed_data);
        if (unparsed.length) {
          Promise.all(
            unparsed.map((it) =>
              supabase.functions
                .invoke("parse-itinerary", { body: { itinerary_id: it.id } })
                .then((res) => ({ id: it.id, parsed: res.data?.parsed ?? null }))
                .catch(() => ({ id: it.id, parsed: null })),
            ),
          ).then((results) => {
            if (cancelled) return;
            setItems((prev) =>
              prev.map((p) => {
                const r = results.find((x) => x.id === p.id);
                return r?.parsed ? { ...p, parsed_data: r.parsed } : p;
              }),
            );
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [destinationSlug]);

  return (
    <section className="bg-background border-t border-border/60 py-16 md:py-24">
      <div className="container">
        <div className="mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-luxe text-gold mb-3 md:mb-4">Sample itineraries</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-3">
            {destinationName} itineraries
          </h2>
          <p className="text-muted-foreground font-light max-w-xl">
            Curated journeys prepared by our travel desk. Tap any itinerary to view full details.
          </p>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
        ) : items.length === 0 ? (
          <div className="border border-dashed border-border/60 p-8 md:p-12 text-center rounded-md">
            <FileText className="w-8 h-8 text-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light">
              No sample itineraries uploaded for {destinationName} yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {items.map((it) => {
              const parsedDays = it.parsed_data?.days?.length ?? 0;
              const nightsMatch = it.title.match(/(\d+)\s*N(?:ights?)?\s*\/?\s*(\d+)?\s*D?/i);
              const nightsFromTitle = nightsMatch ? parseInt(nightsMatch[1], 10) : null;
              const daysFromTitle = nightsMatch && nightsMatch[2] ? parseInt(nightsMatch[2], 10) : nightsFromTitle ? nightsFromTitle + 1 : null;
              const daysCount = parsedDays || daysFromTitle;
              const nightsCount = nightsFromTitle ?? (daysCount ? daysCount - 1 : null);
              const pill = daysCount
                ? nightsCount
                  ? `${nightsCount}N / ${daysCount}D`
                  : `${daysCount} Day${daysCount > 1 ? "s" : ""}`
                : null;
              const subtitleMatch = it.title.match(/\d+\s*N\s+(.+)/i);
              const subtitle = subtitleMatch ? subtitleMatch[1].trim() : destinationName;
              return (
                <Link
                  key={it.id}
                  to={`/destinations/${destinationSlug}/${slugify(it.title)}`}
                  className="group text-left bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-gold/40 hover:shadow-luxe transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={fallbackImage ?? "/placeholder.svg"}
                      alt={it.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 md:p-5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base md:text-lg text-foreground leading-tight truncate">
                        {it.title}
                      </p>
                      <p className="text-xs md:text-sm text-foreground/60 mt-1 truncate">{subtitle}</p>
                    </div>
                    {pill && (
                      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md border border-gold/50 text-gold text-[11px] font-medium tracking-wide">
                        {pill}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ItineraryViewer;