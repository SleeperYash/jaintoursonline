import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BRAND, waLink } from "@/lib/brand";
import ItineraryCard from "@/components/site/ItineraryCard";
import { destinations } from "@/data/destinations";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import jainLogo from "@/assets/jain-tours-logo.png";
import {
  Check,
  X as XIcon,
  Download,
  Loader2,
  Printer,
  ShieldCheck,
  Hotel,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Share2,
} from "lucide-react";

type ParsedDay = { title: string; body: string; activities?: string[]; dayNumber?: number };
type ParsedHotel = { city: string; hotel_name: string; nights: number | null };
type Parsed = {
  title?: string | null;
  duration?: string | null;
  starting_price?: string | null;
  overview: string | null;
  highlights?: string[];
  days: ParsedDay[];
  hotels?: ParsedHotel[];
  inclusions: string[];
  exclusions: string[];
  visa: string | null;
  terms_conditions?: string | null;
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

const DEFAULT_TERMS = [
  "Standard check-in time: 2:00 PM | Standard check-out time: 11:00 AM.",
  "Early check-in or late check-out is subject to room availability.",
  "Airfare is dynamic and subject to change until confirmed ticketing.",
  "Valid passport with minimum 6 months validity required for international trips.",
  "Tour sequence may adjust based on real-time traffic and weather conditions.",
  "25% advance payment required to confirm; balance due prior to departure.",
  "Comprehensive travel insurance is highly recommended.",
];

const ItineraryDetailView = ({
  itineraryId,
  title,
  heroImage,
  destinationName,
  destinationSlug,
  isDomestic = false,
  priceOverride,
  onEnquire,
  onDownload,
}: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [dayImages, setDayImages] = useState<Record<number, { file_path: string; alt_text: string }[]>>({});
  const [similar, setSimilar] = useState<{ id: string; title: string; starting_price: string | null; duration: string | null }[]>([]);

  const { images: uploadedDestImages, loading: uploadedDestLoading } = useDestinationImages(destinationSlug ?? "");
  const { hidden: hiddenDestImages, loading: hiddenDestLoading } = useHiddenDefaultImages(destinationSlug);
  const similarImagesReady = !uploadedDestLoading && !hiddenDestLoading;

  // Curated photo pool for day-by-day photo pairings
  const photoPool = useMemo(() => {
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

  // Fetch similar tours
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
      if (!cancelled) {
        setSimilar((data ?? []) as { id: string; title: string; starting_price: string | null; duration: string | null }[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [destinationSlug, itineraryId]);

  // Fetch itinerary details
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);

      const [itinRes, daysRes, incRes, excRes, hotelsRes, imagesRes] = await Promise.all([
        supabase
          .from("itineraries")
          .select("id,title,starting_price,duration,overview,visa_information,terms_conditions,parsed_data")
          .eq("id", itineraryId)
          .maybeSingle(),
        supabase
          .from("itinerary_days")
          .select("day_number,title,description")
          .eq("itinerary_id", itineraryId)
          .order("day_number", { ascending: true }),
        supabase
          .from("itinerary_inclusions")
          .select("inclusion_text,position")
          .eq("itinerary_id", itineraryId)
          .order("position", { ascending: true }),
        supabase
          .from("itinerary_exclusions")
          .select("exclusion_text,position")
          .eq("itinerary_id", itineraryId)
          .order("position", { ascending: true }),
        supabase
          .from("itinerary_hotels")
          .select("city,hotel_name,nights,position")
          .eq("itinerary_id", itineraryId)
          .order("position", { ascending: true }),
        supabase
          .from("itinerary_day_images")
          .select("day_number,position,file_path,alt_text")
          .eq("itinerary_id", itineraryId)
          .order("position", { ascending: true }),
      ]);

      if (cancelled) return;

      const photos: Record<number, { file_path: string; alt_text: string }[]> = {};
      (imagesRes.data ?? []).forEach((image) => {
        (photos[image.day_number] ??= []).push({ file_path: image.file_path, alt_text: image.alt_text });
      });
      setDayImages(photos);

      const row = itinRes.data;
      const days = daysRes.data ?? [];
      const inclusions = incRes.data ?? [];
      const exclusions = excRes.data ?? [];
      const hotels = hotelsRes.data ?? [];
      const parsedData = (row?.parsed_data ?? {}) as Partial<Parsed>;

      const hasNormalized =
        days.length > 0 ||
        inclusions.length > 0 ||
        exclusions.length > 0 ||
        hotels.length > 0 ||
        !!row?.overview;

      if (hasNormalized) {
        setParsed({
          title: row?.title ?? null,
          duration: row?.duration ?? parsedData.duration ?? null,
          starting_price: row?.starting_price ?? parsedData.starting_price ?? null,
          overview: row?.overview ?? parsedData.overview ?? null,
          highlights: parsedData.highlights ?? [],
          days: days.map((d) => ({
            title: d.title || `Day ${d.day_number}`,
            body: d.description ?? "",
            dayNumber: d.day_number,
          })),
          hotels: hotels.map((h) => ({
            city: h.city ?? "",
            hotel_name: h.hotel_name ?? "",
            nights: h.nights ?? null,
          })),
          inclusions: inclusions.map((i) => i.inclusion_text),
          exclusions: exclusions.map((e) => e.exclusion_text),
          visa: row?.visa_information ?? parsedData.visa ?? null,
          terms_conditions: row?.terms_conditions ?? parsedData.terms_conditions ?? null,
        });
      } else if (row?.parsed_data) {
        const legacy = row.parsed_data as Parsed;
        setParsed({
          title: legacy.title ?? row.title,
          duration: legacy.duration ?? row.duration ?? null,
          starting_price: legacy.starting_price ?? row.starting_price ?? null,
          overview: legacy.overview ?? null,
          highlights: legacy.highlights ?? [],
          days: legacy.days ?? [],
          hotels: legacy.hotels ?? [],
          inclusions: legacy.inclusions ?? [],
          exclusions: legacy.exclusions ?? [],
          visa: legacy.visa ?? null,
          terms_conditions: legacy.terms_conditions ?? null,
        });
      } else {
        setParsed({
          title: row?.title ?? null,
          duration: row?.duration ?? null,
          starting_price: row?.starting_price ?? null,
          overview: null,
          highlights: [],
          days: [],
          hotels: [],
          inclusions: [],
          exclusions: [],
          visa: null,
          terms_conditions: null,
        });
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [itineraryId]);

  // Derive duration formatted string
  const displayDuration = useMemo(() => {
    if (parsed?.duration?.trim()) return parsed.duration.trim();
    const dayCount = parsed?.days?.length ?? 0;
    if (dayCount > 0) {
      const nights = Math.max(1, dayCount - 1);
      return `${nights} Nights / ${dayCount} Days`;
    }
    return "Custom Duration";
  }, [parsed]);

  // Derive price formatted string
  const displayPrice = useMemo(() => {
    const raw = priceOverride?.trim() || parsed?.starting_price?.trim();
    if (raw) return raw;
    return "Available upon request";
  }, [priceOverride, parsed]);

  // Title: Uppercase clean brochure title
  const displayTitle = useMemo(() => {
    const raw = parsed?.title?.trim() || title.trim();
    return raw;
  }, [parsed, title]);

  // Auto-generate 4-6 highlights if AI parsing did not supply them
  const highlights = useMemo(() => {
    if (parsed?.highlights && parsed.highlights.length > 0) {
      return parsed.highlights;
    }
    if (!parsed?.days?.length) {
      return [];
    }
    const derived: string[] = [];
    for (const d of parsed.days) {
      if (derived.length >= 6) break;
      const clean = d.title.replace(/^Day\s*\d+\s*[:\-–]\s*/i, "").trim();
      const lower = clean.toLowerCase();
      if (
        clean.length > 5 &&
        !lower.includes("arrival") &&
        !lower.includes("departure") &&
        !lower.includes("check-out")
      ) {
        derived.push(clean);
      }
    }
    if (derived.length < 3) {
      parsed.days.forEach((d) => {
        const clean = d.title.replace(/^Day\s*\d+\s*[:\-–]\s*/i, "").trim();
        if (clean && !derived.includes(clean) && derived.length < 5) {
          derived.push(clean);
        }
      });
    }
    return derived.slice(0, 5);
  }, [parsed]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayTitle} | Jain Tours & Travels`,
          text: `Explore the ${displayTitle} tour package itinerary.`,
          url,
        });
      } catch {
        /* share dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard", description: "You can now share this itinerary." });
    }
  };

  // Structured data for rich travel package snippet
  const schema = useMemo(() => {
    if (!parsed) return null;
    return {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: displayTitle,
      description: parsed.overview ?? `${displayTitle} tour package curated by Jain Tours & Travels`,
      image: heroImage || undefined,
      touristType: isDomestic ? "Domestic traveller" : "International traveller",
      itinerary: {
        "@type": "ItemList",
        name: `${displayTitle} day-by-day`,
        itemListElement: parsed.days.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: d.title,
          description: d.body,
        })),
      },
      offers: {
        "@type": "Offer",
        price: parsed.starting_price || undefined,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      provider: {
        "@type": "TravelAgency",
        name: "Jain Tours & Travels",
        telephone: "+91-9821235678",
      },
    };
  }, [parsed, displayTitle, heroImage, isDomestic]);

  return (
    <>
      {/* Print stylesheet matching the mobile and A4 document brochure layout */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #1e293b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, .no-print, [role="navigation"], .cookie-banner {
            display: none !important;
          }
          .brochure-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .day-card, .section-card, .hero-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            margin-bottom: 15px !important;
          }
          .image-grid .img-box {
            height: 130px !important;
          }
        }
      `}</style>

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {/* Main Container: Mobile-first 520px card-stack, smoothly expanding to 800px on desktop */}
      <div className="w-full min-h-screen py-3 sm:py-6 px-3 sm:px-4 md:px-6 pb-24 md:pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
            <p className="text-sm font-medium">Loading itinerary brochure…</p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Unable to load itinerary: {error}
          </div>
        ) : !parsed ? (
          <div className="max-w-lg mx-auto rounded-xl border border-dashed border-border/60 bg-muted/30 p-12 text-center text-muted-foreground">
            Itinerary details not available.
          </div>
        ) : (
          <div className="brochure-container max-w-[540px] md:max-w-[780px] mx-auto transition-colors">
            
            {/* Top Hero Card */}
            <header className="hero-card bg-card border border-border rounded-xl p-5 sm:p-6 mb-3.5 text-center shadow-sm">
              <div className="flex justify-center mb-2.5">
                <img
                  src={jainLogo}
                  alt="Jain Tours & Travels"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#2e7d32] dark:text-gold mb-1">
                Jain Tours &amp; Travels Exclusive
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1c2833] dark:text-white leading-tight uppercase my-1.5">
                {displayTitle}
              </h1>
              
              {/* Badge Row matching mobile sample */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {displayDuration}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {displayPrice}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  Private AC Vehicle
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  Daily Breakfast
                </span>
              </div>

              {/* Utility actions inside header on desktop / tablet */}
              <div className="no-print hidden sm:flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                  title="Save or Print as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-foreground/80" /> Save as PDF
                </button>
                {onDownload && (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                    title="Download Original PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" /> Source PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                  title="Share link"
                >
                  <Share2 className="w-3.5 h-3.5 text-foreground/80" /> Share
                </button>
              </div>
            </header>

            {/* Overview Section Card */}
            {parsed.overview && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                  Trip Overview
                </h2>
                <p className="text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300 text-justify whitespace-pre-line">
                  {parsed.overview}
                </p>
              </section>
            )}

            {/* Tour Highlights Card */}
            {highlights.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2.5 flex items-center gap-2">
                  Tour Highlights
                </h2>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li
                      key={i}
                      className="relative pl-5 text-[13px] sm:text-[13.5px] text-slate-700 dark:text-slate-300 leading-snug"
                    >
                      <span className="absolute left-1 top-0 text-[#2e7d32] dark:text-gold text-lg leading-none font-bold">
                        •
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Day-by-Day Cards */}
            <div className="space-y-3.5 mb-3.5">
              {parsed.days.map((d, idx) => {
                const dayNum = d.dayNumber ?? idx + 1;
                const extractedPhotos = dayImages[dayNum] ?? [];
                
                // Pair photos: extracted first, else pool fallback
                const photo1 = extractedPhotos[0]
                  ? adminPublicUrl(extractedPhotos[0].file_path)
                  : photoPool.length > 0
                  ? photoPool[(idx * 2) % photoPool.length]
                  : null;

                const photo2 = extractedPhotos[1]
                  ? adminPublicUrl(extractedPhotos[1].file_path)
                  : photoPool.length > 1
                  ? photoPool[(idx * 2 + 1) % photoPool.length]
                  : null;

                // Captions
                const dayCleanTitle = d.title.replace(/^Day\s*\d+\s*[:\-–]\s*/i, "").trim();
                const caption1 = extractedPhotos[0]?.alt_text || dayCleanTitle || `${destinationName} Day ${dayNum}`;
                const caption2 = extractedPhotos[1]?.alt_text || `${destinationName} Sightseeing`;

                return (
                  <article
                    key={idx}
                    className="day-card bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm"
                  >
                    {/* Day Pill & Heading Header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-[11px] font-bold uppercase px-2 py-0.5 rounded tracking-wide shrink-0">
                        Day {String(dayNum).padStart(2, "0")}
                      </span>
                      <h3 className="text-[14.5px] sm:text-base font-bold text-[#1c2833] dark:text-white leading-tight flex-1">
                        {dayCleanTitle || d.title}
                      </h3>
                    </div>

                    {/* Day Description */}
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3 whitespace-pre-line text-justify">
                      {d.body}
                    </p>

                    {/* 2-Column Mobile Image Grid with Sleek Gradient Captions */}
                    {(photo1 || photo2) && (
                      <div className="image-grid grid grid-cols-2 gap-2 mt-2">
                        {photo1 && (
                          <div className="img-box h-[120px] sm:h-[140px] md:h-[160px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 relative group">
                            <img
                              src={photo1}
                              alt={caption1}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="img-caption absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white text-[9.5px] font-semibold px-2 py-1 truncate">
                              {caption1}
                            </span>
                          </div>
                        )}
                        {photo2 && (
                          <div className="img-box h-[120px] sm:h-[140px] md:h-[160px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 relative group">
                            <img
                              src={photo2}
                              alt={caption2}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="img-caption absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white text-[9.5px] font-semibold px-2 py-1 truncate">
                              {caption2}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Hotel Accommodations Card */}
            {parsed.hotels && parsed.hotels.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-[#2e7d32] dark:text-gold" /> Hotel Accommodations
                </h2>
                <ul className="space-y-2">
                  {parsed.hotels.map((h, i) => (
                    <li key={i} className="relative pl-5 text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="absolute left-1 top-0 text-[#2e7d32] dark:text-gold text-lg leading-none font-bold">
                        •
                      </span>
                      <strong>{h.city} {h.nights ? `(${h.nights} Night${h.nights > 1 ? "s" : ""})` : ""}: </strong>
                      <span>{h.hotel_name || "Quality 4-Star or equivalent"}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Package Inclusions Card */}
            {parsed.inclusions.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2e7d32] dark:text-gold" /> Package Inclusions
                </h2>
                <ul className="space-y-2">
                  {parsed.inclusions.map((inc, i) => (
                    <li key={i} className="relative pl-5 text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="absolute left-1 top-0 text-[#2e7d32] dark:text-gold text-lg leading-none font-bold">
                        •
                      </span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Exclusions Card */}
            {parsed.exclusions.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                  <XIcon className="w-4 h-4 text-destructive" /> Exclusions
                </h2>
                <ul className="space-y-2">
                  {parsed.exclusions.map((exc, i) => (
                    <li key={i} className="relative pl-5 text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="absolute left-1 top-0 text-destructive text-lg leading-none font-bold">
                        •
                      </span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Visa Guidelines (if international) */}
            {!isDomestic && parsed.visa && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2e7d32] dark:text-gold" /> Visa Guidelines
                </h2>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {parsed.visa}
                </p>
              </section>
            )}

            {/* Important Notes Card */}
            <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
              <h2 className="text-[15px] font-bold text-[#1c2833] dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2e7d32] dark:text-gold" /> Important Notes
              </h2>
              <ul className="space-y-2">
                {parsed.terms_conditions ? (
                  <li className="text-[13px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {parsed.terms_conditions}
                  </li>
                ) : (
                  DEFAULT_TERMS.map((term, i) => (
                    <li key={i} className="relative pl-5 text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="absolute left-1 top-0 text-[#2e7d32] dark:text-gold text-lg leading-none font-bold">
                        •
                      </span>
                      <span>{term}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            {/* Need Help Box */}
            <div className="no-print rounded-xl border border-border bg-card p-4 sm:p-5 mb-4 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#1c2833] dark:text-white mb-1">
                Need Help Customizing?
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Talk directly to our travel designers to tweak hotels, dates, or additions.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground">
                <a href={`tel:+${BRAND.phoneDigits}`} className="flex items-center gap-1.5 hover:text-gold transition">
                  <Phone className="w-3.5 h-3.5 text-gold" /> {BRAND.phone}
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-1.5 hover:text-gold transition break-all">
                  <Mail className="w-3.5 h-3.5 text-gold" /> {BRAND.email}
                </a>
              </div>
            </div>

            {/* Similar Tours */}
            {similar.length > 0 && destinationSlug && (
              <div className="no-print mt-6 pt-4 border-t border-border">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground mb-3">
                  More {destinationName} Packages
                </h3>
                <div
                  className="-mx-3 px-3 flex md:grid md:grid-cols-2 gap-3 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {similar.map((it, i) => (
                    <div key={it.id} className="shrink-0 w-[82%] sm:w-[65%] md:w-auto">
                      <ItineraryCard
                        id={it.id}
                        title={it.title}
                        image={
                          similarImagesReady && photoPool.length
                            ? photoPool[(i + 1) % photoPool.length]
                            : undefined
                        }
                        destinationSlug={destinationSlug}
                        locationLabel={destinationName.toUpperCase()}
                        index={i}
                        initialPrice={it.starting_price ?? undefined}
                        durationOverride={it.duration ?? undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Floating Action Bar matching the sample */}
        {parsed && (
          <div className="mobile-bar no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border p-2.5 px-3 flex items-center gap-2 max-w-[540px] md:max-w-[780px] mx-auto shadow-lg">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Save as PDF using phone print"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" /> Save PDF
            </button>
            <a
              href={waLink(`Hi Jain Tours, I'd like to get a quote for the ${displayTitle} package.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-lg bg-[#25D366] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button
              type="button"
              onClick={onEnquire}
              className="flex-1 py-2.5 px-3 rounded-lg bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Enquire
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ItineraryDetailView;