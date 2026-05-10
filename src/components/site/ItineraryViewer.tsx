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
import { FileText, Download, Loader2, X } from "lucide-react";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const publicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/itineraries/${path}`;

const ItineraryViewer = ({
  destinationSlug,
  destinationName,
}: {
  destinationSlug: string;
  destinationName: string;
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<Itinerary | null>(null);
  const [enquiryFor, setEnquiryFor] = useState<Itinerary | null>(null);
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
    if (unlockedIds.has(it.id)) {
      setActiveView(it);
    } else {
      setEnquiryFor(it);
    }
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
    const opened = enquiryFor;
    setUnlockedIds((s) => new Set(s).add(opened.id));
    setEnquiryFor(null);
    setActiveView(opened);
    setEnquiry({ name: "", phone: "", email: "", travel_dates: "", travellers: "", budget_per_person: "" });
    toast({ title: "Thank you", description: "Opening your itinerary now." });
  };

  return (
    <section className="bg-background border-t border-border/60 py-16 md:py-24">
      <div className="container">
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
          <div className="grid md:grid-cols-2 gap-px bg-border/60">
            {items.map((it) => (
              <div key={it.id} className="bg-card p-5 md:p-7 flex items-center gap-4 md:gap-5">
                <FileText className="w-6 h-6 text-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{it.title}</p>
                  <p className="text-xs text-muted-foreground tracking-luxe uppercase mt-1">
                    PDF{it.file_size ? ` · ${(it.file_size / 1024 / 1024).toFixed(2)} MB` : ""}
                  </p>
                </div>
                <button
                  onClick={() => openItinerary(it)}
                  className="text-xs uppercase tracking-luxe px-3 py-2 md:px-4 md:py-2.5 border border-gold/60 text-gold hover:bg-gold/10 transition shrink-0"
                >
                  {unlockedIds.has(it.id) ? "View" : "Preview"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enquiry gate dialog */}
      <Dialog open={!!enquiryFor} onOpenChange={(o) => !o && setEnquiryFor(null)}>
        <DialogContent className="max-w-lg w-[95vw] bg-card border-border/60">
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
                  "View itinerary"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF viewer dialog */}
      <Dialog open={!!activeView} onOpenChange={(o) => !o && setActiveView(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-card border-border/60 flex flex-col">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border/60 shrink-0">
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
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                </a>
              )}
              <button
                onClick={() => setActiveView(null)}
                className="p-2 text-foreground/70 hover:text-foreground"
                aria-label="Close"
              >
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
    </section>
  );
};

export default ItineraryViewer;
