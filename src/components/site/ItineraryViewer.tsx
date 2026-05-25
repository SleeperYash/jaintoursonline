import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Loader2, ChevronLeft } from "lucide-react";
import ItineraryDetailView from "./ItineraryDetailView";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const publicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/itineraries/${path}`;

const LEAD_KEY = "vt_itinerary_lead";
const getSavedLead = () => {
  try {
    const raw = localStorage.getItem(LEAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const ItineraryViewer = ({
  destinationSlug,
  destinationName,
  fallbackImage,
}: {
  destinationSlug: string;
  destinationName: string;
  fallbackImage?: string;
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState<Itinerary | null>(null);
  const [enquiryFor, setEnquiryFor] = useState<Itinerary | null>(null);
  const [pendingDownload, setPendingDownload] = useState<Itinerary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    travel_dates: "",
    travellers: "",
    budget_per_person: "",
  });

  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("itineraries")
        .select("id,title,file_path,file_size")
        .eq("destination_slug", destinationSlug)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setItems(data ?? []);
        setLoading(false);
      }
    };
    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [destinationSlug]);

  const openItinerary = (it: Itinerary) => {
    setActiveView(it);
    // Smooth scroll to detail section after render
    setTimeout(() => {
      document
        .getElementById("itinerary-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const requestDownload = (it: Itinerary) => {
    const lead = getSavedLead();
    if (lead) {
      triggerDownload(publicUrl(it.file_path), `${it.title}.pdf`);
      return;
    }
    setPendingDownload(it);
    setEnquiryFor(it);
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
      destination_slug: destinationSlug,
      destination_name: destinationName,
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
    try {
      localStorage.setItem(
        LEAD_KEY,
        JSON.stringify({
          name: enquiry.name.trim(),
          phone: enquiry.phone.trim(),
          email: enquiry.email.trim(),
          savedAt: Date.now(),
        }),
      );
    } catch {
      /* ignore */
    }
    const target = pendingDownload;
    setEnquiryFor(null);
    if (target) {
      triggerDownload(publicUrl(target.file_path), `${target.title}.pdf`);
      setPendingDownload(null);
      toast({ title: "Thank you", description: "Your download is starting." });
    } else {
      toast({ title: "Thank you", description: "We'll be in touch shortly." });
    }
    setEnquiry({ name: "", phone: "", email: "", travel_dates: "", travellers: "", budget_per_person: "" });
  };

  return (
    <section className="bg-background border-t border-border/60 py-16 md:py-24">
      <div className="container">
        {activeView ? (
          <div id="itinerary-detail" className="mb-8 md:mb-10">
            <button
              onClick={() => {
                setActiveView(null);
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
              }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" /> Back to itineraries
            </button>
            <ItineraryDetailView
              key={activeView.id}
              itineraryId={activeView.id}
              title={activeView.title}
              pdfUrl={publicUrl(activeView.file_path)}
              heroImage={fallbackImage}
              destinationName={destinationName}
              onDownload={() => requestDownload(activeView)}
              onEnquire={() => setEnquiryFor(activeView)}
            />
          </div>
        ) : (
          <>
        <div className="mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-luxe text-gold mb-3 md:mb-4">Sample itineraries</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-3">
            {destinationName} itineraries
          </h2>
          <p className="text-muted-foreground font-light max-w-xl">
            Curated PDFs prepared by our travel desk. Share a few details to preview & download.
          </p>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
        ) : items.length === 0 ? (
          <div className="border border-dashed border-border/60 p-8 md:p-12 text-center rounded-md">
            <FileText className="w-8 h-8 text-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light">
              No sample itineraries uploaded for {destinationName} yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {items.map((it) => {
              const nightsMatch = it.title.match(/(\d+\s*N\s*\/?\s*\d*\s*D?)/i);
              const nightsBadge = nightsMatch ? nightsMatch[0].replace(/\s+/g, "").toUpperCase() : null;
              const subtitleMatch = it.title.match(/\d+\s*N\s+(.+)/i);
              const subtitle = subtitleMatch ? subtitleMatch[1].trim() : destinationName;
              return (
                <button
                  key={it.id}
                  onClick={() => openItinerary(it)}
                  className="group text-left bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-gold/40 hover:shadow-luxe transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={fallbackImage ?? "/placeholder.svg"}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 md:p-5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base md:text-lg text-foreground leading-tight truncate">
                        {it.title}
                      </p>
                      <p className="text-xs md:text-sm text-foreground/60 mt-1 truncate">{subtitle}</p>
                    </div>
                    {nightsBadge && (
                      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md border border-gold/50 text-gold text-[11px] font-medium tracking-wide">
                        {nightsBadge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {/* Enquiry gate dialog */}
      <Dialog open={!!enquiryFor} onOpenChange={(o) => !o && setEnquiryFor(null)}>
        <DialogContent className="max-w-lg w-[95vw] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              {pendingDownload ? "A few details before download" : "A few details first"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Share these so our travel desk can tailor {enquiryFor?.title} to your party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEnquiry} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Full name *</Label>
              <Input
                value={enquiry.name}
                onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                className="mt-2"
                maxLength={100}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Phone *</Label>
              <Input
                value={enquiry.phone}
                onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                className="mt-2"
                maxLength={20}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Email *</Label>
              <Input
                type="email"
                value={enquiry.email}
                onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                className="mt-2"
                maxLength={255}
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Travel dates</Label>
              <Input
                value={enquiry.travel_dates}
                onChange={(e) => setEnquiry({ ...enquiry, travel_dates: e.target.value })}
                className="mt-2"
                placeholder="e.g. Dec 15–22"
                maxLength={60}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">No. of travellers</Label>
              <Input
                value={enquiry.travellers}
                onChange={(e) => setEnquiry({ ...enquiry, travellers: e.target.value })}
                className="mt-2"
                placeholder="e.g. 2 adults"
                maxLength={40}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                Budget per person (₹)
              </Label>
              <Input
                value={enquiry.budget_per_person}
                onChange={(e) => setEnquiry({ ...enquiry, budget_per_person: e.target.value })}
                className="mt-2"
                placeholder="e.g. ₹1,50,000"
                maxLength={40}
              />
            </div>
            <div className="col-span-2 mt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-primary-foreground hover:bg-gold/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
                  </>
                ) : (
                  pendingDownload ? "Submit & download PDF" : "Submit"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </section>
  );
};

export default ItineraryViewer;
