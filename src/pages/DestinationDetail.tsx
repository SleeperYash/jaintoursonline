import { useParams, Navigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import ItineraryViewer from "@/components/site/ItineraryViewer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { findDestination } from "@/data/destinations";
import { useSeo } from "@/hooks/useSeo";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import { generateEstimatedPrice, formatINR } from "@/lib/estimatedPrice";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

const PLACEHOLDER = "/placeholder.svg";

const DestinationDetail = () => {
  const { slug = "" } = useParams();
  const d = findDestination(slug);
  const { images, loading: uploadedLoading } = useDestinationImages(slug);
  const { hidden, loading: hiddenLoading } = useHiddenDefaultImages(slug);
  const imagesReady = !uploadedLoading && !hiddenLoading;

  // Build photo list once images + hidden filter have both resolved.
  // Never render an AI/default image that the admin has removed.
  const photos = useMemo(() => {
    if (!imagesReady || !d) return [];
    const list: string[] = [];
    images.forEach((i) => {
      const url = adminPublicUrl(i.file_path);
      if (url && !list.includes(url)) list.push(url);
    });
    if (list.length === 0) {
      if (d.image && !hidden.has(d.image)) list.push(d.image);
      (d.gallery ?? []).forEach((url) => {
        if (url && !hidden.has(url) && !list.includes(url)) list.push(url);
      });
    }
    return list;
  }, [imagesReady, images, hidden, d]);

  const heroPhoto = photos[0];
  const sidePhoto1 = photos[1] ?? photos[0];
  const sidePhoto2 = photos[2] ?? photos[1] ?? photos[0];

  const [lightbox, setLightbox] = useState<number | null>(null);

  useSeo({
    title: d ? `${d.name} Tour Package — Jain Tours & Travels` : "Destination | Jain Tours",
    description: d?.overview ?? "Curated destination by Jain Tours & Travels.",
    canonicalPath: `/destinations/${slug}`,
    ogImage: heroPhoto,
  });

  if (!d) return <Navigate to="/destinations" replace />;

  const startingPrice = generateEstimatedPrice(d.slug, d.region);

  const waMessage = encodeURIComponent(`Hi, I'm interested in the ${d.name} tour. Please share pricing.`);
  const waUrl = `https://wa.me/9821235678?text=${waMessage}`;

  return (
    <SiteLayout>
      {/* Photo grid */}
      <section className="container pt-24 md:pt-32">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors mb-3 md:mb-5"
        >
          <ChevronLeft className="w-4 h-4" /> All destinations
        </Link>

        <div className="grid grid-cols-3 gap-1.5 md:gap-3 rounded-2xl overflow-hidden">
          <button
            onClick={() => setLightbox(0)}
            className="relative col-span-2 group overflow-hidden bg-card aspect-[4/5] md:aspect-auto md:h-[480px]"
          >
            {heroPhoto ? (
              <img src={heroPhoto} alt={d.name} loading="eager" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-muted animate-pulse" />
            )}
          </button>
          <div className="grid grid-rows-2 gap-1.5 md:gap-3 aspect-[1/2] md:aspect-auto md:h-[480px]">
            <button onClick={() => setLightbox(1)} className="relative group overflow-hidden bg-card">
              {sidePhoto1 ? (
                <img src={sidePhoto1} alt={`${d.name} 2`} loading="eager" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-muted animate-pulse" />
              )}
            </button>
            <button onClick={() => setLightbox(2)} className="relative group overflow-hidden bg-card">
              {sidePhoto2 ? (
                <img src={sidePhoto2} alt={`${d.name} 3`} loading="eager" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-muted animate-pulse" />
              )}
              {photos.length > 3 && (
                <>
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/60 to-ink/30" aria-hidden />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-ink/85 backdrop-blur-sm border border-white/20 text-white text-[10px] md:text-xs uppercase tracking-luxe shadow-lg whitespace-nowrap">
                      <Camera className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      +{photos.length - 3} photos
                    </span>
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Header + sticky booking */}
      <section className="container py-6 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2">
            <p className="text-[10px] md:text-xs tracking-luxe uppercase text-gold mb-1.5">{d.region} · {d.country}</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">{d.name}</h1>
            <p className="mt-2 md:mt-3 text-sm md:text-lg text-foreground/70 font-light max-w-2xl">{d.tagline}</p>

            <p className="mt-5 md:mt-8 text-sm md:text-base text-foreground/80 font-light leading-relaxed max-w-2xl">{d.overview}</p>
          </div>

          {/* Sticky booking */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <div className="bg-card border border-gold/30 rounded-2xl p-6 shadow-luxe">
                <p className="text-xs uppercase tracking-luxe text-foreground/60">Starting from</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-emerald-600 dark:text-emerald-400">{formatINR(startingPrice)}/-</span>
                  <span className="text-xs text-foreground/60">/ person</span>
                </div>
                <p className="mt-1 text-xs text-foreground/60">twin sharing</p>

                <Link
                  to="/contact"
                  className="mt-5 w-full inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-sm uppercase tracking-luxe text-foreground hover:border-gold/40 transition"
                >
                  Customise enquiry
                </Link>

                <ul className="mt-6 space-y-2 text-xs text-foreground/70">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Free cancellation up to 30 days</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> 24×7 concierge support</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Best price guarantee</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ItineraryViewer destinationSlug={d.slug} destinationName={d.name} fallbackImage={heroPhoto} />

      {/* Lightbox */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-ink border-border/40 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <p className="text-xs uppercase tracking-luxe text-primary-foreground/80">
              {(lightbox ?? 0) + 1} / {photos.length}
            </p>
            <button
              onClick={() => setLightbox(null)}
              className="p-2 text-primary-foreground/80 hover:text-primary-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center bg-ink overflow-hidden">
            {lightbox !== null && (
              <img
                src={photos[lightbox]}
                alt={`${d.name} ${lightbox + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setLightbox((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/80 hover:bg-card text-foreground"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLightbox((i) => (i === null ? 0 : (i + 1) % photos.length))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/80 hover:bg-card text-foreground"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3 border-t border-border/40">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className={`shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition ${
                    i === lightbox ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
};

export default DestinationDetail;
