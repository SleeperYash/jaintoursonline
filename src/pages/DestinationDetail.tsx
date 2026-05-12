import { useParams, Navigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import ItineraryViewer from "@/components/site/ItineraryViewer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { findDestination } from "@/data/destinations";
import { useSeo } from "@/hooks/useSeo";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import { useDestinationGuide } from "@/hooks/useDestinationGuide";
import {
  Star, Clock, Users, Sun, ArrowRight, MapPin, Loader2,
  Plane, Hotel, Coffee, Car, Map, Camera, ChevronLeft, ChevronRight, X,
} from "lucide-react";

const PLACEHOLDER = "/placeholder.svg";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const INCLUDED = [
  { icon: Plane, label: "Return flights" },
  { icon: Hotel, label: "Hotels" },
  { icon: Coffee, label: "Daily breakfast" },
  { icon: Car, label: "Private transfers" },
  { icon: Map, label: "Sightseeing" },
  { icon: Camera, label: "Visa & insurance" },
];
const NOT_INCLUDED = ["Lunch & dinner", "Personal expenses", "Tips & gratuities", "Optional activities", "Travel insurance upgrade"];

const DUMMY_PRICE = 89999;

const DestinationDetail = () => {
  const { slug = "" } = useParams();
  const d = findDestination(slug);
  const { images, coverUrl } = useDestinationImages(slug);

  // Build photo list: prefer uploaded images; fall back to default + gallery
  const photos = useMemo(() => {
    if (images.length > 0) return images.map((i) => adminPublicUrl(i.file_path));
    if (!d) return [];
    return [d.image, ...(d.gallery ?? [])].filter(Boolean);
  }, [images, d]);

  const heroPhoto = coverUrl ?? d?.image ?? PLACEHOLDER;
  const sidePhoto1 = photos[1] ?? photos[0] ?? PLACEHOLDER;
  const sidePhoto2 = photos[2] ?? photos[1] ?? photos[0] ?? PLACEHOLDER;

  const { guide, loading: guideLoading } = useDestinationGuide(slug, {
    name: d?.name ?? "",
    country: d?.country ?? "",
    duration: d?.duration ?? "",
    highlights: d?.highlights ?? [],
  });

  const [lightbox, setLightbox] = useState<number | null>(null);

  useSeo({
    title: d ? `${d.name} Tour Package — Jain Tours & Travels` : "Destination | Jain Tours",
    description: d?.overview ?? "Curated destination by Jain Tours & Travels.",
    canonicalPath: `/destinations/${slug}`,
  });

  if (!d) return <Navigate to="/destinations" replace />;

  const stops = guide?.stops?.length ? guide.stops : d.highlights.slice(0, 5);
  const bestMonths = new Set(guide?.bestMonths ?? []);
  const bestSeasonLabel = bestMonths.size
    ? Array.from(bestMonths).sort((a, b) => a - b).slice(0, 3).map((m) => MONTHS[m - 1]).join(" – ")
    : "All year";

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
            <img src={heroPhoto} alt={d.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </button>
          <div className="grid grid-rows-2 gap-1.5 md:gap-3 aspect-[1/2] md:aspect-auto md:h-[480px]">
            <button onClick={() => setLightbox(1)} className="relative group overflow-hidden bg-card">
              <img src={sidePhoto1} alt={`${d.name} 2`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </button>
            <button onClick={() => setLightbox(2)} className="relative group overflow-hidden bg-card">
              <img src={sidePhoto2} alt={`${d.name} 3`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {photos.length > 3 && (
                <span className="absolute inset-0 bg-ink/60 flex items-center justify-center text-primary-foreground text-[9px] md:text-xs uppercase tracking-luxe text-center px-2 leading-tight">
                  + View all<br className="md:hidden" /> {photos.length} photos
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Header + sticky booking */}
      <section className="container py-10 md:py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <p className="text-xs tracking-luxe uppercase text-gold mb-2">{d.region} · {d.country}</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">{d.name}</h1>
            <p className="mt-3 text-base md:text-lg text-foreground/70 font-light max-w-2xl">{d.tagline}</p>

            <div className="mt-4 flex items-center gap-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              <span className="text-sm text-foreground/70 ml-1">4.9 · 142 reviews</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs uppercase tracking-luxe text-foreground/80">
                <Clock className="w-3.5 h-3.5 text-gold" /> {d.duration}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs uppercase tracking-luxe text-foreground/80">
                <Users className="w-3.5 h-3.5 text-gold" /> Group / Private
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs uppercase tracking-luxe text-foreground/80">
                <Sun className="w-3.5 h-3.5 text-gold" /> Best: {bestSeasonLabel}
              </span>
            </div>

            <p className="mt-8 text-foreground/80 font-light leading-relaxed max-w-2xl">{d.overview}</p>

            {/* Route strip */}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-luxe text-gold mb-3">Your route</p>
              <div className="flex flex-wrap items-center gap-2">
                {stops.map((s, i) => (
                  <div key={`${s}-${i}`} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-gold/30 text-sm text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-gold" /> {s}
                    </span>
                    {i < stops.length - 1 && <ArrowRight className="w-4 h-4 text-gold/60" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Day-by-day */}
            <div className="mt-12">
              <p className="text-xs uppercase tracking-luxe text-gold mb-3">Day-by-day itinerary</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8">Your journey, day by day</h2>

              {guideLoading && !guide && (
                <div className="flex items-center gap-3 text-foreground/60 py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                  Crafting your itinerary…
                </div>
              )}

              {guide?.days?.length ? (
                <div className="relative pl-8 md:pl-10 space-y-6">
                  <span className="absolute left-[15px] md:left-[19px] top-2 bottom-2 w-px bg-gold/30" aria-hidden />
                  {guide.days.map((day) => (
                    <div key={day.day} className="relative">
                      <span className="absolute -left-8 md:-left-10 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold text-primary-foreground flex items-center justify-center text-xs font-semibold border-4 border-background shadow-md">
                        {day.day}
                      </span>
                      <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 hover:border-gold/40 transition-colors">
                        <p className="text-xs uppercase tracking-luxe text-gold mb-1">Day {day.day}</p>
                        <h3 className="font-serif text-xl md:text-2xl text-foreground mb-2">{day.location}</h3>
                        <p className="text-sm text-foreground/75 leading-relaxed">{day.description}</p>
                        {day.activities?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {day.activities.map((a, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gold/10 text-foreground/85 border border-gold/20">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !guideLoading ? (
                <p className="text-sm text-foreground/60">Itinerary will be generated when available.</p>
              ) : null}
            </div>

            {/* Best time to visit */}
            <div className="mt-14">
              <p className="text-xs uppercase tracking-luxe text-gold mb-3">Best time to visit</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">When to go</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {MONTHS.map((m, i) => {
                  const isBest = bestMonths.has(i + 1);
                  return (
                    <div
                      key={m}
                      className={`text-center py-3 rounded-lg border text-xs uppercase tracking-luxe transition-all ${
                        isBest
                          ? "bg-emerald-deep/15 border-emerald-deep text-emerald-deep font-semibold"
                          : "bg-card border-border/60 text-foreground/50"
                      }`}
                    >
                      {m}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-foreground/60">Months in green are recommended for travel.</p>
            </div>

            {/* What's included */}
            <div className="mt-14">
              <p className="text-xs uppercase tracking-luxe text-gold mb-3">What's included</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">In your package</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INCLUDED.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3 hover:border-gold/40 transition-colors">
                      <span className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gold" />
                      </span>
                      <span className="text-sm text-foreground font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 text-xs uppercase tracking-luxe text-foreground/60 mb-3">Not included</p>
              <div className="flex flex-wrap gap-2">
                {NOT_INCLUDED.map((n) => (
                  <span key={n} className="text-xs px-3 py-1.5 rounded-full border border-dashed border-border text-foreground/65">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky booking */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <div className="bg-card border border-gold/30 rounded-2xl p-6 shadow-luxe">
                <p className="text-xs uppercase tracking-luxe text-foreground/60">Starting from</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-foreground">₹{DUMMY_PRICE.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-foreground/60">/ person</span>
                </div>
                <p className="mt-1 text-xs text-foreground/60">{d.duration} · twin sharing</p>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold text-primary-foreground text-sm uppercase tracking-luxe hover:bg-gold/90 transition shadow-md"
                >
                  Book this tour
                </a>

                <Link
                  to="/contact"
                  className="mt-3 w-full inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-sm uppercase tracking-luxe text-foreground hover:border-gold/40 transition"
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

      <ItineraryViewer destinationSlug={d.slug} destinationName={d.name} />

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
