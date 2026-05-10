import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, X, FileText, Loader2, Phone, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BRAND, waLink } from "@/lib/brand";
import type { GlobeDestination } from "@/data/globeDestinations";
import { cn } from "@/lib/utils";

interface Itinerary {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/itineraries/${path}`;

interface Props {
  destination: GlobeDestination | null;
  open: boolean;
  onClose: () => void;
}

const DestinationPanel = ({ destination, open, onClose }: Props) => {
  const { toast } = useToast();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // Enquiry gate
  const [enquiryFor, setEnquiryFor] = useState<Itinerary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: "", phone: "", email: "",
    travel_dates: "", travellers: "", budget_per_person: "",
  });

  // PDF view dialog
  const [activeView, setActiveView] = useState<Itinerary | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch itineraries for selected destination
  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("itineraries")
      .select("id,title,file_path,file_size")
      .eq("destination_slug", destination.slug)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data ?? []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [destination?.slug]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!destination) return null;

  const openItinerary = (it: Itinerary) => {
    if (unlockedIds.has(it.id)) setActiveView(it);
    else setEnquiryFor(it);
  };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryFor) return;
    if (!enquiry.name.trim() || !enquiry.phone.trim() || !enquiry.email.trim()) {
      toast({ title: "Please fill name, phone and email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      name: enquiry.name.trim(),
      phone: enquiry.phone.trim(),
      email: enquiry.email.trim(),
      destination_slug: destination.slug,
      destination_name: destination.name,
      itinerary_id: enquiryFor.id,
      itinerary_title: enquiryFor.title,
      travel_dates: enquiry.travel_dates.trim() || null,
      travellers: enquiry.travellers.trim() || null,
      budget_per_person: enquiry.budget_per_person.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      return;
    }
    const opened = enquiryFor;
    setUnlockedIds((s) => new Set(s).add(opened.id));
    setEnquiryFor(null);
    setActiveView(opened);
    setEnquiry({ name: "", phone: "", email: "", travel_dates: "", travellers: "", budget_per_person: "" });
    toast({ title: "Thank you", description: "Opening your itinerary now." });
  };

  return (
    <>
      {/* Backdrop on mobile only */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label={`${destination.name} details`}
        className={cn(
          "fixed z-40 bg-card border-gold/30 shadow-luxe transition-transform duration-500 ease-out",
          // Desktop: right-side panel
          "md:top-24 md:right-4 md:bottom-6 md:w-[420px] md:border md:rounded",
          open ? "md:translate-x-0" : "md:translate-x-[110%]",
          // Mobile: bottom sheet
          "left-0 right-0 bottom-0 max-h-[85vh] border-t border-x rounded-t-xl",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="relative flex flex-col h-full max-h-[85vh] md:max-h-none">
          {/* Hero image */}
          <div className="relative h-44 md:h-52 overflow-hidden rounded-t-xl md:rounded-t">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close panel"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink/70 text-foreground hover:bg-gold hover:text-primary-foreground transition-colors flex items-center justify-center backdrop-blur"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-12">
              <p className="text-[10px] tracking-luxe uppercase text-gold mb-1">{destination.region} · {destination.country}</p>
              <h2 className="font-serif text-3xl text-foreground leading-tight">{destination.name}</h2>
            </div>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-6">
            <p className="font-serif italic text-foreground/80 text-base leading-relaxed">
              "{destination.tagline}"
            </p>

            <div className="grid grid-cols-2 gap-px bg-border/60">
              <div className="bg-card p-4">
                <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mb-1">Duration</p>
                <p className="font-serif text-lg text-gold">{destination.duration}</p>
              </div>
              <div className="bg-card p-4">
                <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mb-1">Region</p>
                <p className="font-serif text-lg text-foreground">{destination.region}</p>
              </div>
            </div>

            {/* Itineraries */}
            <div>
              <p className="text-[10px] uppercase tracking-luxe text-gold mb-3">Sample itineraries</p>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="border border-dashed border-border/60 p-5 text-center">
                  <FileText className="w-6 h-6 text-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-foreground/60 font-light mb-3">
                    No sample itineraries here yet — request one and we'll prepare it.
                  </p>
                  <a
                    href={waLink(`Hi Jain Tours, please share an itinerary for ${destination.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold/60 text-gold text-[11px] uppercase tracking-luxe hover:bg-gold/10 transition"
                  >
                    Request itinerary
                  </a>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 border border-border/60 p-3">
                      <FileText className="w-4 h-4 text-gold shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{it.title}</p>
                        <p className="text-[10px] uppercase tracking-luxe text-foreground/50">
                          PDF{it.file_size ? ` · ${(it.file_size / 1024 / 1024).toFixed(2)} MB` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => openItinerary(it)}
                        className="shrink-0 text-[10px] uppercase tracking-luxe px-3 py-2 border border-gold/60 text-gold hover:bg-gold/10 transition"
                      >
                        {unlockedIds.has(it.id) ? "View" : "Preview"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sticky footer */}
          <div className="border-t border-border/60 p-4 md:p-5 bg-card flex flex-col sm:flex-row gap-2">
            <Link
              to={`/destinations/${destination.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition"
            >
              Plan This Journey <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${BRAND.phoneDigits}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-foreground/30 text-foreground/80 text-xs uppercase tracking-luxe hover:border-gold hover:text-gold transition"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        </div>
      </aside>

      {/* Enquiry gate dialog */}
      <Dialog open={!!enquiryFor} onOpenChange={(o) => !o && setEnquiryFor(null)}>
        <DialogContent className="max-w-lg bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              A few details first
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Share these so our travel desk can tailor {enquiryFor?.title} to your party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEnquiry} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Full name *</Label>
              <Input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} className="mt-2" maxLength={100} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Phone *</Label>
              <Input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} className="mt-2" maxLength={20} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Email *</Label>
              <Input type="email" value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} className="mt-2" maxLength={255} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Travel dates</Label>
              <Input value={enquiry.travel_dates} onChange={(e) => setEnquiry({ ...enquiry, travel_dates: e.target.value })} className="mt-2" placeholder="e.g. Dec 15–22" maxLength={60} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Travellers</Label>
              <Input value={enquiry.travellers} onChange={(e) => setEnquiry({ ...enquiry, travellers: e.target.value })} className="mt-2" placeholder="e.g. 2 adults" maxLength={40} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Budget per person (₹)</Label>
              <Input value={enquiry.budget_per_person} onChange={(e) => setEnquiry({ ...enquiry, budget_per_person: e.target.value })} className="mt-2" placeholder="e.g. ₹1,50,000" maxLength={40} />
            </div>
            <div className="col-span-2 mt-1">
              <Button type="submit" disabled={submitting} className="w-full bg-gold text-primary-foreground hover:bg-gold/90">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "View itinerary"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF view dialog */}
      <Dialog open={!!activeView} onOpenChange={(o) => !o && setActiveView(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-card border-border/60 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-gold shrink-0" />
              <p className="text-sm text-foreground truncate pr-4">{activeView?.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {activeView && (
                <a
                  href={publicUrl(activeView.file_path)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/80 hover:text-gold px-3 py-2"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
              <button onClick={() => setActiveView(null)} className="p-2 text-foreground/70 hover:text-foreground" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {activeView && (
            <iframe
              key={activeView.id}
              src={`${publicUrl(activeView.file_path)}#toolbar=0&navpanes=0`}
              title={activeView.title}
              className="w-full flex-1 bg-background"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DestinationPanel;
