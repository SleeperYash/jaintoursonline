import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/site/SiteLayout";
import ItineraryDetailView from "@/components/site/ItineraryDetailView";
import { findDestination } from "@/data/destinations";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import { useSeo } from "@/hooks/useSeo";
import { slugify } from "@/lib/slug";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
};

const ItineraryDetailPage = () => {
  const { slug = "", itinerarySlug = "" } = useParams();
  const d = findDestination(slug);
  const { coverUrl } = useDestinationImages(slug);
  const heroPhoto = coverUrl ?? d?.image;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Itinerary | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(false);
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
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("itineraries")
        .select("id,title,file_path")
        .eq("destination_slug", slug);
      if (cancelled) return;
      const match = (data ?? []).find((it) => slugify(it.title) === itinerarySlug);
      if (!match) {
        setNotFound(true);
      } else {
        setItem(match);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, itinerarySlug]);

  useSeo({
    title: item ? `${item.title} — ${d?.name ?? "Itinerary"}` : "Itinerary",
    description: d?.overview ?? "Curated itinerary by Jain Tours & Travels.",
    canonicalPath: `/destinations/${slug}/${itinerarySlug}`,
    ogImage: heroPhoto,
  });

  if (!d) return <Navigate to="/destinations" replace />;
  if (notFound) return <Navigate to={`/destinations/${slug}`} replace />;

  const requestDownload = () => {
    if (!item) return;
    const lead = getSavedLead();
    if (lead) {
      triggerDownload(publicUrl(item.file_path), `${item.title}.pdf`);
      return;
    }
    setPendingDownload(true);
    setEnquiryOpen(true);
  };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!enquiry.name.trim() || !enquiry.phone.trim() || !enquiry.email.trim()) {
      toast({ title: "Please fill name, phone and email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      name: enquiry.name.trim(),
      phone: enquiry.phone.trim(),
      email: enquiry.email.trim(),
      destination_slug: slug,
      destination_name: d.name,
      itinerary_id: item.id,
      itinerary_title: item.title,
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
    setEnquiryOpen(false);
    if (pendingDownload) {
      triggerDownload(publicUrl(item.file_path), `${item.title}.pdf`);
      setPendingDownload(false);
      toast({ title: "Thank you", description: "Your download is starting." });
    } else {
      toast({ title: "Thank you", description: "We'll be in touch shortly." });
    }
    setEnquiry({ name: "", phone: "", email: "", travel_dates: "", travellers: "", budget_per_person: "" });
  };

  return (
    <SiteLayout>
      <div className="container pt-24 md:pt-28">
        <Link
          to={`/destinations/${slug}`}
          className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {d.name}
        </Link>
      </div>

      {loading ? (
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : item ? (
        <ItineraryDetailView
          itineraryId={item.id}
          title={item.title}
          pdfUrl={publicUrl(item.file_path)}
          heroImage={heroPhoto}
          destinationName={d.name}
          onDownload={requestDownload}
          onEnquire={() => {
            setPendingDownload(false);
            setEnquiryOpen(true);
          }}
        />
      ) : null}

      <Dialog open={enquiryOpen} onOpenChange={(o) => !o && setEnquiryOpen(false)}>
        <DialogContent className="max-w-lg w-[95vw] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              {pendingDownload ? "A few details before download" : "A few details first"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Share these so our travel desk can tailor {item?.title} to your party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEnquiry} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Full name *</Label>
              <Input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} className="mt-2" maxLength={100} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Phone *</Label>
              <Input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} className="mt-2" maxLength={20} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Email *</Label>
              <Input type="email" value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} className="mt-2" maxLength={255} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Travel dates</Label>
              <Input value={enquiry.travel_dates} onChange={(e) => setEnquiry({ ...enquiry, travel_dates: e.target.value })} className="mt-2" placeholder="e.g. Dec 15–22" maxLength={60} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">No. of travellers</Label>
              <Input value={enquiry.travellers} onChange={(e) => setEnquiry({ ...enquiry, travellers: e.target.value })} className="mt-2" placeholder="e.g. 2 adults" maxLength={40} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">Budget per person (₹)</Label>
              <Input value={enquiry.budget_per_person} onChange={(e) => setEnquiry({ ...enquiry, budget_per_person: e.target.value })} className="mt-2" placeholder="e.g. ₹1,50,000" maxLength={40} />
            </div>
            <div className="col-span-2 mt-2">
              <Button type="submit" disabled={submitting} className="w-full bg-gold text-primary-foreground hover:bg-gold/90">
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>) : (pendingDownload ? "Submit & download PDF" : "Submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
};

export default ItineraryDetailPage;