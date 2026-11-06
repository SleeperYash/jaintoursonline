import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  Compass,
  Download,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";
import { destinations, type Destination } from "@/data/destinations";
import { generateEstimatedPrice, formatINR, getEstimatedFlightPrice } from "@/lib/estimatedPrice";
import { slugify } from "@/lib/slug";
import robotImage from "@/assets/travel-assistant-robot.png";
import actionExploreImg from "@/assets/chatbot/action_explore.png";
import actionEstimateImg from "@/assets/chatbot/action_estimate.png";
import actionPlanImg from "@/assets/chatbot/action_plan.png";
import { ChatbotAtmosphericBackground } from "./ChatbotAtmosphericBackground";

type ConciergeView =
  | "welcome"
  | "explore"
  | "package_results"
  | "no_packages"
  | "ai_response"
  | "estimator"
  | "plan"
  | "visa"
  | "flights"
  | "groups"
  | "team";

type DatabaseItinerary = {
  id: string;
  title: string;
  destination_slug: string;
  starting_price: string | null;
  duration: string | null;
};

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

// 4 Popular Spotlight Destinations shown in Explore
const SPOTLIGHT_DESTINATIONS = [
  {
    name: "Dubai",
    slug: "dubai",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Bali",
    slug: "bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Thailand",
    slug: "thailand",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Europe",
    slug: "europe",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=700&q=80",
  },
];

// Odometer Counter effect for smooth budget updates
const OdometerNumber = ({ value, duration = 800 }: { value: number; duration?: number }) => {
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

const getNowTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

// Bot message bubble matching WhatsApp-inspired showcase
const BotBubble = ({
  children,
  time,
}: {
  children: React.ReactNode;
  time?: string;
}) => (
  <div className="flex items-start gap-2.5 max-w-[94%] sm:max-w-[88%] animate-in fade-in slide-in-from-left-2 duration-200">
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-background shadow-xs ring-1 ring-border/50">
      <img src={robotImage} alt="" width={32} height={32} className="h-7 w-7 object-contain" />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background"
      />
    </div>
    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-xs border border-border/70 bg-card p-3.5 text-sm text-foreground shadow-xs">
      <div className="leading-relaxed text-[13.5px] sm:text-sm">{children}</div>
      {time && (
        <div className="mt-1 flex justify-end">
          <span className="text-[10px] text-muted-foreground/80 font-mono tracking-tight">{time}</span>
        </div>
      )}
    </div>
  </div>
);

// User message bubble matching WhatsApp-inspired showcase
const UserBubble = ({
  children,
  time,
}: {
  children: React.ReactNode;
  time?: string;
}) => (
  <div className="flex justify-end animate-in fade-in slide-in-from-right-2 duration-200">
    <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-xs">
      <span className="break-words text-[13.5px]">{children}</span>
      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/75 font-mono">
        <span>{time || getNowTime()}</span>
        <CheckCheck className="h-3 w-3 text-sky-200" aria-label="Delivered" />
      </div>
    </div>
  </div>
);

// Natural 3-Dot Typing Indicator matching WhatsApp-style bot experience
const TypingIndicatorBubble = () => (
  <div className="flex items-start gap-2.5 max-w-[94%] sm:max-w-[88%] animate-in fade-in slide-in-from-left-2 duration-200">
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-background shadow-xs ring-1 ring-border/50">
      <img src={robotImage} alt="" width={32} height={32} className="h-7 w-7 object-contain" />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background"
      />
    </div>
    <div className="rounded-2xl rounded-tl-xs border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-xs">
      <div className="flex items-center gap-1.5 h-4">
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
      </div>
    </div>
  </div>
);

// Shimmer Skeleton Card during package loading
const PackageSkeletonCard = () => (
  <div className="snap-start shrink-0 w-[240px] sm:w-auto rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col animate-pulse">
    <div className="h-32 w-full bg-muted/60 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full" />
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted/80" />
        <div className="h-3 w-1/2 rounded bg-muted/50" />
      </div>
      <div className="pt-2 border-t border-border/60">
        <div className="h-8 w-full rounded-lg bg-muted/70" />
      </div>
    </div>
  </div>
);

export const HolidayPlanner = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ConciergeView>("welcome");
  const [userQuery, setUserQuery] = useState("");
  const [userQueryTime, setUserQueryTime] = useState("");
  const [openedAt, setOpenedAt] = useState("");
  const [composerText, setComposerText] = useState("");
  const [showInvitation, setShowInvitation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPackageLoading, setIsPackageLoading] = useState(false);
  const [aiResponseText, setAiResponseText] = useState("");
  const composerInputId = useId();

  // Selected destination context for package search
  const [selectedDestSlug, setSelectedDestSlug] = useState<string>("dubai");
  const [selectedDestName, setSelectedDestName] = useState<string>("Dubai");
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");

  // Loaded database itineraries from Supabase
  const [allDbItineraries, setAllDbItineraries] = useState<DatabaseItinerary[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  // Budget Estimator State
  const [calcDestSlug, setCalcDestSlug] = useState("kashmir");
  const [calcNights, setCalcNights] = useState(0);
  const [calcGuests, setCalcGuests] = useState(0);
  const [calcHotelIdx, setCalcHotelIdx] = useState(1);
  const [calcIncludeFlights, setCalcIncludeFlights] = useState(true);
  const [calcTravelDate, setCalcTravelDate] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatorError, setEstimatorError] = useState("");

  // Plan Trip State
  const [planStep, setPlanStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [answers, setAnswers] = useState<LeadAnswers>({
    party: "Family",
    people: "2",
    hotel: "4★ Premium",
    meal: "Jain / Pure Veg",
  });
  const [planError, setPlanError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  // Fetch real itineraries from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    const loadItineraries = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("id,title,destination_slug,starting_price,duration")
          .order("created_at", { ascending: false });
        if (!cancelled && data && !error) {
          setAllDbItineraries(data as DatabaseItinerary[]);
        }
      } catch (err) {
        console.warn("Could not pre-fetch itineraries", err);
      } finally {
        if (!cancelled) setDbLoading(false);
      }
    };
    loadItineraries();
    return () => {
      cancelled = true;
    };
  }, []);

  // Invitation prompt timer
  useEffect(() => {
    try {
      if (sessionStorage.getItem("jt-planner-invitation-seen")) return;
      const timer = window.setTimeout(() => {
        try {
          if (!sessionStorage.getItem("jt-planner-invitation-seen")) setShowInvitation(true);
        } catch {
          /* ignore */
        }
      }, 14000);
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

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const doScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior,
        });
      }
    };
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 80);
    setTimeout(doScroll, 200);
  };

  const openConcierge = (view: ConciergeView = "welcome") => {
    dismissInvitation();
    setCurrentView(view);
    if (!openedAt) setOpenedAt(getNowTime());
    setOpen(true);
    if (view === "welcome") {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      });
    } else {
      scrollToBottom("smooth");
    }
  };

  const resetToMainMenu = () => {
    setIsTyping(false);
    setIsPackageLoading(false);
    setCurrentView("welcome");
    setUserQuery("");
    setUserQueryTime("");
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const triggerAction = (view: ConciergeView, queryText: string) => {
    setUserQuery(queryText);
    setUserQueryTime(getNowTime());
    setIsTyping(true);
    scrollToBottom("smooth");

    setTimeout(() => {
      setIsTyping(false);
      setCurrentView(view);
      scrollToBottom("smooth");
    }, 700);
  };

  // Switch to package results for a destination with typing indicator and shimmer skeletons
  const showPackagesForDestination = (destSlug: string, destName: string) => {
    setSelectedDestSlug(destSlug);
    setSelectedDestName(destName);
    setUserQuery(`Packages for ${destName}`);
    setUserQueryTime(getNowTime());
    setIsTyping(true);
    setIsPackageLoading(true);
    scrollToBottom("smooth");

    setTimeout(() => {
      setIsTyping(false);
      setCurrentView("package_results");
      scrollToBottom("smooth");

      // Brief shimmer skeleton effect while cards settle
      setTimeout(() => {
        setIsPackageLoading(false);
        scrollToBottom("smooth");
      }, 500);
    }, 700);
  };

  // Smoothly scroll to reveal newly opened steps and conversation bubbles
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      scrollToBottom("smooth");
    }, 60);
    return () => clearTimeout(timer);
  }, [currentView, planStep, open]);

  // Keyboard accessibility and click-outside handler
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Destination Object for Budget Estimator
  const currentCalcDest = useMemo(() => {
    return destinations.find((d) => d.slug === calcDestSlug) || destinations[0];
  }, [calcDestSlug]);

  const currentFlightCost = useMemo(() => {
    if (!currentCalcDest) return 0;
    return getEstimatedFlightPrice(currentCalcDest.slug, currentCalcDest.region);
  }, [currentCalcDest]);

  // Live budget calculation with Odometer support
  const calculatedBudget = useMemo(() => {
    if (!currentCalcDest) return { perPerson: 0, total: 0 };
    const basePerPerson = generateEstimatedPrice(currentCalcDest.slug, currentCalcDest.region);
    const hotelMultiplier = HOTEL_TIERS[calcHotelIdx]?.multiplier ?? 1.0;
    const effectiveNights = calcNights > 0 ? calcNights : 5;
    const nightFactor = 0.5 + (effectiveNights / 5) * 0.5;
    const flightAddonPerPerson = calcIncludeFlights ? currentFlightCost : 0;

    const perPerson = Math.round(basePerPerson * hotelMultiplier * nightFactor + flightAddonPerPerson);
    const effectiveGuests = calcGuests > 0 ? calcGuests : 1;
    const total = perPerson * effectiveGuests;
    return { perPerson, total };
  }, [currentCalcDest, calcHotelIdx, calcNights, calcGuests, calcIncludeFlights, currentFlightCost]);

  // Handle first-time budget calculation
  const handleCalculateBudget = () => {
    if (calcNights === 0) {
      setEstimatorError("Please add trip duration (minimum 1 night).");
      return;
    }
    if (calcGuests === 0) {
      setEstimatorError("Please add number of travellers (minimum 1 guest).");
      return;
    }
    setEstimatorError("");
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setHasCalculated(true);
    }, 500);
  };

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
      itinerary_title: `Concierge Chatbot: ${finalAnswers.hotel || "4★"}; meals: ${finalAnswers.meal || "Pure Veg/Jain"}; est: ${formatINR(calculatedBudget.total)}`,
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
            message: `Chatbot enquiry: ${finalAnswers.party} · Hotel: ${finalAnswers.hotel} · Meal: ${finalAnswers.meal} · Approx Budget: ${formatINR(calculatedBudget.total)}`,
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

  // WhatsApp query builder
  const createWhatsAppMessage = (dest: string, nights: number, guests: number, hotel: string, budget: string) => {
    return [
      `Hello Jain Tours & Travels!`,
      `I would like to enquire about a holiday package:`,
      `📍 Destination: ${dest}`,
      `🗓 Duration: ${nights > 0 ? `${nights} Nights` : "Custom Duration"}`,
      `👥 Travellers: ${guests > 0 ? `${guests} Guests` : "Family/Couple"}`,
      `🏨 Hotel Category: ${hotel}`,
      `🍲 Food: 100% Pure Veg / Jain Food Guaranteed`,
      `💰 Estimated Budget: ${budget}`,
      ``,
      `Please share customized itinerary details and best price quote.`,
      `— Sent via Jain Tours Travel Concierge`,
    ].join("\n");
  };

  // PDF Summary Generator (Retained for Plan My Trip final confirmation)
  const downloadPdfSummary = () => {
    try {
      const doc = new jsPDF();
      const destName = answers.destination || currentCalcDest?.name || "Curated Tour";
      const totalCost = formatINR(calculatedBudget.total);
      const perPersonCost = formatINR(calculatedBudget.perPerson);

      doc.setFillColor(28, 40, 51);
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("JAIN TOURS & TRAVELS", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Curated Journeys · Crafted Memories | Goregaon West, Mumbai", 14, 26);
      doc.text(`Phone: ${BRAND.phoneDisplay} | Email: ${BRAND.email}`, 14, 31);

      doc.setTextColor(28, 40, 51);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("HOLIDAY ENQUIRY SUMMARY", 14, 48);

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.8);
      doc.line(14, 52, 196, 52);

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
      addRow("Total Travellers:", `${answers.people || 2} (${answers.party || "Family"})`);
      addRow("Hotel Category:", answers.hotel || "4★ Premium");
      addRow("Meal Preference:", answers.meal || "100% Pure Veg / Jain Food Guaranteed");
      addRow("Estimated Budget:", `${totalCost} (${perPersonCost} / person)`);

      y += 10;
      doc.save(`Jain_Tours_${destName.replace(/\s+/g, "_")}_Enquiry.pdf`);
    } catch (e) {
      console.error("PDF generation error", e);
    }
  };

  // Smart free-text input parser (Deterministic matching first; low-usage AI fallback)
  const handleComposerSend = async () => {
    const text = composerText.trim();
    if (!text) return;
    setComposerText("");

    const lower = text.toLowerCase();

    // 1. Visas
    if (/visa|schengen|embassy|passport/i.test(lower)) {
      triggerAction("visa", text);
      return;
    }
    // 2. Flights
    if (/flight|ticket|airfare|airline|boarding/i.test(lower)) {
      triggerAction("flights", text);
      return;
    }
    // 3. Groups / Corporate
    if (/group|corporate|family reunion|college|bulk/i.test(lower)) {
      triggerAction("groups", text);
      return;
    }
    // 4. Estimate / Budget
    if (/estimate|budget|cost|price|calculator|quote|how much/i.test(lower)) {
      triggerAction("estimator", text);
      return;
    }
    // 5. Plan trip / customize
    if (/plan|book|honeymoon|customise|customize|itinerary/i.test(lower)) {
      triggerAction("plan", text);
      return;
    }
    // 6. Direct contact / team
    if (/call|talk|human|agent|team|contact|number|address|office|goregaon/i.test(lower)) {
      triggerAction("team", text);
      return;
    }

    // 7. Check if user typed a known destination
    const matchedDest = destinations.find(
      (d) =>
        lower.includes(d.name.toLowerCase()) ||
        lower.includes(d.slug.toLowerCase()) ||
        d.country.toLowerCase().includes(lower) ||
        lower.includes(d.country.toLowerCase())
    );

    if (matchedDest) {
      showPackagesForDestination(matchedDest.slug, matchedDest.name);
      return;
    }

    // 8. General search in database itineraries by title
    const matchingItins = allDbItineraries.filter((it) =>
      it.title.toLowerCase().includes(lower)
    );
    if (matchingItins.length > 0) {
      const firstDestSlug = matchingItins[0].destination_slug;
      const dest = destinations.find((d) => d.slug === firstDestSlug);
      showPackagesForDestination(firstDestSlug, dest?.name || firstDestSlug);
      return;
    }

    // 9. If general "packages" or "explore"
    if (/package|destinations|places|holiday|tour/i.test(lower)) {
      triggerAction("explore", text);
      return;
    }

    // 10. Low-Usage AI Fallback for General Destination & Travel Questions
    setUserQuery(text);
    setUserQueryTime(getNowTime());
    setIsTyping(true);
    scrollToBottom("smooth");

    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setIsTyping(false);
      if (data?.answer) {
        setAiResponseText(data.answer);
        setCurrentView("ai_response");
      } else {
        setCurrentView("no_packages");
      }
    } catch {
      setIsTyping(false);
      setCurrentView("no_packages");
    }
    scrollToBottom("smooth");
  };

  // Derive matching packages for currently selected destination
  const matchingPackages = useMemo(() => {
    // 1. Primary: actual database itineraries matching this destination
    const dbMatches = allDbItineraries.filter(
      (it) => it.destination_slug === selectedDestSlug
    );

    const destObj = destinations.find((d) => d.slug === selectedDestSlug);
    const destGallery = destObj?.gallery || [];

    if (dbMatches.length > 0) {
      return dbMatches.map((it, idx) => {
        const coverImg =
          (destGallery.length > 0 ? destGallery[idx % destGallery.length] : null) ||
          destObj?.image ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80";
        return {
          id: it.id,
          title: it.title,
          destinationSlug: selectedDestSlug,
          destinationName: selectedDestName,
          duration: it.duration || destObj?.duration || "Custom duration",
          price: it.starting_price || formatINR(generateEstimatedPrice(selectedDestSlug, destObj?.region || "Domestic")),
          image: coverImg,
          url: `/destinations/${selectedDestSlug}/${slugify(it.title)}`,
        };
      });
    }

    // 2. Secondary: If no individual database row yet, provide the verified destination package page
    if (destObj) {
      return [
        {
          id: destObj.slug,
          title: `${destObj.name} Signature Holiday Package`,
          destinationSlug: destObj.slug,
          destinationName: destObj.name,
          duration: destObj.duration,
          price: formatINR(generateEstimatedPrice(destObj.slug, destObj.region)),
          image: destObj.image,
          url: `/destinations/${destObj.slug}`,
        },
      ];
    }

    return [];
  }, [allDbItineraries, selectedDestSlug, selectedDestName]);

  const navigateToPackage = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      {/* Floating Teaser Prompt */}
      {showInvitation && !open && (
        <aside
          aria-label="Travel concierge prompt"
          className="fixed right-4 z-40 flex w-[min(19rem,calc(100vw-5rem))] items-start gap-2.5 rounded-2xl border border-border/80 bg-background/95 p-3.5 text-foreground shadow-2xl backdrop-blur-xl bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] md:right-6 md:bottom-[calc(9rem+env(safe-area-inset-bottom,0px))] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
            <img src={robotImage} alt="" width={32} height={32} className="h-7 w-7 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => openConcierge("welcome")}
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

      {/* Floating Concierge Launcher Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open Jain Tours Travel Concierge"
        title="Jain Tours Travel Concierge"
        onClick={() => openConcierge(currentView)}
        className="fixed right-4 z-40 h-12 w-12 overflow-hidden rounded-full bg-primary text-primary-foreground shadow-gold hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:right-6 md:h-14 md:w-14 flex items-center justify-center"
        style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <img
          src={robotImage}
          alt=""
          loading="lazy"
          width={48}
          height={48}
          className="h-9 w-9 object-contain md:h-11 md:w-11"
        />
        {/* Subtle Online Status Dot */}
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-primary"
        />
      </button>

      {/* Main Floating Chatbot (Zero background overlay so website stays 100% visible and vibrant) */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-end justify-center sm:justify-end sm:p-6 pointer-events-none">
          {/* Chat Window Container */}
          <section
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="concierge-title"
            className="pointer-events-auto relative z-[71] flex flex-col overflow-hidden bg-background text-foreground shadow-2xl border border-border/80 transition-all duration-300 ease-out
              w-[calc(100vw-16px)] h-[min(90dvh,720px)] rounded-3xl m-2 mb-2 sm:m-0 sm:w-[440px] sm:h-[700px] sm:max-h-[calc(100dvh-48px)] sm:rounded-3xl
              animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
          >
            {/* Header: Deep Navy, Brand Wordmark, Direct Phone & Close Control */}
            <header className="relative flex shrink-0 items-center justify-between gap-3 bg-[#0d233a] dark:bg-[#071322] px-4 py-3.5 text-white shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/20 shadow-xs">
                  <img src={robotImage} alt="" width={40} height={40} className="h-9 w-9 object-contain" />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-white"
                  />
                </div>
                <div className="min-w-0">
                  <h2 id="concierge-title" className="font-serif text-base sm:text-lg font-bold leading-tight truncate">
                    {BRAND.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-[11px] text-white/80 truncate font-sans">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    Travel Concierge · Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`tel:${BRAND.phoneDigits}`}
                  title="Direct Phone Call"
                  aria-label="Direct phone call to Jain Tours travel consultant"
                  className="rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close travel assistant"
                  title="Close"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Watermark Airplane */}
              <Plane
                aria-hidden="true"
                className="absolute right-16 top-2 h-7 w-7 text-white/10 -rotate-12 pointer-events-none"
              />
            </header>

            {/* Conversation Area with Atmospheric Travel Background */}
            <div className="relative min-h-0 flex-1 overflow-hidden flex flex-col">
              {/* Atmospheric Background Layer (Sky, Airliner, Clouds & World Silhouettes) */}
              <ChatbotAtmosphericBackground />

              {/* Conversation Scroll Body */}
              <div
                ref={scrollRef}
                className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 space-y-4"
              >
              {/* Initial Welcome Bubble */}
              <BotBubble time={openedAt || "10:24 AM"}>
                <p className="font-semibold text-foreground">
                  Namaste! Welcome to {BRAND.name} 👋
                </p>
                <p className="mt-1 text-muted-foreground">
                  I'm your travel assistant. How can I help you plan your next holiday?
                </p>
              </BotBubble>

              {/* VIEW 1: WELCOME SCREEN (Action Cards & Quick Questions) */}
              {currentView === "welcome" && !isTyping && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* 3 Main Action Cards (Exact images & layout matching design reference) */}
                  <div className="flex flex-col gap-2 sm:gap-2.5">
                    {/* Card 1: Explore Destinations & Packages */}
                    <button
                      type="button"
                      onClick={() => triggerAction("explore", "Explore destinations & packages")}
                      className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-2 sm:p-2.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50"
                    >
                      <div className="relative w-14 h-10 sm:w-16 sm:h-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                        <img
                          src={actionExploreImg}
                          alt="Explore Destinations & Packages"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] sm:text-[13.5px] font-bold text-foreground leading-snug block">
                          Explore Destinations &amp; Packages
                        </span>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-primary transition-transform duration-200 group-hover:translate-x-0.5 ml-auto">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>

                    {/* Card 2: Estimate My Trip */}
                    <button
                      type="button"
                      onClick={() => triggerAction("estimator", "Estimate my trip budget")}
                      className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-2 sm:p-2.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50"
                    >
                      <div className="relative w-14 h-10 sm:w-16 sm:h-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                        <img
                          src={actionEstimateImg}
                          alt="Estimate My Trip"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] sm:text-[13.5px] font-bold text-foreground leading-snug block">
                          Estimate My Trip
                        </span>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-primary transition-transform duration-200 group-hover:translate-x-0.5 ml-auto">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>

                    {/* Card 3: Plan My Trip */}
                    <button
                      type="button"
                      onClick={() => triggerAction("plan", "Plan my trip")}
                      className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-2 sm:p-2.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50"
                    >
                      <div className="relative w-14 h-10 sm:w-16 sm:h-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                        <img
                          src={actionPlanImg}
                          alt="Plan My Trip"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] sm:text-[13.5px] font-bold text-foreground leading-snug block">
                          Plan My Trip
                        </span>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-primary transition-transform duration-200 group-hover:translate-x-0.5 ml-auto">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </div>

                  {/* Quick Questions Section */}
                  <div className="pt-1">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2.5 px-1">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span>Quick Questions</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => triggerAction("visa", "Do you provide visa services?")}
                        className="rounded-full border border-border/80 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs hover:border-primary hover:text-primary transition-colors text-center truncate"
                      >
                        Visa Services
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAction("explore", "International Packages")}
                        className="rounded-full border border-border/80 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs hover:border-primary hover:text-primary transition-colors text-center truncate"
                      >
                        International Packages
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAction("groups", "Group Tours")}
                        className="rounded-full border border-border/80 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs hover:border-primary hover:text-primary transition-colors text-center truncate"
                      >
                        Group Tours
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAction("flights", "Flight Bookings")}
                        className="rounded-full border border-border/80 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs hover:border-primary hover:text-primary transition-colors text-center truncate"
                      >
                        Flight Bookings
                      </button>
                    </div>

                    <div className="mt-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => triggerAction("team", "Talk to our team")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Headphones className="h-3.5 w-3.5" />
                        <span>Talk to Our Team</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contextual User Bubble when user clicked or typed an action */}
              {(currentView !== "welcome" || isTyping) && userQuery && (
                <UserBubble time={userQueryTime}>{userQuery}</UserBubble>
              )}

              {/* Natural 3-Dot Typing Indicator before bot response arrives */}
              {isTyping && <TypingIndicatorBubble />}

              {/* VIEW 2: EXPLORE DESTINATIONS */}
              {currentView === "explore" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">Here are some of our popular destinations:</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select a destination below or search for any domestic or international holiday.
                    </p>
                  </BotBubble>

                  {/* 2x2 Spotlight Destination Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {SPOTLIGHT_DESTINATIONS.map((spot) => (
                      <button
                        key={spot.slug}
                        type="button"
                        onClick={() => showPackagesForDestination(spot.slug, spot.name)}
                        className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left"
                      >
                        <div className="relative h-28 w-full overflow-hidden bg-muted">
                          <img
                            src={spot.image}
                            alt={spot.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                            <span className="font-serif font-bold text-sm drop-shadow-xs">{spot.name}</span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 backdrop-blur-xs transition-transform group-hover:translate-x-0.5">
                              <ChevronRight className="h-3 w-3 text-white" />
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Destination Dropdown / Quick Picker */}
                  <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-xs space-y-2">
                    <label htmlFor="concierge-dest-select" className="block text-xs font-semibold text-foreground">
                      Or Choose from all 25+ Destinations:
                    </label>
                    <select
                      id="concierge-dest-select"
                      value={selectedDestSlug}
                      onChange={(e) => {
                        const slug = e.target.value;
                        const dest = destinations.find((d) => d.slug === slug);
                        if (dest) showPackagesForDestination(dest.slug, dest.name);
                      }}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                  {/* Actions Bar */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToPackage("/destinations")}
                      className="w-full text-xs font-semibold rounded-xl h-10"
                    >
                      <span>View All Destinations</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: PACKAGE RESULTS (CARD STYLE) */}
              {currentView === "package_results" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">
                      Here are our handpicked packages for {selectedDestName}:
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tap View Details on any package to see the full day-by-day itinerary.
                    </p>
                  </BotBubble>

                  {/* Horizontal Scroll Carousel on Mobile / Responsive Grid on Desktop */}
                  <div className="flex sm:grid sm:grid-cols-2 gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1 snap-x snap-mandatory">
                    {isPackageLoading ? (
                      <>
                        <PackageSkeletonCard />
                        <PackageSkeletonCard />
                      </>
                    ) : (
                      matchingPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="snap-start shrink-0 w-[240px] sm:w-auto rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 transition-all flex flex-col"
                        >
                          <div className="relative h-32 w-full overflow-hidden bg-muted">
                            <img
                              src={pkg.image}
                              alt={pkg.title}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                const destObj = destinations.find((d) => d.slug === pkg.destinationSlug);
                                const fallbackUrl =
                                  destObj?.image ||
                                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80";
                                if (target.src !== fallbackUrl) {
                                  target.src = fallbackUrl;
                                }
                              }}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-xs">
                              {pkg.destinationName}
                            </span>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif font-bold text-sm text-foreground line-clamp-2 leading-snug">
                                {pkg.title}
                              </h3>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{pkg.duration}</span>
                                <span className="font-semibold text-primary font-mono">{pkg.price}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-border/60">
                              <Button
                                type="button"
                                onClick={() => navigateToPackage(pkg.url)}
                                className="w-full h-8 text-xs font-semibold rounded-lg"
                              >
                                <span>View Details</span>
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Secondary Links & Return to Menu */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToPackage(`/destinations/${selectedDestSlug}`)}
                      className="w-full text-xs font-medium rounded-xl h-9"
                    >
                      <span>Explore all {selectedDestName} packages</span>
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4: NO PACKAGES FOUND */}
              {currentView === "no_packages" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">
                      Sorry! We don't have any packages for this destination at this moment.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Our travel desk curates custom holidays with flights, visas, 4★/5★ stays, and pure veg meal arrangements.
                    </p>
                  </BotBubble>

                  {/* Contact Support Card */}
                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-foreground">
                        Custom Itinerary Consultation
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Please contact our team for customised options.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button asChild className="h-9 text-xs font-semibold rounded-xl">
                        <a href={`tel:${BRAND.phoneDigits}`}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          <span>Call Us</span>
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="h-9 text-xs font-semibold rounded-xl">
                        <a href={waLink(`Hi Jain Tours, I'd like to plan a custom trip to ${userQuery || "a destination"}.`)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerAction("explore", "Explore available destinations")}
                      className="w-full text-xs font-semibold rounded-xl h-9"
                    >
                      <Compass className="h-3.5 w-3.5 mr-1.5" />
                      <span>Explore Other Destinations</span>
                    </Button>
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4B: AI RESPONSE TO GENERAL TRAVEL & DESTINATION QUESTIONS */}
              {currentView === "ai_response" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground leading-relaxed whitespace-pre-line">
                      {aiResponseText}
                    </p>
                  </BotBubble>

                  {/* Contextual Action Cards */}
                  <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs space-y-2.5">
                    <span className="block text-xs font-semibold text-foreground">
                      How would you like to proceed?
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => triggerAction("estimator", "Estimate My Trip")}
                        className="h-9 text-xs font-semibold rounded-xl"
                      >
                        <Calculator className="h-3.5 w-3.5 mr-1.5" />
                        <span>Estimate Budget</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => triggerAction("explore", "Explore Destinations")}
                        className="h-9 text-xs font-semibold rounded-xl"
                      >
                        <Compass className="h-3.5 w-3.5 mr-1.5" />
                        <span>Explore Tours</span>
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 5: ESTIMATE MY TRIP */}
              {currentView === "estimator" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">
                      Please tell us your travel details to get an approximate cost.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Adjust your nights, guest count, and stay preference for live rates.
                    </p>
                  </BotBubble>

                  {/* Estimator Interactive Form Card */}
                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3.5">
                    {/* Visual Progress Stepper (Destination -> Duration -> Guests -> Hotel) */}
                    <div className="rounded-xl bg-muted/40 p-2.5 border border-border/50">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <div className={`flex items-center gap-1 ${calcDestSlug ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                          <span>Destination</span>
                        </div>
                        <div className="h-0.5 flex-1 mx-1.5 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${calcNights > 0 ? "bg-primary" : "bg-transparent"} transition-all`} />
                        </div>
                        <div className={`flex items-center gap-1 ${calcNights > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold ${calcNights > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                          <span>Duration</span>
                        </div>
                        <div className="h-0.5 flex-1 mx-1.5 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${calcGuests > 0 ? "bg-primary" : "bg-transparent"} transition-all`} />
                        </div>
                        <div className={`flex items-center gap-1 ${calcGuests > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold ${calcGuests > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                          <span>Guests</span>
                        </div>
                        <div className="h-0.5 flex-1 mx-1.5 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${calcGuests > 0 && calcNights > 0 ? "bg-primary" : "bg-transparent"} transition-all`} />
                        </div>
                        <div className={`flex items-center gap-1 ${calcGuests > 0 && calcNights > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold ${calcGuests > 0 && calcNights > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>4</span>
                          <span>Hotel</span>
                        </div>
                      </div>
                    </div>

                    {/* Destination Selection */}
                    <div className="space-y-1.5">
                      <label htmlFor="calc-dest" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>Destination</span>
                      </label>
                      <select
                        id="calc-dest"
                        value={calcDestSlug}
                        onChange={(e) => {
                          setCalcDestSlug(e.target.value);
                          setEstimatorError("");
                        }}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                    {/* Travel Date */}
                    <div className="space-y-1.5">
                      <label htmlFor="calc-date" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>Travel Date</span>
                      </label>
                      <input
                        id="calc-date"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={calcTravelDate}
                        onChange={(e) => setCalcTravelDate(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    {/* Nights & Guests Steppers (Starts at 0 as requested) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Nights / Days</label>
                        <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3">
                          <button
                            type="button"
                            onClick={() => setCalcNights((n) => Math.max(0, n - 1))}
                            className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                          >
                            -
                          </button>
                          <span className={`text-xs font-semibold ${calcNights === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                            {calcNights === 0 ? "0 Nights" : `${calcNights} Nights`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCalcNights((n) => Math.min(21, n + 1))}
                            className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Travellers</label>
                        <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3">
                          <button
                            type="button"
                            onClick={() => setCalcGuests((g) => Math.max(0, g - 1))}
                            className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                          >
                            -
                          </button>
                          <span className={`text-xs font-semibold ${calcGuests === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                            {calcGuests === 0 ? "0 Guests" : `${calcGuests} Guests`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCalcGuests((g) => Math.min(30, g + 1))}
                            className="h-6 w-6 rounded bg-muted text-xs font-bold hover:bg-muted/80"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hotel Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Hotel Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {HOTEL_TIERS.map((tier, idx) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => setCalcHotelIdx(idx)}
                            className={`rounded-xl border p-2 text-left transition-all ${
                              calcHotelIdx === idx
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border bg-background text-foreground hover:border-border/80"
                            }`}
                          >
                            <div className="text-xs">{tier.label}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{tier.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flight Toggle with Realistic Mumbai fares */}
                    <label className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3 text-xs cursor-pointer">
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

                    {/* Calculate / Get Estimate Button */}
                    {!hasCalculated ? (
                      <Button
                        type="button"
                        onClick={handleCalculateBudget}
                        disabled={isCalculating}
                        className="w-full h-11 text-xs font-semibold shadow-gold hover:scale-[1.01] transition-transform rounded-xl"
                      >
                        {isCalculating ? (
                          <span className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 animate-spin text-primary-foreground" />
                            <span>Calculating live rates &amp; airfare…</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-gold" />
                            <span>Get Estimate ✨</span>
                          </span>
                        )}
                      </Button>
                    ) : (
                      /* Live Rate Display: Price stays permanently and rolls live with Odometer */
                      <div className="rounded-xl border border-primary/40 bg-card/95 p-4 shadow-xs text-card-foreground space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-baseline justify-between border-b border-border/60 pb-2.5">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Estimated Total Cost
                            </span>
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

                        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>Pure Veg / Jain meal assistance</span>
                          </span>
                          <span className="text-[10px] text-primary font-medium">Auto-updates</span>
                        </div>

                        {/* Send Quote on WhatsApp (NOTE: Save PDF and Customize Plan have been removed as requested!) */}
                        <Button asChild className="w-full h-10 rounded-xl">
                          <a
                            href={waLink(
                              createWhatsAppMessage(
                                currentCalcDest.name,
                                calcNights,
                                calcGuests,
                                HOTEL_TIERS[calcHotelIdx].label,
                                formatINR(calculatedBudget.total)
                              )
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            <span>Send Quote on WhatsApp</span>
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 6: PLAN MY TRIP */}
              {currentView === "plan" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">
                      Tell us what kind of trip you have in mind.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Step {Math.min(planStep, 4)} of 4:{" "}
                      {planStep === 1
                        ? "Destination & Travel Dates"
                        : planStep === 2
                        ? "Travellers & Group Style"
                        : planStep === 3
                        ? "Hotel & Dietary Preference"
                        : "Your Contact Details"}
                    </p>
                  </BotBubble>

                  {/* Plan Step 1: Destination & Dates */}
                  {planStep === 1 && (
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Where would you like to go? <span className="text-destructive">*</span>
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
                              className={`h-9 rounded-xl border px-2.5 text-xs font-medium text-left transition-all ${
                                answers.destination === dest
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-background text-foreground hover:border-primary/50"
                              }`}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="custom-plan-dest" className="block text-xs font-medium text-muted-foreground">
                          Or enter custom destination
                        </label>
                        <input
                          id="custom-plan-dest"
                          type="text"
                          value={answers.destination || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, destination: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="e.g. Rajasthan, Switzerland, Singapore..."
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="plan-tentative-date" className="block text-xs font-semibold text-foreground">
                          Tentative Travel Date <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="plan-tentative-date"
                          type="date"
                          required
                          min={new Date().toISOString().slice(0, 10)}
                          value={answers.date || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, date: e.target.value }));
                            setPlanError("");
                          }}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
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
                          setPlanError("");
                          setPlanStep(2);
                        }}
                        className="w-full h-10 rounded-xl"
                      >
                        Next: Travellers <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Plan Step 2: Travellers & Party */}
                  {planStep === 2 && (
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
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
                              className={`h-9 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.party === party
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-background text-foreground hover:border-primary/50"
                              }`}
                            >
                              {party}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-foreground">
                          Total Number of Travellers <span className="text-destructive">*</span>
                        </label>
                        <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-background px-3">
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

                      <div className="flex items-center gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(1)} className="flex-1 rounded-xl">
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (!answers.party?.trim()) {
                              setPlanError("Please select who is travelling.");
                              return;
                            }
                            setPlanError("");
                            setPlanStep(3);
                          }}
                          className="flex-1 rounded-xl"
                        >
                          Next: Stays &amp; Meals <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Plan Step 3: Hotel & Meals */}
                  {planStep === 3 && (
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
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
                              className={`h-9 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.hotel === hotel
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-background text-foreground hover:border-primary/50"
                              }`}
                            >
                              {hotel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Dietary Preference <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Jain / Pure Veg", "Pure Vegetarian", "Veg with Egg Option", "Standard Meals"].map((meal) => (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => {
                                setAnswers((p) => ({ ...p, meal }));
                                setPlanError("");
                              }}
                              className={`h-9 rounded-xl border px-3 text-xs font-medium text-left transition-all ${
                                answers.meal === meal
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border bg-background text-foreground hover:border-primary/50"
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

                      <div className="flex items-center gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(2)} className="flex-1 rounded-xl">
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
                          className="flex-1 rounded-xl"
                        >
                          Next: Contact <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Plan Step 4: Contact Details & Lead Capture */}
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
                      className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3"
                    >
                      <div className="space-y-1">
                        <label htmlFor="plan-name" className="block text-xs font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="plan-name"
                          type="text"
                          required
                          value={answers.name || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, name: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="Your Full Name"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="plan-phone" className="block text-xs font-semibold text-foreground">
                          WhatsApp / Mobile Number <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="plan-phone"
                          type="tel"
                          required
                          inputMode="tel"
                          value={answers.phone || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, phone: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="10-digit mobile (e.g. 9821235678)"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="plan-email" className="block text-xs font-semibold text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="plan-email"
                          type="email"
                          required
                          value={answers.email || ""}
                          onChange={(e) => {
                            setAnswers((p) => ({ ...p, email: e.target.value }));
                            setPlanError("");
                          }}
                          placeholder="you@example.com"
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>

                      {planError && (
                        <p role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
                          {planError}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={() => setPlanStep(3)} className="flex-1 rounded-xl">
                          Back
                        </Button>
                        <Button type="submit" disabled={saveStatus === "saving"} className="flex-1 rounded-xl">
                          {saveStatus === "saving" ? "Submitting…" : "Confirm & Send"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Plan Step 5: Confirmation Card */}
                  {planStep === 5 && (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-emerald-500/40 bg-card p-4 shadow-xs text-card-foreground">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-serif font-bold text-base mb-1">
                          <Check className="h-5 w-5" />
                          <span>Thank You, {answers.name}!</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your holiday enquiry for {answers.destination} has been sent to our Goregaon West team.
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Destination</span>
                            <span className="font-semibold text-foreground">{answers.destination}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Travel Date</span>
                            <span className="font-semibold text-foreground">{answers.date}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Travellers</span>
                            <span className="font-semibold text-foreground">{answers.people} Guests</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Hotel &amp; Food</span>
                            <span className="font-semibold text-foreground">{answers.hotel} · Veg</span>
                          </div>
                        </div>
                      </div>

                      <Button asChild className="w-full h-10 rounded-xl">
                        <a
                          href={waLink(
                            createWhatsAppMessage(
                              answers.destination || "Tour",
                              5,
                              Number(answers.people || 2),
                              answers.hotel || "4★",
                              "Quote requested"
                            )
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          <span>Connect on WhatsApp</span>
                        </a>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={downloadPdfSummary}
                        className="w-full h-9 rounded-xl text-xs font-semibold"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        <span>Download PDF Summary</span>
                      </Button>
                    </div>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 7: VISA SERVICES */}
              {currentView === "visa" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">Yes! We provide complete Visa Services.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our Goregaon West documentation desk assists with tourist visas for Schengen (Europe), UK, Dubai (UAE), USA, Japan, Singapore, Thailand, Vietnam, and 40+ countries.
                    </p>
                  </BotBubble>

                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
                    <h3 className="font-serif font-bold text-sm text-foreground">Visa Support Desk</h3>
                    <p className="text-xs text-muted-foreground">
                      Document checklists, appointment booking, fee verification, and doorstep assistance across Mumbai.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button asChild className="h-9 text-xs font-semibold rounded-xl">
                        <a href={waLink("Hello Jain Tours, I need visa consultation for my upcoming international travel.")} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span>Ask on WhatsApp</span>
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="h-9 text-xs font-semibold rounded-xl">
                        <a href={`tel:${BRAND.phoneDigits}`}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          <span>Call Visa Desk</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 8: FLIGHT BOOKINGS */}
              {currentView === "flights" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">Yes! We book Domestic &amp; International Flights.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Competitive group fares, preferred Indian &amp; international carriers, meal selection (Jain food guaranteed on flights), and baggage assistance.
                    </p>
                  </BotBubble>

                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
                    <h3 className="font-serif font-bold text-sm text-foreground">Flight Ticket Ticketing Desk</h3>
                    <p className="text-xs text-muted-foreground">
                      Tell our ticketing team your travel dates and passenger count for instant discounted airfare quotes.
                    </p>
                    <Button asChild className="w-full h-9 text-xs font-semibold rounded-xl">
                      <a href={waLink("Hello Jain Tours, I need a flight quote from Mumbai.")} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        <span>Enquire Flight Fares on WhatsApp</span>
                      </a>
                    </Button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 9: GROUP TOURS */}
              {currentView === "groups" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">Specialized Group &amp; Family Tours</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We organize customized group holidays for family unions, senior citizen groups, community clubs, and corporate retreats with private coaches and pure vegetarian kitchen caravans where required.
                    </p>
                  </BotBubble>

                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
                    <h3 className="font-serif font-bold text-sm text-foreground">Group Tour Specialists</h3>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, party: "Friends" }));
                          triggerAction("plan", "Plan a group tour");
                        }}
                        className="h-9 text-xs font-semibold rounded-xl"
                      >
                        <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                        <span>Plan Group Trip</span>
                      </Button>
                      <Button asChild variant="outline" className="h-9 text-xs font-semibold rounded-xl">
                        <a href={waLink("Hello Jain Tours, I'd like to organize a group tour.")} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span>WhatsApp Team</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 10: TALK TO OUR TEAM */}
              {currentView === "team" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <BotBubble time={userQueryTime || getNowTime()}>
                    <p className="font-semibold text-foreground">We'd love to assist you directly!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our travel designers are available 7 days a week at our Goregaon West office.
                    </p>
                  </BotBubble>

                  <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Direct Phone</span>
                        <a href={`tel:${BRAND.phoneDigits}`} className="block text-foreground font-bold hover:text-primary">
                          {BRAND.phoneDisplay}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border/50 pt-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">WhatsApp Desk</span>
                        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="block text-foreground font-bold hover:text-primary">
                          +91 98212 35678 (Fastest Response)
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border/50 pt-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Email</span>
                        <a href={`mailto:${BRAND.email}`} className="block text-foreground font-bold hover:text-primary truncate">
                          {BRAND.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-border/50 pt-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Office Address</span>
                        <p className="text-foreground leading-relaxed">
                          {BRAND.address}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button asChild className="h-9 text-xs font-semibold rounded-xl">
                        <a href={`tel:${BRAND.phoneDigits}`}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          <span>Call Office</span>
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="h-9 text-xs font-semibold rounded-xl">
                        <a href={waLink("Hello Jain Tours, I'd like to speak with a travel consultant.")} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetToMainMenu}
                      className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to Main Menu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Fixed Message Composer at Bottom */}
            <footer className="shrink-0 border-t border-border/80 bg-card/95 backdrop-blur-md px-3 pt-2.5 pb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComposerSend();
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor={composerInputId} className="sr-only">
                  Type your travel request
                </label>
                <input
                  id={composerInputId}
                  type="text"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder="Type your message…"
                  className="h-10 min-w-0 flex-1 rounded-full border border-input bg-background/90 px-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />

                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs hover:scale-105 active:scale-95 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Urgent Help Bar */}
              <div className="mt-1.5 text-center">
                <a
                  href={`tel:${BRAND.phoneDigits}`}
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <Phone className="h-3 w-3 text-gold" />
                  <span>Need urgent help? Call our Goregaon office ({BRAND.phoneDisplay})</span>
                </a>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
};

export default HolidayPlanner;
