import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Check,
  X as XIcon,
  Download,
  Share2,
  Loader2,
  FileText,
  Plane,
  ScrollText,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

type ParsedDay = { title: string; body: string; activities?: string[] };
type Parsed = {
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
  onEnquire?: () => void;
  onDownload?: () => void;
};

const TERMS = [
  {
    h: "Cancellation policy",
    b: "Cancellations within 30 days of departure are non-refundable. 30–60 days: 50% retention. Beyond 60 days: 10% admin fee.",
  },
  {
    h: "Booking policy",
    b: "A 25% non-refundable advance confirms your booking. Balance due 30 days prior to departure.",
  },
  {
    h: "Payment terms",
    b: "Payments accepted via UPI, bank transfer or credit card. International cards may attract a small surcharge.",
  },
  {
    h: "Hotel availability",
    b: "Listed hotels are subject to availability at the time of confirmation. Equivalent properties of the same category will be offered if needed.",
  },
  {
    h: "Flight fare",
    b: "Airfare is dynamic and subject to change until ticketed. Final pricing is locked at the time of issuance.",
  },
  {
    h: "Force majeure",
    b: "We are not liable for delays or changes caused by weather, political unrest, strikes, pandemics or other events beyond our control.",
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

  const share = async () => {
    const url = pdfUrl;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Itinerary link is on your clipboard." });
    } catch {
      toast({ title: "Couldn't share", variant: "destructive" });
    }
  };

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

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Hero */}
      <div className="relative w-full h-44 sm:h-56 md:h-72 shrink-0 overflow-hidden">
        <img
          src={heroImage || "/placeholder.svg"}
          alt={`${destinationName} — ${title} tour package`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <p className="text-[10px] md:text-xs uppercase tracking-luxe text-gold mb-1">
            {destinationName}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-white leading-tight max-w-3xl">
            {title}
          </h2>
        </div>
      </div>

      {/* Structured data for SEO */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <div
          ref={tabsBarRef}
          className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/60"
        >
          <div className="px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4">
            <div className="flex-1 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="bg-transparent p-0 h-auto inline-flex gap-1 md:gap-2">
                <TabsTrigger
                  value="overview"
                  className="shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border border-transparent data-[state=active]:bg-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted"
                >
                  <Section icon={Sparkles} label="Overview" />
                </TabsTrigger>
                <TabsTrigger
                  value="days"
                  className="shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border border-transparent data-[state=active]:bg-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted"
                >
                  <Section icon={CalendarDays} label="Day-by-Day" />
                </TabsTrigger>
                <TabsTrigger
                  value="inclusions"
                  className="shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border border-transparent data-[state=active]:bg-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted"
                >
                  <Section icon={ScrollText} label="Inclusions" />
                </TabsTrigger>
                <TabsTrigger
                  value="terms"
                  className="shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border border-transparent data-[state=active]:bg-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted"
                >
                  <Section icon={ShieldCheck} label="Terms" />
                </TabsTrigger>
                <TabsTrigger
                  value="visa"
                  className="shrink-0 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm border border-transparent data-[state=active]:bg-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted"
                >
                  <Section icon={Plane} label="Visa" />
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onDownload?.()}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/80 hover:text-gold px-3 py-2 rounded-full border border-border/60 hover:border-gold/40 transition"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={share}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/80 hover:text-gold px-3 py-2 rounded-full border border-border/60 hover:border-gold/40 transition"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-12 max-w-4xl w-full mx-auto">
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
              <TabsContent value="overview" className="animate-fade-in mt-0">
                {parsed.overview ? (
                  <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-luxe hover:shadow-gold/10 transition-shadow">
                    <p className="text-xs uppercase tracking-luxe text-gold mb-3">Trip overview</p>
                    <p className="text-base md:text-lg leading-relaxed text-foreground/85 font-light whitespace-pre-line">
                      {parsed.overview}
                    </p>
                  </div>
                ) : (
                  <NotProvided />
                )}
              </TabsContent>

              <TabsContent value="days" className="animate-fade-in mt-0">
                {parsed.days?.length ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs uppercase tracking-luxe text-foreground/60">
                        {parsed.days.length} day{parsed.days.length > 1 ? "s" : ""}
                      </p>
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
                    </div>
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
                              <span className="font-serif text-base md:text-lg text-foreground truncate">
                                {d.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 md:px-6 pb-5">
                            <div className="pl-0 md:pl-14">
                              {d.body && (
                                <p className="text-sm md:text-base text-foreground/80 font-light leading-relaxed whitespace-pre-line">
                                  {d.body}
                                </p>
                              )}
                              {d.activities?.length ? (
                                <div className="mt-4">
                                  <p className="text-[11px] uppercase tracking-luxe text-gold mb-2">
                                    Activities
                                  </p>
                                  <ul className="space-y-1.5">
                                    {d.activities.map((a, ai) => (
                                      <li key={ai} className="flex items-start gap-2 text-sm text-foreground/80 font-light">
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
                  </>
                ) : (
                  <NotProvided />
                )}
              </TabsContent>

              <TabsContent value="inclusions" className="animate-fade-in mt-0">
                {parsed.inclusions?.length || parsed.exclusions?.length ? (
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-luxe">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold mb-4">
                        <Check className="w-4 h-4" /> Included
                      </p>
                      {parsed.inclusions?.length ? (
                        <ul className="space-y-2.5">
                          {parsed.inclusions.map((i, k) => (
                            <li key={k} className="flex items-start gap-2.5 text-sm text-foreground/85 font-light">
                              <Check className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                              <span>{i}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground font-light">Not Provided</p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-luxe">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-luxe text-destructive mb-4">
                        <XIcon className="w-4 h-4" /> Not included
                      </p>
                      {parsed.exclusions?.length ? (
                        <ul className="space-y-2.5">
                          {parsed.exclusions.map((i, k) => (
                            <li key={k} className="flex items-start gap-2.5 text-sm text-foreground/85 font-light">
                              <XIcon className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                              <span>{i}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground font-light">Not Provided</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <NotProvided />
                )}
              </TabsContent>

              <TabsContent value="terms" className="animate-fade-in mt-0">
                <div className="space-y-3">
                  {TERMS.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-luxe hover:border-gold/30 transition"
                    >
                      <p className="font-serif text-base md:text-lg text-foreground mb-1.5">{t.h}</p>
                      <p className="text-sm text-foreground/75 font-light leading-relaxed">{t.b}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="visa" className="animate-fade-in mt-0">
                <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-luxe">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold mb-3">
                    <Plane className="w-4 h-4" /> Visa information
                  </p>
                  {parsed.visa ? (
                    <p className="text-base leading-relaxed text-foreground/85 font-light whitespace-pre-line">
                      {parsed.visa}
                    </p>
                  ) : (
                    <p className="text-sm md:text-base text-foreground/75 font-light">
                      Visa information will be shared by our travel expert.
                    </p>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden sticky bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur px-3 py-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDownload?.()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-border/60 text-foreground/80 text-xs uppercase tracking-luxe"
          aria-label="Download PDF"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={share}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-border/60 text-foreground/80 text-xs uppercase tracking-luxe"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={onEnquire}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-gold text-primary-foreground text-xs uppercase tracking-luxe shadow-sm hover:bg-gold/90 transition"
        >
          Enquire now
        </button>
      </div>
    </div>
  );
};

export default ItineraryDetailView;