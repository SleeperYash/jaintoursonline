import { destinationKeywords } from "@/lib/seoKeywords";
import { useParams, Navigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import ItineraryViewer from "@/components/site/ItineraryViewer";
import JsonLd from "@/components/site/JsonLd";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { findDestination } from "@/data/destinations";
import { BLOG_POSTS } from "@/data/blogPosts";
import { useSeo } from "@/hooks/useSeo";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import { generateEstimatedPrice, formatINR } from "@/lib/estimatedPrice";
import { CalendarDays, Camera, ChevronLeft, ChevronRight, Globe2, MapPin, Sparkles, X } from "lucide-react";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import TravelAgencyLd from "@/components/site/schema/TravelAgencyLd";

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

  const [lightbox, setLightbox] = useState<number | null>(null);

  useSeo({
    title: d
      ? `${d.name} Tour Package from Mumbai | Jain Tours & Travels`
      : "Destination | Jain Tours",
    description: d
      ? `${d.overview} Book your ${d.name} tour package from Mumbai with Jain Tours & Travels — customized holidays, hotels, flights and visa assistance from a trusted travel agency in Goregaon West.`
      : "Curated destination by Jain Tours & Travels.",
    canonicalPath: `/destinations/${slug}`,
    ogImage: heroPhoto,
    ogType: "product",
    keywords: d ? destinationKeywords(d.slug, d.name, d.region) : undefined,
  });

  if (!d) return <Navigate to="/destinations" replace />;

  const startingPrice = generateEstimatedPrice(d.slug, d.region);

  const waMessage = encodeURIComponent(`Hi, I'm interested in the ${d.name} tour. Please share pricing.`);
  const waUrl = `https://wa.me/9821235678?text=${waMessage}`;

  return (
    <SiteLayout>
      <TravelAgencyLd id="ld-agency-destdetail" pagePath={`/destinations/${slug}`} />
      <JsonLd
        id="ld-destination"
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: `${d.name} Tour Package`,
          description: d.overview ?? `Curated ${d.name} tour by Jain Tours & Travels.`,
          image: photos.length ? photos.slice(0, 5) : undefined,
          touristType: d.region === "Domestic" ? "Domestic traveller" : "International traveller",
          provider: {
            "@type": "TravelAgency",
            name: "Jain Tours & Travels",
            url: "https://travelstest.lovable.app",
          },
          offers: {
            "@type": "Offer",
            price: startingPrice,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `https://travelstest.lovable.app/destinations/${slug}`,
          },
        }}
      />
      {/* Cinematic hero */}
      <section className="container pt-24 md:pt-32">
        <Breadcrumbs
          ldId="ld-breadcrumb-destdetail"
          className="mb-3"
          items={[
            { label: "Destinations", href: "/destinations" },
            { label: d.region, href: `/destinations?filter=${d.region.toLowerCase()}` },
            { label: d.name },
          ]}
        />
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-luxe text-foreground/60 hover:text-gold transition-colors mb-4 md:mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> All destinations
        </Link>

        <div className="relative rounded-[22px] overflow-hidden bg-card border border-border/50 shadow-luxe">
          <div className="relative min-h-[420px] md:min-h-[520px]">
            {heroPhoto ? (
              <img
                src={heroPhoto}
                alt={d.name}
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/25 md:bg-gradient-to-r md:from-ink/95 md:via-ink/70 md:to-ink/10"
              aria-hidden
            />

            <div className="relative grid lg:grid-cols-5 gap-8 p-6 md:p-10 lg:p-12 min-h-[420px] md:min-h-[520px] items-end lg:items-center">
              <div className="lg:col-span-3">
                <p className="text-[10px] md:text-xs tracking-luxe uppercase text-amber-200/90">
                  {d.region} · {d.country}
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-2">
                  {d.name}
                </h1>
                <p className="mt-2 font-serif italic text-lg md:text-2xl text-amber-200/90">{d.tagline}</p>
                <p className="mt-3 text-sm md:text-base text-white/75 font-light leading-relaxed max-w-xl line-clamp-2">
                  {d.overview}
                </p>

                <div className="mt-6 md:mt-8 flex flex-wrap gap-x-8 gap-y-4">
                  {[
                    { icon: CalendarDays, label: "Duration", value: d.duration },
                    { icon: Globe2, label: "Region", value: d.region },
                    { icon: MapPin, label: "Country", value: d.country },
                    { icon: Sparkles, label: "Highlight", value: d.highlights?.[0] ?? "Curated stays" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 w-8 h-8 rounded-full border border-amber-200/40 flex items-center justify-center">
                        <f.icon className="w-3.5 h-3.5 text-amber-200" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-luxe text-amber-200/80">{f.label}</span>
                        <span className="block text-xs md:text-sm text-white/90 truncate max-w-[150px]">{f.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enquiry / price card — inside hero on desktop only */}
              <aside className="hidden lg:block lg:col-span-2 w-full">{priceCard}</aside>
            </div>
          </div>
        </div>

        {/* Enquiry / price card — stacked below hero on mobile & tablet */}
        <div className="lg:hidden mt-5">{priceCard}</div>
      </section>

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="container py-12 md:py-20">
          <div className="flex items-end justify-between gap-4 mb-5 md:mb-7">
            <h2 className="text-xs md:text-sm uppercase tracking-luxe text-foreground/80">
              Explore {d.name}
              <span className="inline-block align-middle ml-3 h-px w-8 bg-gold" />
            </h2>
            <button
              onClick={() => setLightbox(0)}
              className="shrink-0 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxe text-foreground/70 hover:text-gold transition"
            >
              View all photos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className="-mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {photos.slice(0, 8).map((p, i) => {
              const isLast = i === 7 && photos.length > 8;
              return (
                <button
                  key={`${p}-${i}`}
                  onClick={() => setLightbox(i)}
                  className="group relative shrink-0 w-[70%] sm:w-[45%] md:w-auto snap-start rounded-xl overflow-hidden bg-muted aspect-[4/3]"
                >
                  <img
                    src={p}
                    alt={`${d.name} ${i + 1}`}
                    loading={i < 4 ? "eager" : "lazy"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {isLast && (
                    <span className="absolute inset-0 bg-ink/70 flex flex-col items-center justify-center gap-1.5 text-white">
                      <Camera className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-luxe">+{photos.length - 8} more</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <ItineraryViewer destinationSlug={d.slug} destinationName={d.name} fallbackImage={heroPhoto} />

      {/* Related travel guides */}
      {(() => {
        const relatedBlogs = BLOG_POSTS.filter((p) =>
          p.related?.destinations?.includes(d.slug),
        ).slice(0, 3);
        if (relatedBlogs.length === 0) return null;
        return (
          <section aria-labelledby="dest-blogs" className="container py-14 md:py-20 border-t border-border/40">
            <div className="flex items-end justify-between mb-7 gap-4">
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-luxe text-foreground/80">
                  Before you go
                  <span className="inline-block align-middle ml-3 h-px w-8 bg-gold" />
                </p>
                <h2 id="dest-blogs" className="font-serif text-2xl md:text-4xl text-foreground mt-2">
                  {d.name} travel guides
                </h2>
              </div>
              <Link to="/blog" className="shrink-0 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxe text-foreground/70 hover:text-gold transition">
                View all blogs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div
              className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {relatedBlogs.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group snap-start shrink-0 w-[260px] md:w-auto bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-gold/50 hover:shadow-luxe transition"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={p.cover} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-4 md:p-5">
                    <p className="text-[10px] uppercase tracking-luxe text-gold mb-1.5">{p.category}</p>
                    <p className="font-serif text-base md:text-lg text-foreground group-hover:text-gold transition-colors line-clamp-2">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

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
