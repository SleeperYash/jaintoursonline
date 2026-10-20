import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Check,
  Download,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";
import { destinations, type Destination } from "@/data/destinations";
import { generateEstimatedPrice, formatINR, getEstimatedFlightPrice } from "@/lib/estimatedPrice";
import robotImage from "@/assets/travel-assistant-robot.png";

type ConciergeTab = "explore" | "estimator" | "plan";

type LeadAnswers = {
  destination?: string;
  category?: string;
  date?: string;
  party?: string;
  people?: string;
  hotel?: string;
  meal?: string;
  name?: string;
  phone?: string;
  email?: string;
};

const HOTEL_TIERS = [
  { label: "3★ Comfort", multiplier: 1.0, desc: "Clean, central, verified hotels with breakfast" },
  { label: "4★ Premium", multiplier: 1.35, desc: "Top-rated 4-star properties with swimming pool" },
  { label: "5★ Luxury", multiplier: 1.8, desc: "Renowned 5-star international & Indian chains" },
  { label: "Resort / Heritage", multiplier: 2.1, desc: "Private pool villas & heritage palatial stays" },
];

const POPULAR_DESTINATIONS = ["Kashmir", "Dubai", "Kerala", "Bali", "Thailand", "Himachal", "Vietnam", "Maldives"];

// Realistic Odometer Counter effect rolling from previous value to new value with mechanical deceleration
const OdometerNumber = ({ value, duration = 850 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;
    const startVal = isFirstRun.current ? 0 : prevValueRef.current;
    const targetVal = value;
    isFirstRun.current = false;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Quartic ease-out for authentic mechanical deceleration
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startVal + (targetVal - startVal) * ease);
      setDisplayValue(current);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
        prevValueRef.current = targetVal;
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span className="inline-block font-mono tabular-nums tracking-tight text-primary transition-all duration-200">
      {formatINR(displayValue)}
    </span>
  );
};

export const HolidayPlanner = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConciergeTab>("explore");
  const [showInvitation, setShowInvitation] = useState(false);

  // Explore tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"All" | "Domestic" | "International">("All");

  // Budget Estimator state - Starts at 0 as requested so customers input their own duration and travellers
  const [calcDestSlug, setCalcDestSlug] = useState("kashmir");
  const [calcNights, setCalcNights] = useState(0);
  const [calcGuests, setCalcGuests] = useState(0);
  const [calcHotelIdx, setCalcHotelIdx] = useState(1);
  const [calcIncludeFlights, setCalcIncludeFlights] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatorError, setEstimatorError] = useState("");

  // Plan Trip state
  const [planStep, setPlanStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [answers, setAnswers] = useState<LeadAnswers>({
    party: "Family",
    people: "2",
    hotel: "4★ Premium",
    meal: "Jain / Pure Veg",
  });
  const [planError, setPlanError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const searchInputId = useId();
  const dateInputId = useId();
  const nameInputId = useId();
  const phoneInputId = useId();
  const emailInputId = useId();

  const scrollRef = useRef<HTMLDivElement>(null);
  const priceCardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Invitation teaser timer
  useEffect(() => {
    try {
      if (sessionStorage.getItem("jt-planner-invitation-seen")) return;
      const timer = window.setTimeout(() => {
        try {
          if (!sessionStorage.getItem("jt-planner-invitation-seen")) setShowInvitation(true);
        } catch {
          /* ignore */
        }
      }, 15000);
      return () => window.clearTimeout(timer);
    } catch {
      return;
    }
  }, []);

  const dismissInvitation = () => {
    setShowInvitation(false);
    try {
      sessionStorage.setItem("jt-planner-invitation-seen", "1");
    } catch {
      /* ignore */
    }
  };

  const openPlanner = (tab: ConciergeTab = "explore") => {
    dismissInvitation();
    setActiveTab(tab);
    setOpen(true);
  };

  // Keyboard accessibility
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const triggerEl = triggerRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggerEl?.focus();
    };
  }, [open]);

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchesRegion =
        regionFilter === "All" ||
        (regionFilter === "Domestic" && d.region === "Domestic") ||
        (regionFilter === "International" && d.region === "International");
      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.overview.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, regionFilter]);

  // Current destination object for budget estimator
  const currentCalcDest = useMemo(() => {
    return destinations.find((d) => d.slug === calcDestSlug) || destinations[0];
  }, [calcDestSlug]);

  // Accurate realistic flight estimate per person for current destination from Mumbai
  const currentFlightCost = useMemo(() => {
    if (!currentCalcDest) return 0;
    return getEstimatedFlightPrice(currentCalcDest.slug, currentCalcDest.region);
  }, [currentCalcDest]);

  // Dynamic budget calculation
  const calculatedBudget = useMemo(() => {
    if (!currentCalcDest) return { perPerson: 0, total: 0 };
    const basePerPerson = generateEstimatedPrice(currentCalcDest.slug, currentCalcDest.region);
    const hotelMultiplier = HOTEL_TIERS[calcHotelIdx]?.multiplier ?? 1.0;
    // Standard baseline assumes 5 nights; scale by nights smoothly
    const effectiveNights = calcNights > 0 ? calcNights : 5;
    const nightFactor = 0.5 + (effectiveNights / 5) * 0.5;
    const flightAddonPerPerson = calcIncludeFlights ? currentFlightCost : 0;

    const perPerson = Math.round(basePerPerson * hotelMultiplier * nightFactor + flightAddonPerPerson);
    const effectiveGuests = calcGuests > 0 ? calcGuests : 1;
    const total = perPerson * effectiveGuests;
    return { perPerson, total };
  }, [currentCalcDest, calcHotelIdx, calcNights, calcGuests, calcIncludeFlights, currentFlightCost]);

  // Compute current visual step in Estimator
  const estimatorStepState = useMemo(() => {
    const step1Done = Boolean(calcDestSlug);
    const step2Done = calcNights > 0;
    const step3Done = calcGuests > 0;
    const step4Done = hasCalculated;

    let currentStep = 1;
    if (!step2Done) currentStep = 2;
    else if (!step3Done) currentStep = 3;
    else if (!step4Done) currentStep = 4;
    else currentStep = 4;

    const completedCount = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step3Done ? 1 : 0) + (step4Done ? 1 : 0);
    const progressPercent = Math.round((completedCount / 4) * 100);

    return { currentStep, step1Done, step2Done, step3Done, step4Done, progressPercent };
  }, [calcDestSlug, calcNights, calcGuests, hasCalculated]);

  // Lead save to Supabase + Google Sheet sync
  const handleSaveEnquiry = async (finalAnswers: LeadAnswers) => {
    setSaveStatus("saving");
    const destName = finalAnswers.destination || currentCalcDest?.name || "General Enquiry";
    const payload = {
      name: finalAnswers.name || "",
      phone: finalAnswers.phone || "",
      email: finalAnswers.email || "",
      destination_name: destName,
      destination_slug:
        destName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "general",
      travel_dates: finalAnswers.date || null,
      travellers: `${finalAnswers.people || 2} (${finalAnswers.party || "Family"})`,
      budget_per_person: formatINR(calculatedBudget.perPerson),
      itinerary_title: `Concierge: ${finalAnswers.hotel || "4★"}; meals: ${finalAnswers.meal || "Pure Veg/Jain"}; est: ${formatINR(calculatedBudget.total)}`,
    };

    try {
      const { error } = await supabase.from("enquiries").insert(payload);
      if (error) {
        console.error("Enquiry could not be saved to Supabase", error);
        setSaveStatus("failed");
        return false;
      }

      // Edge function sync tagged as 'chatbot' per project rule
      try {
        const sheet = await supabase.functions.invoke("enquiry-to-sheet", {
          body: {
            ...payload,
            source: "chatbot",
            message: `Planner enquiry: ${finalAnswers.party} · Hotel: ${finalAnswers.hotel} · Meal: ${finalAnswers.meal} · Approx Budget: ${formatINR(calculatedBudget.total)}`,
          },
        });
        if (sheet.error || sheet.data?.ok === false) {
          console.warn("Sheet sync non-blocking response:", sheet.error ?? sheet.data?.error);
        }
      } catch (err) {
        console.warn("Sheet sync skipped or failed", err);
      }

      setSaveStatus("saved");
      return true;
    } catch (err) {
      console.error("Save enquiry failed", err);
      setSaveStatus("failed");
      return false;
    }
  };

  // Generate formatted WhatsApp message
  const createWhatsAppMessage = (dest: string, nights: number, guests: number, hotel: string, meal: string, budget: string) => {
    return [
      `Hello Jain Tours & Travels!`,
      `I would like to enquire about a holiday package:`,
      `📍 Destination: ${dest}`,
      `🗓 Duration: ${nights > 0 ? `${nights} Nights` : "Custom Duration"}`,
      `👥 Travellers: ${guests > 0 ? `${guests} Guests` : "Family/Couple"}`,
      `🏨 Hotel Category: ${hotel}`,
      `🍲 Meal Preference: ${meal}`,
      `💰 Estimated Budget: ${budget}`,
      ``,
      `Please share customized itinerary details and best price quote.`,
      `— Sent via Jain Tours Online Concierge`,
    ].join("\n");
  };

  // Download client-side PDF trip summary
  const downloadPdfSummary = () => {
    try {
      const doc = new jsPDF();
      const destName = answers.destination || currentCalcDest?.name || "Curated Tour";
      const totalCost = formatINR(calculatedBudget.total);
      const perPersonCost = formatINR(calculatedBudget.perPerson);

      // Header Banner
      doc.setFillColor(28, 40, 51); // Navy brand color
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("JAIN TOURS & TRAVELS", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Curated Journeys · Crafted Memories | Goregaon West, Mumbai", 14, 26);
      doc.text(`Phone: ${BRAND.phoneDisplay} | Email: ${BRAND.email}`, 14, 31);

      // Document Title
      doc.setTextColor(28, 40, 51);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("HOLIDAY PLANNER ESTIMATE & SUMMARY", 14, 48);

      doc.setDrawColor(218, 165, 32); // Gold accent
      doc.setLineWidth(0.8);
      doc.line(14, 52, 196, 52);

      // Trip Information Table
      doc.setFontSize(10);
      let y = 62;
      const addRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(label, 14, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(value, 70, y);
        y += 8;
      };

      addRow("Selected Destination:", destName);
      addRow("Approximate Travel Date:", answers.date || "Flexible / Upcoming Season");
      addRow("Duration:", calcNights > 0 ? `${calcNights} Nights / ${calcNights + 1} Days` : "Custom");
      addRow("Total Travellers:", `${answers.people || (calcGuests > 0 ? calcGuests : 2)} (${answers.party || "Family"})`);
      addRow("Hotel Category:", answers.hotel || HOTEL_TIERS[calcHotelIdx]?.label || "4★ Premium");
      addRow("Meal Preference:", answers.meal || "100% Pure Veg / Jain Food Guaranteed");
      addRow("Estimated Total Price:", `${totalCost} (Approx. ${perPersonCost} / person)`);

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, 196, y);
      y += 10;

      // Inclusions & Jain Tours Promise
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(28, 40, 51);
      doc.text("Package Inclusions & Jain Tours Guarantee:", 14, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const points = [
        "• Comfortable hotel accommodation in verified properties matching your tier.",
        "• Daily breakfast and assistance with pure vegetarian / Jain meal arrangements.",
        "• Airport/station transfers and private air-conditioned vehicle for sightseeing.",
        "• Dedicated 24/7 on-tour coordination from Jain Tours & Travels Mumbai team.",
        "• Comprehensive visa consultation and travel document guidance where applicable.",
      ];
      points.forEach((pt) => {
        doc.text(pt, 14, y);
        y += 6;
      });

      y += 10;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 28, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 40, 51);
      doc.text("Next Steps:", 20, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Share this estimate with our travel designers on WhatsApp (+91 98212 35678) to", 20, y + 15);
      doc.text("receive your detailed day-wise itinerary PDF with actual dates and airfare.", 20, y + 21);

      doc.save(`Jain_Tours_${destName.replace(/\s+/g, "_")}_Estimate.pdf`);
    } catch (e) {
      console.error("PDF generation error", e);
    }
  };

  // Trigger calculation for the first time
  const handleCalculateFirstTime = () => {
    if (calcNights === 0) {
      setEstimatorError("Please add trip duration (minimum 1 night) to calculate.");
      return;
    }
    if (calcGuests === 0) {
      setEstimatorError("Please add number of travellers (minimum 1 guest) to calculate.");
      return;
    }
    setEstimatorError("");
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setHasCalculated(true);
      setTimeout(() => {
        priceCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }, 600);
  };

  return (
    <>
      {/* Floating Teaser Prompt */}
      {showInvitation && !open && (
        <aside
          aria-label="Travel concierge prompt"
          className="fixed right-4 z-40 flex w-[min(19rem,calc(100vw-5rem))] items-start gap-2.5 rounded-2xl border border-border/80 bg-background/95 p-3.5 text-foreground shadow-2xl backdrop-blur-xl bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] md:right-6 md:bottom-[calc(9rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
            <img src={robotImage} alt="" width={32} height={32} className="h-7 w-7 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => openPlanner("explore")}
              className="text-left text-xs font-semibold leading-snug text-foreground hover:text-primary transition-colors"
            >
              Where would you like to travel?
            </button>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Search packages, estimate budgets &amp; plan your trip.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissInvitation}
            aria-label="Dismiss travel prompt"
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}

      {/* Floating Main Assistant Trigger */}
      <Button
        ref={triggerRef}
        type="button"
        size="icon"
        aria-label="Open Jain Tours Travel Concierge"
        title="Jain Tours Travel Concierge"
        onClick={() => openPlanner(activeTab)}
        className="fixed right-4 z-40 h-12 w-12 overflow-hidden rounded-full bg-primary text-primary-foreground shadow-gold hover:scale-105 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-ring md:right-6 md:h-14 md:w-14"
        style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <img
          src={robotImage}
          alt=""
          loading="lazy"
          width={48}
          height={48}
          className="h-10 w-10 object-contain md:h-12 md:w-12"
        />
      </Button>

      {/* Main Glassmorphism Floating Dock Dialog */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="concierge-title"
            className="fixed inset-x-0 bottom-0 z-[71] flex h-[min(94dvh,720px)] flex-col overflow-hidden rounded-t-2xl border border-border/80 bg-background/95 text-foreground shadow-2xl backdrop-blur-xl md:inset-x-auto md:right-6 md:bottom-20 md:h-[min(650px,calc(100dvh-100px))] md:w-[430px] md:rounded-2xl transition-all"
          >
            {/* Header Zone */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-primary to-primary/90 px-4 py-3.5 text-primary-foreground">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                  <img src={robotImage} alt="" width={36} height={36} className="h-8 w-8 object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 id="concierge-title" className="font-serif text-lg leading-tight truncate">
                    {BRAND.name}
                  </h2>
                  <p className="text-[11px] text-primary-foreground/80 truncate">
                    Travel Concierge · Mumbai (Goregaon West)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`tel:${BRAND.phoneDigits}`}
                  title="Direct Call"
                  aria-label="Direct phone call to travel designer"
                  className="rounded-full p-2 text-primary-foreground/90 hover:bg-primary-foreground/15 hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <Button
                  ref={closeRef}
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Close concierge"
                  title="Close"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Segmented Navigation Dock (3 Clean Tabs) */}
            <nav
              aria-label="Concierge Sections"
              className="grid grid-cols-3 border-b border-border/60 bg-muted/40 p-1.5 gap-1 shrink-0 text-xs font-medium"
            >
              <button
                type="button"
                onClick={() => setActiveTab("explore")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-center transition-all ${
                  activeTab === "explore"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="truncate w-full text-[11px]">Explore</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("estimator")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-center transition-all ${
                  activeTab === "estimator"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate w-full text-[11px]">Estimator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("plan")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-center transition-all ${
                  activeTab === "plan"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="truncate w-full text-[11px]">Plan Trip</span>
              </button>
            </nav>

            {/* Scrollable Main Content Area */}
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              {/* TAB 1: EXPLORE PACKAGES */}
              {activeTab === "explore" && (
                <div className="space-y-4">
                  {/* Search Bar + Region Chips */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id={searchInputId}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search destination, country, or theme…"
                        className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {(["All", "Domestic", "International"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegionFilter(r)}
                          className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                            regionFilter === r
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Destination List */}
                  {filteredDestinations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                      No destinations matching "{searchQuery}". Try searching "Dubai", "Kerala", or "Bali".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredDestinations.slice(0, 10).map((d) => {
                        const estimated = generateEstimatedPrice(d.slug, d.region);
                        return (
                          <article
                            key={d.slug}
                            className="group relative flex gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-sm hover:border-primary/50 transition-all"
                          >
                            <img
                              src={d.image}
                              alt={d.name}
                              loading="lazy"
                              className="h-20 w-24 shrink-0 rounded-lg object-cover ring-1 ring-border/50 bg-muted"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                              }}
                            />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-baseline justify-between gap-2">
                                  <h3 className="font-serif text-sm font-semibold text-foreground truncate">
                                    {d.name}
                                  </h3>
                                  <span className="shrink-0 text-xs font-mono font-semibold text-primary">
                                    from {formatINR(estimated)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{d.tagline}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground/80 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{d.country}</span>
                                  <span>·</span>
                                  <span>{d.duration}</span>
                                </p>
                              </div>

                              <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-border/40">
                                <Link
                                  to={`/destinations/${d.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                >
                                  <span>View Packages</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                                <span className="text-border">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCalcDestSlug(d.slug);
                                    setActiveTab("estimator");
                                  }}
                                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                                >
                                  Configure Cost
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DYNAMIC BUDGET ESTIMATOR */}
              {activeTab === "estimator" && (
                <div className="space-y-4">
                  {/* VISUAL STEPPER & PROGRESS TRACKER */}
                  <div className="rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-sm">
                    {/* Status Header */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            hasCalculated ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {hasCalculated ? <Check className="h-3 w-3" /> : estimatorStepState.currentStep}
                        </span>
                        <span className="font-semibold text-foreground text-xs">
                          {hasCalculated ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <span>All Steps Complete · Live Estimate Active</span>
                            </span>
                          ) : (
                            <span>
                              Step {estimatorStepState.currentStep} of 4:{" "}
                              {estimatorStepState.currentStep === 1
                                ? "Select Destination"
                                : estimatorStepState.currentStep === 2
                                ? "Add Trip Duration"
                                : estimatorStepState.currentStep === 3
                                ? "Add Travellers"
                                : "Choose Hotel Tier & Calculate"}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {estimatorStepState.progressPercent}%
                      </span>
                    </div>

                    {/* Visual Stepper Track with Connected Milestones */}
                    <div className="relative mb-1 px-1">
                      {/* Background connecting line */}
                      <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-border -z-0" />
                      {/* Active progress fill line */}
                      <div
                        className="absolute top-3.5 left-6 h-0.5 bg-primary -z-0 transition-all duration-300 ease-out"
                        style={{
                          width: `${
                            hasCalculated
                              ? "calc(100% - 3rem)"
                              : estimatorStepState.currentStep === 1
                              ? "0%"
                              : estimatorStepState.currentStep === 2
                              ? "calc(33% - 1rem)"
                              : estimatorStepState.currentStep === 3
                              ? "calc(66% - 2rem)"
                              : "calc(100% - 3rem)"
                          }`,
                        }}
                      />

                      {/* 4 Step Nodes */}
                      <div className="relative z-10 grid grid-cols-4 gap-1 text-center">
                        {/* Step 1: Destination */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                              estimatorStepState.step1Done
                                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {estimatorStepState.step1Done ? <Check className="h-3.5 w-3.5" /> : "1"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-foreground truncate w-full">
                            Destination
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate w-full">
                            {currentCalcDest.name}
                          </span>
                        </div>

                        {/* Step 2: Duration */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                              estimatorStepState.step2Done
                                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                : estimatorStepState.currentStep === 2
                                ? "bg-background text-primary border-2 border-primary ring-2 ring-primary/25 shadow-sm"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {estimatorStepState.step2Done ? <Check className="h-3.5 w-3.5" /> : "2"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-foreground truncate w-full">
                            Duration
                          </span>
                          <span
                            className={`text-[9px] truncate w-full ${
                              calcNights === 0
                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {calcNights === 0 ? "0 Nights" : `${calcNights} Nights`}
                          </span>
                        </div>

                        {/* Step 3: Guests */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                              estimatorStepState.step3Done
                                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                : estimatorStepState.currentStep === 3
                                ? "bg-background text-primary border-2 border-primary ring-2 ring-primary/25 shadow-sm"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {estimatorStepState.step3Done ? <Check className="h-3.5 w-3.5" /> : "3"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-foreground truncate w-full">
                            Guests
                          </span>
                          <span
                            className={`text-[9px] truncate w-full ${
                              calcGuests === 0
                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {calcGuests === 0 ? "0 Guests" : `${calcGuests} Guests`}
                          </span>
                        </div>

                        {/* Step 4: Hotel */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                              estimatorStepState.step4Done
                                ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20"
                                : estimatorStepState.currentStep === 4
                                ? "bg-background text-primary border-2 border-primary ring-2 ring-primary/25 shadow-sm"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {estimatorStepState.step4Done ? <Check className="h-3.5 w-3.5" /> : "4"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-foreground truncate w-full">
                            Hotel
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate w-full">
                            {HOTEL_TIERS[calcHotelIdx]?.label.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Destination Selector (Country/Destination name only, nights removed) */}
                  <div className="space-y-1.5">
                    <label htmlFor="calc-dest-select" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                      <span>Select Destination</span>
                    </label>
                    <select
                      id="calc-dest-select"
                      value={calcDestSlug}
                      onChange={(e) => {
                        setCalcDestSlug(e.target.value);
                        setEstimatorError("");
                      }}
                      className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <optgroup label="Popular Domestic">
                        {destinations
                          .filter((d) => d.region === "Domestic")
                          .map((d) => (
                            <option key={d.slug} value={d.slug}>
                              {d.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Popular International">
                        {destinations
                          .filter((d) => d.region === "International")
                          .map((d) => (
                            <option key={d.slug} value={d.slug}>
                              {d.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Step 2 & 3: Nights and Guests Steppers (Starts at 0 as requested) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                        <span>Duration</span>
                      </label>
                      <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-card px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCalcNights((n) => Math.max(hasCalculated ? 1 : 0, n - 1));
                            setEstimatorError("");
                          }}
                          className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                        >
                          -
                        </button>
                        <span className={`text-xs font-semibold ${calcNights === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                          {calcNights === 0 ? "0 Nights" : `${calcNights} Nights`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCalcNights((n) => Math.min(21, n + 1));
                            setEstimatorError("");
                          }}
                          className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                        <span>Travellers</span>
                      </label>
                      <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-card px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCalcGuests((g) => Math.max(hasCalculated ? 1 : 0, g - 1));
                            setEstimatorError("");
                          }}
                          className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                        >
                          -
                        </button>
                        <span className={`text-xs font-semibold ${calcGuests === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                          {calcGuests === 0 ? "0 Guests" : `${calcGuests} Guests`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCalcGuests((g) => Math.min(30, g + 1));
                            setEstimatorError("");
                          }}
                          className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Hotel Tier Selector */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
                      <span>Hotel Category</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {HOTEL_TIERS.map((tier, idx) => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setCalcHotelIdx(idx)}
                          className={`rounded-xl border p-2.5 text-left transition-all ${
                            calcHotelIdx === idx
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-card text-card-foreground hover:border-border/80"
                          }`}
                        >
                          <div className="text-xs">{tier.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Return flights toggle with realistic destination-based airfare from Mumbai */}
                  <label className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcIncludeFlights}
                      onChange={(e) => setCalcIncludeFlights(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <div className="min-w-0">
                      <span className="font-medium text-foreground">Include return flights from Mumbai</span>
                      <p className="mt-0.5 text-[11px] text-primary font-semibold">
                        Est. ~{formatINR(currentFlightCost)}/person*
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 leading-normal mt-0.5">
                        (Estimated fares only. Final pricing will be calculated based on your finalized itinerary.)
                      </p>
                    </div>
                  </label>

                  {estimatorError && (
                    <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                      {estimatorError}
                    </p>
                  )}

                  {/* Progressive Disclosure: Calculate Button (Appears only on 1st calculation) */}
                  {!hasCalculated ? (
                    <div className="pt-1">
                      <Button
                        type="button"
                        onClick={handleCalculateFirstTime}
                        disabled={isCalculating}
                        className="w-full h-11 text-xs font-semibold shadow-gold hover:scale-[1.01] transition-transform"
                      >
                        {isCalculating ? (
                          <span className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 animate-spin text-primary-foreground" />
                            <span>Calculating live rates &amp; airfare…</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-gold" />
                            <span>Calculate Estimated Budget</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </span>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        Add nights &amp; guests above, then calculate to view live rates.
                      </p>
                    </div>
                  ) : (
                    /* Once calculated, price stays permanently and smoothly rolls on ANY subsequent change without asking to re-calculate */
                    <div
                      ref={priceCardRef}
                      className="rounded-xl border border-primary/40 bg-card p-4 shadow-sm text-card-foreground animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-baseline justify-between border-b border-border/60 pb-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Estimated Total Cost
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live Odometer Rate
                            </span>
                          </div>
                          <div className="text-2xl font-serif font-bold text-primary">
                            <OdometerNumber value={calculatedBudget.total} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground">Per Traveller</span>
                          <div className="text-sm font-semibold text-foreground">
                            <OdometerNumber value={calculatedBudget.perPerson} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Utensils className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Breakfast + Pure Veg / Jain assistance</span>
                        </span>
                        <span className="text-[10px] text-primary font-medium">
                          Auto-updates as you change options
                        </span>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <Button asChild className="w-full">
                          <a
                            href={waLink(
                              createWhatsAppMessage(
                                currentCalcDest.name,
                                calcNights,
                                calcGuests,
                                HOTEL_TIERS[calcHotelIdx].label,
                                "Pure Veg / Jain",
                                formatINR(calculatedBudget.total)
                              )
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Quote on WhatsApp
                          </a>
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={downloadPdfSummary}
                            className="flex-1 text-xs"
                          >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Save PDF
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setAnswers((prev) => ({
                                ...prev,
                                destination: currentCalcDest.name,
                                people: String(calcGuests > 0 ? calcGuests : 2),
                                hotel: HOTEL_TIERS[calcHotelIdx].label,
                              }));
                              setPlanStep(2);
                              setActiveTab("plan");
                            }}
                            className="flex-1 text-xs"
                          >
                            Customize Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PLAN MY TRIP (STREAMLINED 4-STEP WIZARD WITH STRICT VALIDATION) */}
              {activeTab === "plan" && (
                <div className="space-y-4">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                    <span className="font-medium text-foreground">
                      {planStep === 1
                        ? "1. Destination & Travel Dates"
                        : planStep === 2
                        ? "2. Travellers & Group Style"
                        : planStep === 3
                        ? "3. Stays & Meal Preferences"
                        : planStep === 4
                        ? "4. Your Contact Details"
                        : "Ready to Explore"}
                    </span>
                    <span>Step {Math.min(planStep, 4)} of 4</span>
                  </div>

                  {/* STEP 1: Destination & Dates (Strictly Compulsory) */}
                  {planStep === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Where would you like to travel? <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {POPULAR_DESTINATIONS.map((dest) => (
                            <button
                              key={dest}
                              type="button"
                              onClick={() => {
                                setAnswers((p) => ({ ...p, destination: dest }));
                                setPlanError("");
                              }}
                              className={`h-10 rounded-xl border px-2.5 text-xs font-medium text-left transition-all ${
                                answers.destination === dest
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-card text-card-foreground hover:border-primary/50"
                              }`}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="custom-dest-input" className="block text-xs font-medium text-muted-foreground">
                          Or enter custom destination
                        </label>
                        <input
                          id="custom-dest-input"
                          type="text"
                          value={answers.destination || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, destination: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="e.g., Rajasthan, Switzerland, Singapore, etc."
                          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor={dateInputId} className="block text-xs font-semibold text-foreground">
                          Tentative Travel Date <span className="text-destructive">*</span>
                        </label>
                        <input
                          id={dateInputId}
                          type="date"
                          required
                          min={new Date().toISOString().slice(0, 10)}
                          value={answers.date || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, date: e.target.value }));
                            setPlanError("");
                          }}
                          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <p className="text-[10px] text-muted-foreground">Select your expected departure date from Mumbai.</p>
                      </div>

                      {planError && (
                        <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                          {planError}
                        </p>
                      )}

                      <Button
                        type="button"
                        onClick={() => {
                          if (!answers.destination?.trim()) {
                            setPlanError("Destination is compulsory. Please select or enter where you want to go.");
                            return;
                          }
                          if (!answers.date?.trim()) {
                            setPlanError("Travel date is compulsory. Please choose your tentative date.");
                            return;
                          }
                          const chosen = new Date(answers.date);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (isNaN(chosen.getTime()) || chosen < today) {
                            setPlanError("Please select a valid upcoming travel date.");
                            return;
                          }
                          setPlanError("");
                          setPlanStep(2);
                        }}
                        className="w-full mt-2"
                      >
                        Next: Travellers <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* STEP 2: Travellers & Party (Strictly Compulsory) */}
                  {planStep === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Who is travelling? <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Couple", "Family", "Friends", "Senior Citizens", "Solo"].map((party) => (
                            <button
                              key={party}
                              type="button"
                              onClick={() => {
                                setAnswers((p) => ({ ...p, party }));
                                setPlanError("");
                              }}
                              className={`h-10 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.party === party
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-card text-card-foreground hover:border-primary/50"
                              }`}
                            >
                              {party}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="people-stepper" className="block text-xs font-semibold text-foreground">
                          Total Number of Travellers <span className="text-destructive">*</span>
                        </label>
                        <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-card px-3">
                          <button
                            type="button"
                            onClick={() =>
                              setAnswers((p) => ({
                                ...p,
                                people: String(Math.max(1, Number(p.people || 2) - 1)),
                              }))
                            }
                            className="h-6 w-6 rounded bg-muted text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold">{answers.people || 2} Travellers</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAnswers((p) => ({
                                ...p,
                                people: String(Math.min(50, Number(p.people || 2) + 1)),
                              }))
                            }
                            className="h-6 w-6 rounded bg-muted text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {planError && (
                        <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                          {planError}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(1)} className="flex-1">
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (!answers.party?.trim()) {
                              setPlanError("Please select who is travelling.");
                              return;
                            }
                            const count = Number(answers.people || 0);
                            if (isNaN(count) || count < 1) {
                              setPlanError("Please specify at least 1 traveller.");
                              return;
                            }
                            setPlanError("");
                            setPlanStep(3);
                          }}
                          className="flex-1"
                        >
                          Next: Hotel &amp; Meals <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Hotel & Meals (Strictly Compulsory) */}
                  {planStep === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Preferred Hotel Category <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["3★ Comfort", "4★ Premium", "5★ Luxury", "Resort / Heritage"].map((hotel) => (
                            <button
                              key={hotel}
                              type="button"
                              onClick={() => {
                                setAnswers((p) => ({ ...p, hotel }));
                                setPlanError("");
                              }}
                              className={`h-10 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.hotel === hotel
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-card text-card-foreground hover:border-primary/50"
                              }`}
                            >
                              {hotel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Dietary &amp; Meal Preference <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Jain / Pure Veg",
                            "Pure Vegetarian",
                            "Veg with Egg Option",
                            "Standard Meals",
                          ].map((meal) => (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => {
                                setAnswers((p) => ({ ...p, meal }));
                                setPlanError("");
                              }}
                              className={`h-10 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.meal === meal
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-card text-card-foreground hover:border-primary/50"
                              }`}
                            >
                              {meal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {planError && (
                        <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                          {planError}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(2)} className="flex-1">
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (!answers.hotel?.trim()) {
                              setPlanError("Hotel category is compulsory.");
                              return;
                            }
                            if (!answers.meal?.trim()) {
                              setPlanError("Meal preference is compulsory.");
                              return;
                            }
                            setPlanError("");
                            setPlanStep(4);
                          }}
                          className="flex-1"
                        >
                          Next: Contact Details <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Contact & Submission (Strictly Compulsory) */}
                  {planStep === 4 && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!answers.name?.trim() || answers.name.trim().length < 2) {
                          setPlanError("Full name is compulsory (minimum 2 characters).");
                          return;
                        }
                        const phoneDigits = (answers.phone || "").replace(/\D/g, "");
                        if (phoneDigits.length < 10) {
                          setPlanError("Valid 10-digit mobile number is compulsory.");
                          return;
                        }
                        if (!answers.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim())) {
                          setPlanError("Valid email address is compulsory.");
                          return;
                        }
                        setPlanError("");
                        await handleSaveEnquiry(answers);
                        setPlanStep(5);
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label htmlFor={nameInputId} className="block text-xs font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          id={nameInputId}
                          type="text"
                          required
                          value={answers.name || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, name: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="Your Full Name"
                          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor={phoneInputId} className="block text-xs font-semibold text-foreground">
                          WhatsApp / Mobile Number <span className="text-destructive">*</span>
                        </label>
                        <input
                          id={phoneInputId}
                          type="tel"
                          required
                          inputMode="tel"
                          value={answers.phone || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, phone: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="10-digit mobile number (e.g. 9821235678)"
                          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor={emailInputId} className="block text-xs font-semibold text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          id={emailInputId}
                          type="email"
                          required
                          value={answers.email || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, email: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="you@example.com"
                          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      {planError && (
                        <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                          {planError}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(3)} className="flex-1">
                          Back
                        </Button>
                        <Button type="submit" disabled={saveStatus === "saving"} className="flex-1">
                          {saveStatus === "saving" ? "Saving Enquiry…" : "Confirm & Review"}
                        </Button>
                      </div>

                      <p className="text-[11px] text-muted-foreground text-center">
                        We respect your privacy. No spam. Only official tour itineraries.
                      </p>
                    </form>
                  )}

                  {/* STEP 5: Final Confirmation & Review */}
                  {planStep === 5 && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-primary/40 bg-card p-4 shadow-sm text-card-foreground">
                        <div className="mb-2 flex items-center gap-2 text-primary">
                          <Check className="h-5 w-5" />
                          <strong className="font-serif text-lg">Thank You, {answers.name}!</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your enquiry for {answers.destination} departing on {answers.date} has been received. Our team in Goregaon West is
                          curating your package options.
                        </p>

                        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
                          <div>
                            <dt className="text-muted-foreground">Destination</dt>
                            <dd className="font-semibold text-foreground">{answers.destination}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Travel Date</dt>
                            <dd className="font-semibold text-foreground">{answers.date}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Travellers</dt>
                            <dd className="font-semibold text-foreground">
                              {answers.people} Guests ({answers.party})
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Hotel &amp; Meal</dt>
                            <dd className="font-semibold text-foreground">
                              {answers.hotel} · {answers.meal}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <Button asChild className="w-full">
                        <a
                          href={waLink(
                            createWhatsAppMessage(
                              answers.destination || "Custom Tour",
                              5,
                              Number(answers.people || 2),
                              answers.hotel || "4★",
                              answers.meal || "Jain / Pure Veg",
                              "Custom Quote"
                            )
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send to Travel Team on WhatsApp
                        </a>
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={downloadPdfSummary} className="flex-1 text-xs">
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download PDF Summary
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setPlanStep(1);
                            setAnswers({
                              party: "Family",
                              people: "2",
                              hotel: "4★ Premium",
                              meal: "Jain / Pure Veg",
                            });
                          }}
                          className="flex-1 text-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Plan Another
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quiet Footer with Call Button */}
            <footer className="shrink-0 flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="truncate">Need urgent help? Call our Goregaon office</span>
              <a
                href={`tel:${BRAND.phoneDigits}`}
                className="font-semibold text-primary hover:underline shrink-0 ml-2"
              >
                {BRAND.phoneDisplay}
              </a>
            </footer>
          </section>
        </>
      )}
    </>
  );
};

export default HolidayPlanner;
