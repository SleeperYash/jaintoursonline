import { useEffect, useMemo, useRef, useState } from "react";
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
  ShieldCheck,
  Hotel,
  MessageCircle,
  Phone,
  Mail,
  Share2,
  FileText,
  Copy,
  Compass,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [parallaxOffsets, setParallaxOffsets] = useState<Record<number, number>>({});
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    index: number;
  }>({ isOpen: false, index: 0 });
  const [isDocked, setIsDocked] = useState(false);
  const jumperScrollRef = useRef<HTMLDivElement | null>(null);
  const dockSentinelRef = useRef<HTMLDivElement | null>(null);

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

  // Flat list of all day photos for full-screen lightbox
  const allDayPhotos = useMemo(() => {
    if (!parsed?.days) return [];
    const list: { url: string; caption: string; dayNum: number; dayTitle: string }[] = [];
    parsed.days.forEach((d, idx) => {
      const dayNum = d.dayNumber ?? idx + 1;
      const extractedPhotos = dayImages[dayNum] ?? [];
      const dayCleanTitle = d.title.replace(/^Day\s*\d+\s*[:\-–]\s*/i, "").trim();

      const photo1 = extractedPhotos[0]
        ? adminPublicUrl(extractedPhotos[0].file_path)
        : photoPool.length > 0
        ? photoPool[(idx * 2) % photoPool.length]
        : null;
      const caption1 = extractedPhotos[0]?.alt_text || dayCleanTitle || `${destinationName} Day ${dayNum}`;
      if (photo1) list.push({ url: photo1, caption: caption1, dayNum, dayTitle: dayCleanTitle || d.title });

      const photo2 = extractedPhotos[1]
        ? adminPublicUrl(extractedPhotos[1].file_path)
        : photoPool.length > 1
        ? photoPool[(idx * 2 + 1) % photoPool.length]
        : null;
      const caption2 = extractedPhotos[1]?.alt_text || `${destinationName} Sightseeing`;
      if (photo2) list.push({ url: photo2, caption: caption2, dayNum, dayTitle: dayCleanTitle || d.title });
    });
    return list;
  }, [parsed?.days, dayImages, photoPool, destinationName]);

  const openLightbox = (photoUrl: string) => {
    const foundIdx = allDayPhotos.findIndex((p) => p.url === photoUrl);
    setLightbox({
      isOpen: true,
      index: foundIdx >= 0 ? foundIdx : 0,
    });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const nextLightboxPhoto = () => {
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index + 1) % (allDayPhotos.length || 1),
    }));
  };

  const prevLightboxPhoto = () => {
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index - 1 + (allDayPhotos.length || 1)) % (allDayPhotos.length || 1),
    }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox.isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox((prev) => ({ ...prev, isOpen: false }));
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) => ({
          ...prev,
          index: (prev.index + 1) % (allDayPhotos.length || 1),
        }));
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) => ({
          ...prev,
          index: (prev.index - 1 + (allDayPhotos.length || 1)) % (allDayPhotos.length || 1),
        }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox.isOpen, allDayPhotos.length]);

  // Scroll spy observer for sticky day jumper
  useEffect(() => {
    if (!parsed?.days?.length) return;

    const cards = parsed.days
      .map((d, idx) => {
        const num = d.dayNumber ?? idx + 1;
        return document.getElementById(`day-card-${num}`);
      })
      .filter(Boolean) as HTMLElement[];

    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const closest = intersecting.reduce((prev, curr) =>
            Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
          );
          const rawNum = closest.target.getAttribute("data-day-num");
          if (rawNum) {
            const num = parseInt(rawNum, 10);
            setActiveDayNumber(num);

            // Keep active chip centered in the horizontal jumper bar
            const container = jumperScrollRef.current;
            const chip = container?.querySelector(`[data-jumper-day="${num}"]`) as HTMLElement | null;
            if (container && chip) {
              const chipLeft = chip.offsetLeft;
              const chipWidth = chip.offsetWidth;
              const containerWidth = container.offsetWidth;
              container.scrollTo({
                left: chipLeft - containerWidth / 2 + chipWidth / 2,
                behavior: "smooth",
              });
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -65% 0px",
        threshold: 0,
      }
    );

    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [parsed?.days]);

  // Subtle luxury parallax effect on day-count headers as they scroll
  useEffect(() => {
    if (!parsed?.days?.length) return;

    let rafId: number | null = null;
    const updateParallax = () => {
      const windowHeight = window.innerHeight;
      const newOffsets: Record<number, number> = {};

      parsed.days.forEach((d, idx) => {
        const num = d.dayNumber ?? idx + 1;
        const el = document.getElementById(`day-card-${num}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Check if card is currently near or within the viewport
          if (rect.bottom > -80 && rect.top < windowHeight + 80) {
            const cardCenter = rect.top + rect.height / 2;
            const screenCenter = windowHeight / 2;
            const delta = (cardCenter - screenCenter) / windowHeight;
            // Subtle, luxurious parallax drift (max +/- 8px)
            const offset = Math.max(-8, Math.min(8, Math.round(delta * 16)));
            newOffsets[num] = offset;
          }
        }
      });

      setParallaxOffsets((prev) => {
        let changed = false;
        for (const k in newOffsets) {
          if (prev[k] !== newOffsets[k]) {
            changed = true;
            break;
          }
        }
        return changed ? { ...prev, ...newOffsets } : prev;
      });
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateParallax();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [parsed?.days]);

  // Docking listener: seamlessly attach WhatsApp & Share CTA bar below Need Help Customizing
  // so it does not continue floating over More Packages and the footer
  useEffect(() => {
    const checkDock = () => {
      const el = dockSentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // On mobile and desktop, when the dock slot reaches or passes the bottom of the viewport:
      // it docks into place and ceases to float down into the footer!
      const dockThreshold = window.innerHeight - 75;
      setIsDocked(rect.top <= dockThreshold);
    };

    window.addEventListener("scroll", checkDock, { passive: true });
    window.addEventListener("resize", checkDock, { passive: true });
    checkDock();

    return () => {
      window.removeEventListener("scroll", checkDock);
      window.removeEventListener("resize", checkDock);
    };
  }, []);

  const scrollToDay = (dayNum: number) => {
    const el = document.getElementById(`day-card-${dayNum}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      setActiveDayNumber(dayNum);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Link copied to clipboard", description: "You can now share this itinerary." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayTitle} | Jain Tours & Travels`,
          text: `Explore the ${displayTitle} tour package itinerary.`,
          url: window.location.href,
        });
      } catch {
        /* share dismissed */
      }
    } else {
      handleCopyLink();
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
          header, nav, footer, .no-print, [role="navigation"], .cookie-banner, .mobile-bar, .sticky-jumper {
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
          .tab-pane {
            display: block !important;
            visibility: visible !important;
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

            </header>

            {/* Overview Section Card */}
            {parsed.overview && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                  Trip Overview
                </h2>
                <p className="text-[13.5px] md:text-base leading-relaxed text-slate-700 dark:text-slate-300 text-justify whitespace-pre-line">
                  {parsed.overview}
                </p>
              </section>
            )}

            {/* Tour Highlights Card */}
            {highlights.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2.5 md:mb-3.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#2e7d32] dark:text-gold" /> Tour Highlights
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

            {/* Sticky Day Jumper Bar */}
            {parsed.days.length > 1 && (
              <div className="sticky-jumper no-print sticky top-14 z-10 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-2 mb-3.5 shadow-sm">
                <div
                  ref={jumperScrollRef}
                  className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
                  style={{ scrollbarWidth: "none" }}
                >
                  <span className="text-[10.5px] uppercase tracking-wider font-bold text-muted-foreground shrink-0 mr-1 pl-1 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-gold" /> Days:
                  </span>
                  {parsed.days.map((d, idx) => {
                    const dayNum = d.dayNumber ?? idx + 1;
                    const isActive = activeDayNumber === dayNum;
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        data-jumper-day={dayNum}
                        onClick={() => scrollToDay(dayNum)}
                        className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 shadow-sm scale-105"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        Day {String(dayNum).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                    id={`day-card-${dayNum}`}
                    data-day-num={dayNum}
                    className="day-card relative bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm scroll-mt-28 overflow-hidden"
                  >
                    {/* Subtle Luxury Day Watermark with counter-parallax */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute top-2.5 right-4 font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-900/[0.04] dark:text-white/[0.05] transition-transform duration-75 ease-out will-change-transform"
                      style={{
                        transform: `translate3d(0, ${-(parallaxOffsets[dayNum] ?? 0) * 1.2}px, 0)`,
                      }}
                    >
                      {String(dayNum).padStart(2, "0")}
                    </span>

                    {/* Day Pill & Heading Header with Subtle Luxury Parallax */}
                    <div
                      className="flex items-center gap-2.5 md:gap-3.5 mb-2.5 md:mb-3.5 relative transition-transform duration-75 ease-out will-change-transform"
                      style={{
                        transform: `translate3d(0, ${parallaxOffsets[dayNum] ?? 0}px, 0)`,
                      }}
                    >
                      <span className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-[11px] md:text-xs font-bold uppercase px-2.5 py-1 rounded-md tracking-wider shrink-0 shadow-sm transition-transform">
                        Day {String(dayNum).padStart(2, "0")}
                      </span>
                      <h3 className="text-[14.5px] sm:text-base md:text-2xl lg:text-[25px] font-bold md:font-serif text-[#1c2833] dark:text-white leading-tight flex-1">
                        {dayCleanTitle || d.title}
                      </h3>
                    </div>

                    {/* Day Description */}
                    <p className="text-[13px] sm:text-[13.5px] md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-3 whitespace-pre-line text-justify">
                      {d.body}
                    </p>

                    {/* 2-Column Mobile Image Grid with Zoom on Click */}
                    {(photo1 || photo2) && (
                      <div className="image-grid grid grid-cols-2 gap-2 mt-2">
                        {photo1 && (
                          <button
                            type="button"
                            onClick={() => openLightbox(photo1)}
                            className="img-box h-[120px] sm:h-[140px] md:h-[160px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 relative group cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-gold"
                            title="Click to view full photo"
                          >
                            <img
                              src={photo1}
                              alt={caption1}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                <Maximize2 className="w-3.5 h-3.5" />
                              </span>
                            </div>
                            <span className="img-caption absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white text-[9.5px] font-semibold px-2 py-1 truncate">
                              {caption1}
                            </span>
                          </button>
                        )}
                        {photo2 && (
                          <button
                            type="button"
                            onClick={() => openLightbox(photo2)}
                            className="img-box h-[120px] sm:h-[140px] md:h-[160px] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 relative group cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-gold"
                            title="Click to view full photo"
                          >
                            <img
                              src={photo2}
                              alt={caption2}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                <Maximize2 className="w-3.5 h-3.5" />
                              </span>
                            </div>
                            <span className="img-caption absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white text-[9.5px] font-semibold px-2 py-1 truncate">
                              {caption2}
                            </span>
                          </button>
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
                <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
                  <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white flex items-center gap-2">
                    <Hotel className="w-4 h-4 md:w-5 md:h-5 text-[#2e7d32] dark:text-gold" /> Hotel Accommodations
                  </h2>
                  <span className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {parsed.hotels.length} Stays Selected
                  </span>
                </div>

                <div className="grid gap-3">
                  {parsed.hotels.map((h, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold uppercase tracking-wider text-[#2e7d32] dark:text-gold">
                            <MapPin className="w-3 h-3" /> {h.city || "Destination"}
                          </span>
                          {h.nights && (
                            <span className="text-[10px] md:text-[11px] font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {h.nights} Night{h.nights > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-[15px] md:text-xl font-bold text-foreground">
                          {h.hotel_name || "Quality 4-Star or equivalent"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground shrink-0">
                        <span className="bg-card border border-border/60 px-2 py-1 rounded text-[10.5px] md:text-[11px]">
                          Daily Breakfast
                        </span>
                        <span className="bg-card border border-border/60 px-2 py-1 rounded text-[10.5px] md:text-[11px]">
                          Ensuite AC
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" /> Upgrades to 5-Star / Luxury resorts available on request
                  </span>
                </div>
              </section>
            )}

            {/* Package Inclusions Card */}
            {parsed.inclusions.length > 0 && (
              <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
                <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2.5 md:mb-3.5 flex items-center gap-2">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-[#2e7d32] dark:text-gold" /> Package Inclusions
                </h2>
                <ul className="space-y-2">
                  {parsed.inclusions.map((inc, i) => (
                    <li key={i} className="relative pl-5 text-[13px] sm:text-[13.5px] md:text-base text-slate-700 dark:text-slate-300 leading-snug">
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
                <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2.5 md:mb-3.5 flex items-center gap-2">
                  <XIcon className="w-4 h-4 md:w-5 md:h-5 text-destructive" /> Exclusions
                </h2>
                <ul className="space-y-2">
                  {parsed.exclusions.map((exc, i) => (
                    <li key={i} className="relative pl-5 text-[13px] sm:text-[13.5px] md:text-base text-slate-700 dark:text-slate-300 leading-snug">
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
                <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2.5 md:mb-3.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#2e7d32] dark:text-gold" /> Visa Guidelines
                </h2>
                <p className="text-[13px] sm:text-[13.5px] md:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {parsed.visa}
                </p>
              </section>
            )}

            {/* Important Notes Card */}
            <section className="section-card bg-card border border-border rounded-xl p-4 sm:p-5 mb-3.5 shadow-sm">
              <h2 className="text-[15px] md:text-2xl font-serif font-bold text-[#1c2833] dark:text-white mb-2.5 md:mb-3.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#2e7d32] dark:text-gold" /> Important Notes
              </h2>
              <ul className="space-y-2">
                {parsed.terms_conditions ? (
                  <li className="text-[13px] sm:text-[13.5px] md:text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {parsed.terms_conditions}
                  </li>
                ) : (
                  DEFAULT_TERMS.map((term, i) => (
                    <li key={i} className="relative pl-5 text-[13px] sm:text-[13.5px] md:text-base text-slate-700 dark:text-slate-300 leading-snug">
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
            <div className="no-print rounded-xl border border-border bg-card p-4 sm:p-5 mb-3.5 shadow-sm">
              <h3 className="font-serif text-lg md:text-3xl font-bold text-[#1c2833] dark:text-white mb-1 md:mb-2">
                Need Help Customizing?
              </h3>
              <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4">
                Talk directly to our travel designers to tweak hotels, dates, or additions.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-medium text-foreground">
                <a href={`tel:+${BRAND.phoneDigits}`} className="flex items-center gap-1.5 hover:text-gold transition">
                  <Phone className="w-3.5 h-3.5 text-gold" /> {BRAND.phone}
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-1.5 hover:text-gold transition break-all">
                  <Mail className="w-3.5 h-3.5 text-gold" /> {BRAND.email}
                </a>
              </div>
            </div>

            {/* Attached WhatsApp & Share Action Bar:
                - Floats while scrolling (mobile bottom-0, laptop centered floating dock)
                - Docks seamlessly into place right below Need Help Customizing
                - Never continues floating down into More Packages or the footer */}
            <div
              ref={dockSentinelRef}
              className="no-print my-3.5 mb-5 w-full min-h-[58px]"
            >
              {isDocked && (
                <div className="w-full rounded-xl bg-card border border-border p-3 sm:p-3.5 shadow-sm flex items-center gap-2.5 sm:gap-3 transition-all">
                  <a
                    href={waLink(`Hi Jain Tours, I'd like to get a quote for the ${displayTitle} package.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-3.5 rounded-lg bg-[#25D366] text-white text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="flex-1 py-3 px-3.5 rounded-lg bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm"
                    title="Share itinerary & source PDF"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" /> Share
                  </button>
                </div>
              )}
            </div>

            {/* Floating Action Bar: Visible while scrolling until attached */}
            {!isDocked && (
              <div className="no-print fixed bottom-0 md:bottom-4 left-0 right-0 md:left-1/2 md:-translate-x-1/2 z-40 w-full max-w-[540px] md:max-w-[780px] p-2.5 px-3 md:px-4 bg-card/95 dark:bg-slate-900/95 backdrop-blur-md border-t md:border border-border md:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] md:shadow-2xl flex items-center gap-2.5 md:gap-3 transition-all duration-200">
                <a
                  href={waLink(`Hi Jain Tours, I'd like to get a quote for the ${displayTitle} package.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-lg bg-[#25D366] text-white text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-lg bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:opacity-95 transition shadow-sm"
                  title="Share itinerary & source PDF"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" /> Share
                </button>
              </div>
            )}

            {/* Similar Tours */}
            {similar.length > 0 && destinationSlug && (
              <div className="no-print mt-6 pt-4 border-t border-border">
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
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

        {/* Share Dialog incorporating Source PDF */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="max-w-md w-[95vw] bg-card border-border/60">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl sm:text-2xl text-foreground flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gold" /> Share Itinerary
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                {displayTitle} · {destinationName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Source PDF Option inside Share */}
              {(onDownload || pdfUrl) && (
                <div className="p-3.5 rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        Source PDF
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Original document prepared by travel desk
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setShareOpen(false);
                      if (onDownload) {
                        onDownload();
                      } else if (pdfUrl) {
                        window.open(pdfUrl, "_blank");
                      }
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shrink-0 gap-1.5 h-8 px-3"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              )}

              {/* Share Link Input */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Share Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={typeof window !== "undefined" ? window.location.href : ""}
                    className="text-xs font-mono h-9 bg-muted/40"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-9 px-3 text-xs shrink-0 gap-1.5 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Social / App Share Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this ${displayTitle} itinerary from Jain Tours & Travels:\n${typeof window !== "undefined" ? window.location.href : ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition text-xs font-semibold"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>

                {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-muted/60 hover:bg-muted transition text-xs font-semibold text-foreground"
                  >
                    <Share2 className="w-4 h-4" /> More Apps…
                  </button>
                ) : (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `${displayTitle} Itinerary - Jain Tours & Travels`
                    )}&body=${encodeURIComponent(
                      `Explore this tour package itinerary:\n${typeof window !== "undefined" ? window.location.href : ""}`
                    )}`}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-muted/60 hover:bg-muted transition text-xs font-semibold text-foreground"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Full-Screen Photo Lightbox Modal */}
        {lightbox.isOpen && allDayPhotos.length > 0 && allDayPhotos[lightbox.index] && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo Lightbox"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-gold text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide shrink-0">
                  Day {String(allDayPhotos[lightbox.index].dayNum).padStart(2, "0")}
                </span>
                <span className="text-white/80 text-xs sm:text-sm font-medium truncate">
                  {allDayPhotos[lightbox.index].dayTitle}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-white/60 font-mono">
                  {lightbox.index + 1} / {allDayPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden select-none">
              {allDayPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={prevLightboxPhoto}
                  className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold"
                  title="Previous photo"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              <img
                key={allDayPhotos[lightbox.index].url}
                src={allDayPhotos[lightbox.index].url}
                alt={allDayPhotos[lightbox.index].caption}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-200"
              />

              {allDayPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={nextLightboxPhoto}
                  className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold"
                  title="Next photo"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Hints */}
            <div className="text-center pt-2.5 border-t border-white/10 shrink-0">
              <p className="text-xs sm:text-sm font-medium text-white/90 truncate max-w-xl mx-auto">
                {allDayPhotos[lightbox.index].caption}
              </p>
              <p className="text-[11px] text-white/45 mt-0.5 hidden sm:block">
                Use arrow keys ← → to browse · Esc to close
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ItineraryDetailView;