import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { BRAND, waLink } from "@/lib/brand";
import ItineraryCard from "@/components/site/ItineraryCard";
import { destinations } from "@/data/destinations";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import {
  Check,
  X as XIcon,
  Download,
  Loader2,
  FileText,
  Plane,
  ScrollText,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ChevronsDownUp,
  ChevronsUpDown,
  Tag,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

type ParsedDay = { title: string; body: string; activities?: string[] };
type Parsed = {
  title?: string | null;
  starting_price?: string | null;
  overview: string | null;
  days: ParsedDay[];
  inclusions: string[];
  exclusions: string[];
  visa: string | null;
};

type Props = {
  itineraryId: string;
  title: string;
  pdfUrl: string;
  heroImage?: string;
  destinationName: string;
  destinationSlug?: string;
  isDomestic?: boolean;
  priceOverride?: string;
  onEnquire?: () => void;
  onDownload?: () => void;
};

type TermBlock = { h: string; icon: React.ComponentType<{ className?: string }>; points: string[] };
const TERMS: TermBlock[] = [
  {
    h: "Cancellation Policy",
    icon: FileText,
    points: [
      "30+ days before departure — non-refundable",
      "30–60 days before departure — 25% refund",
      "Beyond 60 days: 10% admin fee.",
    ],
  },
  {
    h: "Payment Terms",
    icon: Tag,
    points: [
      "25% advance at the time of booking",
      "Remaining balance due 30 days before departure",
      "All prices are per person on twin-sharing basis",
      "Payments accepted via UPI, bank transfer or credit card. International cards may attract a small surcharge",
    ],
  },
  {
    h: "Travel Insurance",
    icon: ShieldCheck,
    points: [
      "We strongly recommend purchasing comprehensive travel insurance covering trip cancellation, medical emergencies, and baggage loss. Insurance is not included in the package price.",
    ],
  },
  {
    h: "Important Notes",
    icon: Sparkles,
    points: [
      "Itinerary is subject to change due to weather or unforeseen circumstances",
      "Airfare is dynamic and subject to change until ticketed. Final pricing is locked at the time of issuance.",
      "Valid passport with 6+ months validity required for international trips",
      "Room allocation is subject to availability at the time of check-in",
      "Price Are Subject To Change. Please Confirm Final Price At The Time Of Booking / Advance Payment.",
    ],
  },
];

const Section = ({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <span className="inline-flex items-center gap-2">
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </span>
);

const NotProvided = ({ children = "Not Provided" }: { children?: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground font-light">
    {children}
  </div>
);

const ItineraryDetailView = ({
  itineraryId,
  title,
  pdfUrl,
  heroImage,
  destinationName,
  destinationSlug,
  isDomestic = false,
  priceOverride,
  onEnquire,
  onDownload,
}: Props) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const tabsBarRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const suppressObserverUntil = useRef<number>(0);
  const [similar, setSimilar] = useState<{ id: string; title: string; starting_price: string | null; duration: string | null }[]>([]);
  const { images: uploadedDestImages, loading: uploadedDestLoading } = useDestinationImages(destinationSlug ?? "");
  const { hidden: hiddenDestImages, loading: hiddenDestLoading } = useHiddenDefaultImages(destinationSlug);
  const similarImagesReady = !uploadedDestLoading && !hiddenDestLoading;

  const similarImagePool = useMemo(() => {
    const pool: string[] = [];
    uploadedDestImages.forEach((img) => {
      const url = adminPublicUrl(img.file_path);
      if (url && !pool.includes(url)) pool.push(url);
    });
    const dest = destinations.find((d) => d.slug === destinationSlug);
    (dest?.gallery ?? []).forEach((url) => {
      if (url && !hiddenDestImages.has(url) && !pool.includes(url)) pool.push(url);
    });
    if (dest?.image && !hiddenDestImages.has(dest.image) && !pool.includes(dest.image)) {
      pool.push(dest.image);
    }
    if (heroImage && !pool.includes(heroImage)) pool.push(heroImage);
    return pool;
  }, [uploadedDestImages, hiddenDestImages, destinationSlug, heroImage]);

  useEffect(() => {
    if (!destinationSlug) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("itineraries")
        .select("id,title,starting_price,duration")
        .eq("destination_slug", destinationSlug)
        .neq("id", itineraryId)
        .order("created_at", { ascending: false })
        .limit(6);
      if (!cancelled) setSimilar((data ?? []) as { id: string; title: string; starting_price: string | null; duration: string | null }[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [destinationSlug, itineraryId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      const { data, error: invokeErr } = await supabase.functions.invoke("parse-itinerary", {
        body: { itinerary_id: itineraryId },
      });
      if (cancelled) return;
      if (invokeErr || (data && data.error)) {
        setError(invokeErr?.message ?? data?.error ?? "Could not parse itinerary");
        setLoading(false);
        return;
      }
      setParsed(data.parsed as Parsed);
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [itineraryId]);

  const dayValues = useMemo(() => (parsed?.days ?? []).map((_, i) => `d-${i}`), [parsed]);
  const allOpen = dayValues.length > 0 && openDays.length === dayValues.length;

  useEffect(() => {
    // open first by default
    if (parsed?.days?.length) setOpenDays(["d-0"]);
  }, [parsed]);

  const onAccordionChange = (vals: string[]) => {
    if (isMobile) {
      // only one open at a time on mobile
      const next = vals.filter((v) => !openDays.includes(v));
      setOpenDays(next.length ? next : []);
    } else {
      setOpenDays(vals);
    }
  };

  const sections = useMemo(
    () =>
      [
        { id: "overview", label: "Overview", icon: Sparkles },
        { id: "days", label: "Day-by-Day", icon: CalendarDays },
        { id: "inclusions", label: "Inclusions", icon: ScrollText },
        { id: "terms", label: "Terms", icon: ShieldCheck },
        ...(!isDomestic ? [{ id: "visa", label: "Visa", icon: Plane }] : []),
      ] as const,
    [isDomestic],
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const headerOffset =
      (tabsBarRef.current?.getBoundingClientRect().height ?? 60) +
      (window.innerWidth >= 768 ? 80 : 64) +
      12;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    setActiveSection(id);
    suppressObserverUntil.current = Date.now() + 1400;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressObserverUntil.current) return;
        const triggerY =
          (tabsBarRef.current?.getBoundingClientRect().bottom ?? 120) + 20;
        let bestId: string | null = null;
        let bestDist = Number.POSITIVE_INFINITY;
        sections.forEach((s) => {
          const el = document.getElementById(`section-${s.id}`);
          if (!el) return;
          const top = el.getBoundingClientRect().top;
          const dist = triggerY - top;
          if (dist >= 0 && dist < bestDist) {
            bestDist = dist;
            bestId = s.id;
          }
        });
        if (bestId) setActiveSection(bestId);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading, sections]);

  // Keep the active tab pill in view inside the horizontally scrollable bar
  useEffect(() => {
    const bar = tabsBarRef.current;
    if (!bar) return;
    const btn = bar.querySelector<HTMLButtonElement>(`[data-section="${activeSection}"]`);
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeSection]);

  const schema = useMemo(() => {
    if (!parsed) return null;
    return {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: title,
      description: parsed.overview ?? `${title} itinerary by Jain Tours & Travels`,
      image: heroImage || undefined,
      touristType: "Travel package",
      additionalProperty: parsed.days.map((d, i) => ({
        "@type": "PropertyValue",
        name: `Day ${i + 1}`,
        value: d.title,
      })),
      isPartOf: {
        "@type": "TouristDestination",
        name: destinationName,
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "TravelAgency",
          name: "Jain Tours & Travels",
        },
      },
    };
  }, [parsed, title, destinationName, heroImage]);

  const displayTitle = parsed?.title?.trim() || title;

  return (
    <div className="flex flex-col bg-background w-full max-w-[1280px] mx-auto">
      {/* Hero */}
      <div className="px-3 md:px-6 pt-3 md:pt-6">
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[420px] overflow-hidden rounded-xl md:rounded-2xl">
          <img
            src={heroImage || "/placeholder.svg"}
            alt={`${destinationName} — ${displayTitle} tour package`}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <p className="text-[10px] md:text-xs uppercase tracking-luxe text-gold mb-1">
              {destinationName}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-white leading-tight max-w-3xl">
              {displayTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Structured data for SEO */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {/* Section nav (scroll to) */}
      <div
        ref={tabsBarRef}
        className="sticky top-16 md:top-20 z-20 bg-background/95 backdrop-blur border-y border-border/60 mt-4 md:mt-6"
      >
        <div className="px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4">
          <div className="flex-1 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex gap-1 md:gap-2">
              {sections.map((s) => {
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-section={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border transition ${
                      active
                        ? "bg-gold text-primary-foreground border-transparent shadow-sm"
                        : "border-transparent text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    <Section icon={s.icon} label={s.label} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onDownload?.()}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/80 hover:text-gold px-3 py-2 rounded-full border border-border/60 hover:border-gold/40 transition"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-12 w-full mx-auto space-y-10 md:space-y-14">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-gold mb-3" />
            <p className="text-sm font-light">Reading your itinerary…</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            Couldn't parse this PDF: {error}
          </div>
        ) : !parsed ? (
          <NotProvided />
        ) : (
          <>
            <section id="section-overview" aria-label="Trip overview" className="scroll-mt-40">
              <h2 className="text-xs uppercase tracking-luxe text-gold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Overview
              </h2>
              {parsed.overview ? (
                <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-luxe">
                  <p className="text-base md:text-lg leading-relaxed text-foreground font-semibold whitespace-pre-line">
                    {parsed.overview}
                  </p>
                </div>
              ) : (
                <NotProvided />
              )}
            </section>

            <div className="h-px bg-border/60" />

            <section id="section-days" aria-label="Day by day itinerary" className="scroll-mt-40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-luxe text-gold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Day-by-Day
                  {parsed.days?.length ? (
                    <span className="ml-2 text-foreground/60 normal-case tracking-normal">
                      · {parsed.days.length} day{parsed.days.length > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </h2>
                {parsed.days?.length ? (
                  <button
                    onClick={() => setOpenDays(allOpen ? [] : dayValues)}
                    className="inline-flex items-center gap-1.5 text-[11px] md:text-xs uppercase tracking-luxe text-gold hover:text-gold-deep transition"
                  >
                    {allOpen ? (
                      <>
                        <ChevronsDownUp className="w-3.5 h-3.5" /> Collapse all
                      </>
                    ) : (
                      <>
                        <ChevronsUpDown className="w-3.5 h-3.5" /> Expand all
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              {parsed.days?.length ? (
                <Accordion
                  type="multiple"
                  value={openDays}
                  onValueChange={onAccordionChange as (v: string[]) => void}
                  className="space-y-3"
                >
                  {parsed.days.map((d, i) => (
                    <AccordionItem
                      key={i}
                      value={`d-${i}`}
                      className="border border-border/60 rounded-2xl bg-card overflow-hidden hover:border-gold/40 hover:shadow-luxe transition-all"
                    >
                      <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline group">
                        <div className="flex items-center gap-3 md:gap-4 text-left flex-1 min-w-0">
                          <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold/10 text-gold text-xs md:text-sm font-medium border border-gold/20 group-hover:bg-gold group-hover:text-primary-foreground transition">
                            {i + 1}
                          </span>
                          <h3 className="font-serif text-base md:text-lg font-bold text-foreground break-words flex-1 min-w-0 text-left">
                            {d.title}
                          </h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 md:px-6 pb-5">
                        <div className="pl-0 md:pl-14 min-w-0 break-words">
                          {d.body && (
                            <p className="text-sm md:text-base text-foreground font-normal leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                              {d.body}
                            </p>
                          )}
                          {d.activities?.length ? (
                            <div className="mt-4">
                              <h4 className="text-[11px] uppercase tracking-luxe text-gold mb-2 font-bold">
                                Activities
                              </h4>
                              <ul className="space-y-1.5">
                                {d.activities.map((a, ai) => (
                                  <li key={ai} className="flex items-start gap-2 text-sm text-foreground font-normal break-words [overflow-wrap:anywhere]">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <NotProvided />
              )}
            </section>

            <div className="h-px bg-border/60" />

            <section id="section-inclusions" aria-label="Inclusions and exclusions" className="scroll-mt-40">
              <h2 className="text-xs uppercase tracking-luxe text-gold mb-4 flex items-center gap-2">
                <ScrollText className="w-4 h-4" /> Inclusions
              </h2>
              {parsed.inclusions?.length || parsed.exclusions?.length ? (
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-luxe">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold mb-4">
                      <Check className="w-4 h-4" aria-hidden /> Included
                    </h3>
                    {parsed.inclusions?.length ? (
                      <ul className="space-y-2.5">
                        {parsed.inclusions.map((itm, k) => (
                          <li key={k} className="flex items-start gap-2.5 text-sm text-foreground font-semibold">
                            <Check className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                            <span>{itm}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground font-medium">Not Provided</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-luxe">
                    <h3 className="flex items-center gap-2 text-xs uppercase tracking-luxe text-destructive mb-4">
                      <XIcon className="w-4 h-4" aria-hidden /> Not included
                    </h3>
                    {parsed.exclusions?.length ? (
                      <ul className="space-y-2.5">
                        {parsed.exclusions.map((itm, k) => (
                          <li key={k} className="flex items-start gap-2.5 text-sm text-foreground font-semibold">
                            <XIcon className="w-4 h-4 mt-0.5 text-destructive shrink-0" aria-hidden />
                            <span>{itm}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground font-medium">Not Provided</p>
                    )}
                  </div>
                </div>
              ) : (
                <NotProvided />
              )}
            </section>

            <div className="h-px bg-border/60" />

            <section id="section-terms" aria-label="Terms and conditions" className="scroll-mt-40">
              <article className="rounded-2xl border border-border/60 bg-card p-5 sm:p-7 md:p-8 shadow-luxe">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground mb-6 md:mb-8">
                  Terms &amp; Conditions
                </h2>
                <div className="space-y-6 md:space-y-7">
                  {TERMS.map((t, i) => {
                    const Icon = t.icon;
                    return (
                      <div key={i}>
                        <h3 className="flex items-center gap-2 font-semibold text-sm sm:text-base md:text-lg text-foreground mb-2 md:mb-3">
                          <Icon className="w-4 h-4 md:w-[18px] md:h-[18px] text-foreground/90 shrink-0" />
                          <span>{t.h}</span>
                        </h3>
                        {t.points.length === 1 ? (
                          <p className="text-sm md:text-[15px] text-foreground font-semibold leading-relaxed [overflow-wrap:anywhere]">
                            {t.points[0]}
                          </p>
                        ) : (
                          <ul className="space-y-1.5 md:space-y-2 pl-1">
                            {t.points.map((p, pi) => (
                              <li
                                key={pi}
                                className="flex items-start gap-2.5 text-sm md:text-[15px] text-foreground font-semibold leading-relaxed [overflow-wrap:anywhere]"
                              >
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            {!isDomestic && (
              <>
                <div className="h-px bg-border/60" />
                <section id="section-visa" aria-label="Visa information" className="scroll-mt-40">
                  <h2 className="text-xs uppercase tracking-luxe text-gold mb-4 flex items-center gap-2">
                    <Plane className="w-4 h-4" /> Visa
                  </h2>
                  <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-luxe">
                    {parsed.visa ? (
                      <p className="text-base leading-relaxed text-foreground font-semibold whitespace-pre-line">
                        {parsed.visa}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base text-foreground font-semibold">
                        Visa information will be shared by our travel expert.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* Need Help card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-7 shadow-luxe">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="font-serif text-xl md:text-2xl text-foreground">Need Help?</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold/40 text-gold text-[11px] uppercase tracking-luxe">
              24×7 Support
            </span>
          </div>
          <div className="space-y-3 mb-5">
            <a
              href={`tel:+${BRAND.phoneDigits}`}
              className="flex items-center gap-3 text-foreground/85 hover:text-gold transition"
            >
              <Phone className="w-4 h-4 text-foreground/60" />
              <span className="text-sm md:text-base">{BRAND.phone}</span>
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="flex items-center gap-3 text-foreground/85 hover:text-gold transition break-all"
            >
              <Mail className="w-4 h-4 text-foreground/60 shrink-0" />
              <span className="text-sm md:text-base">{BRAND.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={waLink(`Hello Jain Tours, I'd like help with ${displayTitle}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-sm md:text-base font-medium hover:opacity-90 transition shadow-sm"
            >
              <MessageCircle className="w-5 h-5" /> Enquire
            </a>
            <button
              type="button"
              onClick={() => onDownload?.()}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground text-sm font-medium hover:border-gold hover:text-gold transition"
              aria-label="Download itinerary PDF"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Similar tours */}
        {similar.length > 0 && destinationSlug && (
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-5">
              Similar Tours
            </h2>
            {(() => {
              const dest = destinations.find((d) => d.slug === destinationSlug);
              const locationLabel = (dest?.country ?? destinationName).toUpperCase();
              return (
                <div className="-mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  {similar.map((it, i) => (
                    <div key={it.id} className="shrink-0 w-[78%] sm:w-[60%] md:w-auto snap-start">
                      <ItineraryCard
                        id={it.id}
                        title={it.title}
                        image={similarImagesReady && similarImagePool.length ? similarImagePool[(i + 1) % similarImagePool.length] : undefined}
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
            })()}
          </div>
        )}
      </div>

      {/* Sticky bottom price + Enquire CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur px-3 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {(priceOverride || parsed?.starting_price) ? (
            <>
              <p className="text-[10px] md:text-xs uppercase tracking-luxe text-foreground/60">
                Starting from
              </p>
              <p className="font-serif text-lg md:text-2xl text-gold leading-tight truncate">
                {priceOverride || parsed?.starting_price}
                <span className="text-xs md:text-sm text-foreground/60 font-sans ml-1.5">
                  / per person
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs md:text-sm text-foreground/70">Best price on request</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <a
            href={waLink(`Hi Jain Tours, I'd like to enquire about ${displayTitle}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 md:px-7 py-3 rounded-full bg-[#25D366] text-white text-xs md:text-sm font-medium uppercase tracking-luxe hover:opacity-90 transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Enquire
          </a>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailView;