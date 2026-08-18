import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import ItineraryCard from "@/components/site/ItineraryCard";
import { destinations, findDestination } from "@/data/destinations";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  parsed_data: { days?: { title: string }[] } | null;
  starting_price: string | null;
  duration: string | null;
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
  const { images: uploaded, loading: uploadedLoading } = useDestinationImages(destinationSlug);
  const { hidden, loading: hiddenLoading } = useHiddenDefaultImages(destinationSlug);
  const imagesReady = !uploadedLoading && !hiddenLoading;

  const imagePool = useMemo(() => {
    const pool: string[] = [];
    // Prefer user-uploaded destination photos first
    uploaded.forEach((img) => {
      const url = adminPublicUrl(img.file_path);
      if (url && !pool.includes(url)) pool.push(url);
    });
    // Then fall back to the destination's default gallery (minus hidden ones)
    const dest = findDestination(destinationSlug);
    (dest?.gallery ?? []).forEach((url) => {
      if (url && !hidden.has(url) && !pool.includes(url)) pool.push(url);
    });
    if (dest?.image && !hidden.has(dest.image) && !pool.includes(dest.image)) {
      pool.push(dest.image);
    }
    if (fallbackImage && !pool.includes(fallbackImage)) pool.push(fallbackImage);
    return pool;
  }, [uploaded, hidden, destinationSlug, fallbackImage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("itineraries")
        .select("id,title,file_path,file_size,parsed_data,starting_price,duration")
        .eq("destination_slug", destinationSlug)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        const list = (data ?? []) as Itinerary[];
        setItems(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [destinationSlug]);

  return (
    <section className="bg-background border-t border-border/40 py-10 md:py-24 overflow-x-clip">
      <div className="container">
        <div className="mb-6 md:mb-12">
          <p className="text-[10px] md:text-xs uppercase tracking-luxe text-foreground/80">
            Sample itineraries
            <span className="inline-block align-middle ml-3 h-px w-8 bg-gold" />
          </p>
          <h2 className="font-serif text-2xl md:text-5xl text-foreground mt-2 md:mt-3">
            {destinationName} itineraries
          </h2>
          <p className="mt-2 md:mt-3 text-muted-foreground font-light max-w-xl text-sm md:text-base">
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
              <div className="-mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {items.map((it, i) => (
                  <div key={it.id} className="shrink-0 w-[calc(100vw-3.5rem)] max-w-[340px] sm:w-[60%] md:w-auto md:max-w-none snap-center md:snap-start flex">
                    <ItineraryCard
                      id={it.id}
                      title={it.title}
                      image={imagesReady && imagePool.length ? imagePool[i % imagePool.length] : undefined}
                      destinationSlug={destinationSlug}
                      locationLabel={locationLabel}
                      index={i}
                      initialPrice={it.starting_price ?? undefined}
                      durationOverride={it.duration ?? undefined}
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