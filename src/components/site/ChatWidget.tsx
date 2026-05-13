import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, MapPin, Hotel, Check, FileDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { waLink, BRAND } from "@/lib/brand";
import jsPDF from "jspdf";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Msg = { role: "user" | "assistant"; content: string };
type Pkg = {
  destination: string;
  title: string;
  tagline?: string;
  duration: string;
  travellers?: string;
  departureCity?: string;
  tripType?: string;
  estimatedPricePerPerson: string;
  totalEstimate?: string;
  overview: string;
  days: { day: number; title: string; description: string; activities?: string[] }[];
  hotelSuggestions?: string[];
  inclusions: string[];
  exclusions: string[];
  matchedItinerary?: string;
};

const INTRO: Msg = {
  role: "assistant",
  content:
    "Namaste! 🙏 I'm Yatra, your travel concierge from Jain Tours. I'll craft a custom package for you in under a minute. To start — which destination is calling you?",
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INTRO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [leadId, setLeadId] = useState<string | undefined>(undefined);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pkg, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/travel-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ messages: next, leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Chat error");
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "..." }]);
      if (data.package) setPkg(data.package);
      if (data.leadId) setLeadId(data.leadId);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Sorry — ${e.message}. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pkg) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;
    const pageW = doc.internal.pageSize.getWidth();
    const wrap = (t: string, size = 11, gap = 4) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(t, pageW - margin * 2);
      lines.forEach((ln: string) => {
        if (y > 780) { doc.addPage(); y = margin; }
        doc.text(ln, margin, y);
        y += size + gap;
      });
    };
    doc.setFont("helvetica", "bold"); wrap(pkg.title, 18, 6);
    doc.setFont("helvetica", "normal"); wrap(pkg.tagline ?? pkg.destination, 11, 8);
    wrap(`Duration: ${pkg.duration}`, 11);
    if (pkg.travellers) wrap(`Travellers: ${pkg.travellers}`, 11);
    if (pkg.departureCity) wrap(`Departure: ${pkg.departureCity}`, 11);
    wrap(`Estimated: ${pkg.estimatedPricePerPerson}${pkg.totalEstimate ? ` (Total: ${pkg.totalEstimate})` : ""}`, 11, 10);
    doc.setFont("helvetica", "bold"); wrap("Overview", 13, 4);
    doc.setFont("helvetica", "normal"); wrap(pkg.overview, 11, 10);
    doc.setFont("helvetica", "bold"); wrap("Day-wise Plan", 13, 4);
    doc.setFont("helvetica", "normal");
    pkg.days.forEach((d) => {
      doc.setFont("helvetica", "bold"); wrap(`Day ${d.day} — ${d.title}`, 11, 2);
      doc.setFont("helvetica", "normal"); wrap(d.description, 11, 2);
      if (d.activities?.length) wrap(`• ${d.activities.join("  • ")}`, 10, 6);
    });
    if (pkg.hotelSuggestions?.length) {
      doc.setFont("helvetica", "bold"); wrap("Hotel Suggestions", 13, 4);
      doc.setFont("helvetica", "normal");
      pkg.hotelSuggestions.forEach((h) => wrap(`• ${h}`, 11));
      y += 4;
    }
    doc.setFont("helvetica", "bold"); wrap("Inclusions", 13, 4);
    doc.setFont("helvetica", "normal");
    pkg.inclusions.forEach((i) => wrap(`✓ ${i}`, 11));
    y += 4;
    doc.setFont("helvetica", "bold"); wrap("Exclusions", 13, 4);
    doc.setFont("helvetica", "normal");
    pkg.exclusions.forEach((i) => wrap(`✗ ${i}`, 11));
    y += 8;
    doc.setFont("helvetica", "italic"); wrap(`Crafted by ${BRAND.name} • ${BRAND.phone}`, 10);
    doc.save(`${pkg.title.replace(/\s+/g, "_")}.pdf`);
  };

  const bookOnWhatsApp = () => {
    const msg = pkg
      ? `Hi! I'd like to book the "${pkg.title}" package (${pkg.duration}, ${pkg.estimatedPricePerPerson}). Please share next steps.`
      : "Hi! I'd like to plan a trip with Jain Tours.";
    window.open(waLink(msg), "_blank", "noopener");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open travel chat"
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full gradient-gold shadow-gold flex items-center justify-center text-ink hover:scale-110 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[hsl(140_60%_45%)] animate-pulse" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-44 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[420px] h-[70vh] sm:h-[600px] max-h-[640px] bg-background border border-gold/30 rounded-2xl shadow-luxe flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-ink text-background flex items-center gap-3 border-b border-gold/20">
            <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold tracking-wide">Yatra · Travel Concierge</div>
              <div className="text-[11px] opacity-70">Usually replies in seconds</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="opacity-70 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-ink text-background rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}

            {pkg && <PackageCard pkg={pkg} onBook={bookOnWhatsApp} onPdf={downloadPdf} />}
          </div>

          {/* Input */}
          <div className="border-t border-border p-2.5 bg-background flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your reply..."
              className="flex-1 h-10"
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-10 w-10 bg-gold hover:bg-gold/90 text-ink">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const PackageCard = ({ pkg, onBook, onPdf }: { pkg: Pkg; onBook: () => void; onPdf: () => void }) => (
  <div className="rounded-2xl border border-gold/40 bg-background shadow-gold overflow-hidden">
    <div className="bg-ink text-background px-4 py-3">
      <div className="text-[10px] uppercase tracking-luxe text-gold mb-0.5">Custom Package</div>
      <div className="font-semibold text-base leading-snug">{pkg.title}</div>
      {pkg.tagline && <div className="text-xs opacity-80 mt-0.5">{pkg.tagline}</div>}
    </div>
    <div className="p-4 space-y-3 text-sm">
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <Pill icon={<MapPin className="w-3 h-3" />}>{pkg.destination}</Pill>
        <Pill>{pkg.duration}</Pill>
        {pkg.tripType && <Pill>{pkg.tripType}</Pill>}
        {pkg.travellers && <Pill>{pkg.travellers}</Pill>}
      </div>
      <p className="text-foreground/80 leading-relaxed">{pkg.overview}</p>

      <div>
        <div className="text-[11px] uppercase tracking-luxe text-gold mb-1.5">Day-by-day</div>
        <div className="space-y-1.5">
          {pkg.days.map((d) => (
            <div key={d.day} className="text-xs">
              <span className="font-semibold">Day {d.day} — {d.title}:</span>{" "}
              <span className="text-foreground/75">{d.description}</span>
            </div>
          ))}
        </div>
      </div>

      {pkg.hotelSuggestions?.length ? (
        <div>
          <div className="text-[11px] uppercase tracking-luxe text-gold mb-1.5 flex items-center gap-1">
            <Hotel className="w-3 h-3" /> Hotel suggestions
          </div>
          <ul className="text-xs space-y-0.5 text-foreground/80">
            {pkg.hotelSuggestions.map((h, i) => <li key={i}>• {h}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-luxe text-gold mb-1">Includes</div>
          <ul className="text-xs space-y-0.5">
            {pkg.inclusions.slice(0, 6).map((i, idx) => (
              <li key={idx} className="flex gap-1.5"><Check className="w-3 h-3 text-[hsl(140_60%_45%)] shrink-0 mt-0.5" />{i}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-luxe text-gold mb-1">Excludes</div>
          <ul className="text-xs space-y-0.5 text-foreground/70">
            {pkg.exclusions.slice(0, 5).map((i, idx) => <li key={idx}>– {i}</li>)}
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <div className="text-[10px] uppercase tracking-luxe text-muted-foreground">Estimated pricing</div>
        <div className="font-semibold text-base text-ink">{pkg.estimatedPricePerPerson}</div>
        {pkg.totalEstimate && <div className="text-xs text-muted-foreground">Total: {pkg.totalEstimate}</div>}
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1">
        <Button onClick={onBook} className="w-full bg-gold hover:bg-gold/90 text-ink font-semibold">
          Book Now
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onBook} variant="outline" className="border-[hsl(140_60%_38%)] text-[hsl(140_60%_30%)] hover:bg-[hsl(140_60%_38%)]/10">
            <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp
          </Button>
          <Button onClick={onPdf} variant="outline">
            <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const Pill = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-foreground/80 border border-border">
    {icon}{children}
  </span>
);

export default ChatWidget;
