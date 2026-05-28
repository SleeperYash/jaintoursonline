import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import ItineraryCard from "@/components/site/ItineraryCard";
import { destinations } from "@/data/destinations";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  parsed_data: { days?: { title: string }[] } | null;
  starting_price: string | null;
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
        .select("id,title,file_path,file_size,parsed_data,starting_price")
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
          (() => {
            const dest = destinations.find((d) => d.slug === destinationSlug);
            const locationLabel = (dest?.country ?? destinationName).toUpperCase();
            return (
              <div className="-mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {items.map((it, i) => (
                  <div key={it.id} className="shrink-0 w-[78%] sm:w-[60%] md:w-auto snap-start">
                    <ItineraryCard
                      id={it.id}
                      title={it.title}
                      image={fallbackImage}
                      destinationSlug={destinationSlug}
                      locationLabel={locationLabel}
                      index={i}
                      initialPrice={it.starting_price ?? undefined}
                    />
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </section>
  );
};

export default ItineraryViewer;