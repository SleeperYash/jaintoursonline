import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64, adminPublicUrl } from "@/hooks/useAdminAuth";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { destinations } from "@/data/destinations";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X as XIcon,
  Hotel,
  Calendar,
  Sparkles,
  Info,
  Save,
} from "lucide-react";

type DayItem = {
  id?: string;
  day_number: number;
  title: string;
  description: string;
};

type HotelItem = {
  id?: string;
  city: string;
  hotel_name: string;
  nights: number | null;
};

type DayImageRecord = {
  id: string;
  day_number: number;
  position: number;
  file_path: string;
  alt_text: string;
};

type ItineraryData = {
  id: string;
  title: string;
  destination_slug: string;
  destination: string | null;
  duration: string | null;
  starting_price: string | null;
  overview: string | null;
  highlights: string[];
  visa_information: string | null;
  terms_conditions: string | null;
  days: DayItem[];
  hotels: HotelItem[];
  inclusions: string[];
  exclusions: string[];
  day_images: DayImageRecord[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryId: string | null;
  destinationSlug: string;
  destinationName: string;
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onSaved?: () => void;
};

export const ItineraryEditorDrawer = ({
  open,
  onOpenChange,
  itineraryId,
  destinationSlug,
  destinationName,
  callAdmin,
  onSaved,
}: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [overview, setOverview] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [days, setDays] = useState<DayItem[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [termsConditions, setTermsConditions] = useState("");
  const [dayImages, setDayImages] = useState<DayImageRecord[]>([]);

  // Active tab inside drawer for clean organization
  const [activeTab, setActiveTab] = useState<"overview" | "days" | "hotels" | "inclusions" | "terms">("days");

  const [currentDestSlug, setCurrentDestSlug] = useState(destinationSlug || "bali");
  const [currentDestName, setCurrentDestName] = useState(destinationName || "Bali");

  useEffect(() => {
    if (destinationSlug) setCurrentDestSlug(destinationSlug);
    if (destinationName) setCurrentDestName(destinationName);
  }, [destinationSlug, destinationName]);

  // Destination gallery images for fallbacks
  const { images: destImages } = useDestinationImages(currentDestSlug);
  const photoPool = useMemo(() => {
    const pool: string[] = [];
    destImages.forEach((img) => {
      const url = adminPublicUrl(img.file_path);
      if (url && !pool.includes(url)) pool.push(url);
    });
    const dest = destinations.find((d) => d.slug === currentDestSlug);
    (dest?.gallery ?? []).forEach((url) => {
      if (url && !pool.includes(url)) pool.push(url);
    });
    if (dest?.image && !pool.includes(dest.image)) pool.push(dest.image);
    return pool;
  }, [destImages, currentDestSlug]);

  // Uploading state per slot: "day-1-pos-0"
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // Load itinerary data whenever drawer opens or itineraryId changes
  useEffect(() => {
    if (!open || !itineraryId) return;

    let cancelled = false;
    const fetchItin = async () => {
      setLoading(true);
      try {
        const [itinRes, daysRes, hotelsRes, incRes, excRes, imagesRes] = await Promise.all([
          supabase
            .from("itineraries")
            .select("id,title,destination_slug,destination,duration,starting_price,overview,visa_information,terms_conditions,parsed_data")
            .eq("id", itineraryId)
            .maybeSingle(),
          supabase
            .from("itinerary_days")
            .select("id,day_number,title,description")
            .eq("itinerary_id", itineraryId)
            .order("day_number", { ascending: true }),
          supabase
            .from("itinerary_hotels")
            .select("id,city,hotel_name,nights,position")
            .eq("itinerary_id", itineraryId)
            .order("position", { ascending: true }),
          supabase
            .from("itinerary_inclusions")
            .select("id,inclusion_text,position")
            .eq("itinerary_id", itineraryId)
            .order("position", { ascending: true }),
          supabase
            .from("itinerary_exclusions")
            .select("id,exclusion_text,position")
            .eq("itinerary_id", itineraryId)
            .order("position", { ascending: true }),
          supabase
            .from("itinerary_day_images")
            .select("id,day_number,position,file_path,alt_text")
            .eq("itinerary_id", itineraryId)
            .order("position", { ascending: true }),
        ]);

        if (cancelled) return;

        if (itinRes.error) throw itinRes.error;
        if (!itinRes.data) throw new Error("Itinerary not found");

        const itin = itinRes.data;
        const parsedData = (itin.parsed_data ?? {}) as Record<string, unknown>;
        const highlightsList = Array.isArray(parsedData.highlights) ? (parsedData.highlights as string[]) : [];

        // Parse days: prefer relational rows, fallback to parsed_data
        let finalDays: DayItem[] = [];
        if (daysRes.data && daysRes.data.length > 0) {
          finalDays = daysRes.data.map((d) => ({
            id: d.id,
            day_number: d.day_number,
            title: d.title,
            description: d.description,
          }));
        } else if (Array.isArray(parsedData.days) && parsedData.days.length > 0) {
          finalDays = (parsedData.days as Record<string, unknown>[]).map((d, idx) => ({
            day_number: typeof d.dayNumber === "number" ? d.dayNumber : (typeof d.day_number === "number" ? d.day_number : idx + 1),
            title: typeof d.title === "string" ? d.title : `Day ${idx + 1}`,
            description: typeof d.description === "string" ? d.description : (typeof d.body === "string" ? d.body : ""),
          }));
        }

        // Parse hotels: prefer relational rows, fallback to parsed_data
        let finalHotels: HotelItem[] = [];
        if (hotelsRes.data && hotelsRes.data.length > 0) {
          finalHotels = hotelsRes.data.map((h) => ({
            id: h.id,
            city: h.city,
            hotel_name: h.hotel_name,
            nights: h.nights,
          }));
        } else if (Array.isArray(parsedData.hotels) && parsedData.hotels.length > 0) {
          finalHotels = (parsedData.hotels as Record<string, unknown>[]).map((h) => ({
            city: typeof h.city === "string" ? h.city : "",
            hotel_name: typeof h.hotel_name === "string" ? h.hotel_name : (typeof h.name === "string" ? h.name : ""),
            nights: typeof h.nights === "number" ? h.nights : null,
          }));
        }

        // Parse inclusions
        let finalInclusions: string[] = [];
        if (incRes.data && incRes.data.length > 0) {
          finalInclusions = incRes.data.map((i) => i.inclusion_text);
        } else if (Array.isArray(parsedData.inclusions)) {
          finalInclusions = parsedData.inclusions.map(String);
        }

        // Parse exclusions
        let finalExclusions: string[] = [];
        if (excRes.data && excRes.data.length > 0) {
          finalExclusions = excRes.data.map((e) => e.exclusion_text);
        } else if (Array.isArray(parsedData.exclusions)) {
          finalExclusions = parsedData.exclusions.map(String);
        }

        if (itin.destination_slug) setCurrentDestSlug(itin.destination_slug);
        if (itin.destination) setCurrentDestName(itin.destination);

        setTitle(itin.title || "");
        setDuration(itin.duration || parsedData.duration || "");
        setStartingPrice(itin.starting_price || parsedData.starting_price || "");
        setOverview(itin.overview || parsedData.overview || "");
        setHighlights(highlightsList);
        setDays(finalDays);
        setHotels(finalHotels);
        setInclusions(finalInclusions);
        setExclusions(finalExclusions);
        setTermsConditions(itin.terms_conditions || parsedData.terms_conditions || "");
        setDayImages((imagesRes.data ?? []) as DayImageRecord[]);
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Could not load itinerary",
            description: (err as Error).message,
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchItin();
    return () => {
      cancelled = true;
    };
  }, [open, itineraryId, toast]);

  // Handle image upload for a specific day slot (position 0 or 1)
  const handleSlotFile = async (dayNumber: number, position: number, file: File) => {
    if (!itineraryId) return;
    const slotKey = `day-${dayNumber}-pos-${position}`;
    setUploadingSlot(slotKey);
    try {
      const file_base64 = await fileToBase64(file);
      // Use existing deployed image_upload action to upload file to storage
      const res = (await callAdmin("image_upload", {
        destination_slug: currentDestSlug,
        file_name: `itin-${itineraryId}-day-${dayNumber}-pos-${position}-${file.name}`,
        content_type: file.type,
        file_base64,
      })) as { ok?: boolean; image?: { file_path: string } } | null;

      const filePath = res?.image?.file_path;
      if (!filePath) {
        throw new Error("Could not store image in itineraries storage");
      }

      // Upsert into itinerary_day_images
      const { data: row, error: upsertErr } = await supabase
        .from("itinerary_day_images")
        .upsert(
          {
            itinerary_id: itineraryId,
            day_number: dayNumber,
            position,
            file_path: filePath,
            alt_text: file.name.replace(/\.[^/.]+$/, ""),
          },
          { onConflict: "itinerary_id,day_number,position" }
        )
        .select()
        .single();

      if (upsertErr) throw upsertErr;

      if (row) {
        setDayImages((prev) => {
          const filtered = prev.filter(
            (img) => !(img.day_number === dayNumber && img.position === position)
          );
          return [...filtered, row as DayImageRecord];
        });
        toast({ title: `Day ${dayNumber} photo updated` });
      }
    } catch (err) {
      toast({
        title: "Photo upload failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  // Handle image delete for a specific day slot
  const handleSlotDelete = async (dayNumber: number, position: number) => {
    if (!itineraryId) return;
    const slotKey = `day-${dayNumber}-pos-${position}`;
    setUploadingSlot(slotKey);
    try {
      const { error: delErr } = await supabase
        .from("itinerary_day_images")
        .delete()
        .eq("itinerary_id", itineraryId)
        .eq("day_number", dayNumber)
        .eq("position", position);

      if (delErr) throw delErr;

      setDayImages((prev) =>
        prev.filter((img) => !(img.day_number === dayNumber && img.position === position))
      );
      toast({ title: `Reverted to destination fallback` });
    } catch (err) {
      toast({
        title: "Could not remove photo",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  // Save all edited itinerary details
  const handleSaveAll = async () => {
    if (!itineraryId) return;
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: existingItin } = await supabase
        .from("itineraries")
        .select("parsed_data")
        .eq("id", itineraryId)
        .maybeSingle();

      const prevParsed = (existingItin?.parsed_data ?? {}) as Record<string, unknown>;
      const nextParsed = {
        ...prevParsed,
        title: title.trim(),
        duration: duration.trim() || null,
        starting_price: startingPrice.trim() || null,
        overview: overview.trim() || null,
        highlights: highlights.map((h) => h.trim()).filter(Boolean),
        terms_conditions: termsConditions.trim() || null,
        days: days.map((d, idx) => ({
          day_number: idx + 1,
          title: d.title.trim(),
          description: d.description.trim(),
        })),
        hotels: hotels.map((h) => ({
          city: h.city.trim(),
          hotel_name: h.hotel_name.trim(),
          nights: h.nights,
        })),
        inclusions: inclusions.map((i) => i.trim()).filter(Boolean),
        exclusions: exclusions.map((e) => e.trim()).filter(Boolean),
      };

      // 1. Update itineraries row in database
      const { error: updErr } = await supabase
        .from("itineraries")
        .update({
          title: title.trim().slice(0, 160),
          duration: duration.trim().slice(0, 40) || null,
          starting_price: startingPrice.trim().slice(0, 40) || null,
          overview: overview.trim() || null,
          terms_conditions: termsConditions.trim() || null,
          parsed_data: nextParsed,
        })
        .eq("id", itineraryId);

      if (updErr) throw updErr;

      // 2. Sync to quick update actions on edge function if available
      try {
        await Promise.allSettled([
          callAdmin("update_title", { id: itineraryId, title: title.trim() }),
          callAdmin("update_price", { id: itineraryId, starting_price: startingPrice.trim() }),
          callAdmin("update_duration", { id: itineraryId, duration: duration.trim() }),
        ]);
      } catch {
        // Ignored — direct DB update already succeeded
      }

      // 3. Update relational itinerary_days
      await supabase.from("itinerary_days").delete().eq("itinerary_id", itineraryId);
      if (days.length) {
        await supabase.from("itinerary_days").insert(
          days.map((d, idx) => ({
            itinerary_id: itineraryId,
            day_number: idx + 1,
            title: d.title.trim(),
            description: d.description.trim(),
          }))
        );
      }

      // 4. Update relational itinerary_hotels
      await supabase.from("itinerary_hotels").delete().eq("itinerary_id", itineraryId);
      if (hotels.length) {
        await supabase.from("itinerary_hotels").insert(
          hotels.map((h, idx) => ({
            itinerary_id: itineraryId,
            city: h.city.trim(),
            hotel_name: h.hotel_name.trim(),
            nights: typeof h.nights === "number" ? h.nights : null,
            position: idx,
          }))
        );
      }

      // 5. Update relational inclusions
      await supabase.from("itinerary_inclusions").delete().eq("itinerary_id", itineraryId);
      const cleanInc = inclusions.map((i) => i.trim()).filter(Boolean);
      if (cleanInc.length) {
        await supabase.from("itinerary_inclusions").insert(
          cleanInc.map((t, idx) => ({
            itinerary_id: itineraryId,
            inclusion_text: t,
            position: idx,
          }))
        );
      }

      // 6. Update relational exclusions
      await supabase.from("itinerary_exclusions").delete().eq("itinerary_id", itineraryId);
      const cleanExc = exclusions.map((e) => e.trim()).filter(Boolean);
      if (cleanExc.length) {
        await supabase.from("itinerary_exclusions").insert(
          cleanExc.map((t, idx) => ({
            itinerary_id: itineraryId,
            exclusion_text: t,
            position: idx,
          }))
        );
      }

      toast({ title: "Itinerary updated successfully!" });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper to add day
  const addDay = () => {
    setDays((prev) => [
      ...prev,
      {
        day_number: prev.length + 1,
        title: `Day ${prev.length + 1} Sightseeing`,
        description: "",
      },
    ]);
  };

  const removeDay = (index: number) => {
    setDays((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Helper to add hotel
  const addHotel = () => {
    setHotels((prev) => [
      ...prev,
      { city: currentDestName, hotel_name: "4-Star Hotel or similar", nights: 3 },
    ]);
  };

  const removeHotel = (index: number) => {
    setHotels((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Helper to add inclusion
  const addInclusion = () => {
    setInclusions((prev) => [...prev, ""]);
  };

  const removeInclusion = (index: number) => {
    setInclusions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Helper to add exclusion
  const addExclusion = () => {
    setExclusions((prev) => [...prev, ""]);
  };

  const removeExclusion = (index: number) => {
    setExclusions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Helper to add highlight
  const addHighlight = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl p-0 flex flex-col bg-background h-full shadow-2xl border-l border-border"
      >
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 border-b border-border/80 bg-muted/20">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2e7d32] dark:text-gold mb-1">
                Review &amp; Edit Itinerary · {currentDestName}
              </div>
              <SheetTitle className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                {title || "Itinerary Details"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Review AI-parsed days, nights, hotels, and customize photos per day before publishing.
              </SheetDescription>
            </div>
          </div>

          {/* Navigation Bar inside Drawer */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "days", label: "Days & Photos", icon: Calendar },
                { id: "overview", label: "Overview & Highlights", icon: Sparkles },
                { id: "hotels", label: "Hotels", icon: Hotel },
                { id: "inclusions", label: "Inclusions", icon: Check },
                { id: "terms", label: "Notes & Terms", icon: Info },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? "bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 shadow-sm"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-gold mb-2" />
              <p className="text-sm">Loading itinerary details…</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DAYS & PHOTOS (Default & Marquee View) */}
              {activeTab === "days" && (
                <div className="space-y-6">
                  {/* Quick Summary Pill Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/70 bg-card">
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Duration
                      </Label>
                      <Input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 7 Nights / 8 Days"
                        className="h-9 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Starting Price
                      </Label>
                      <Input
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        placeholder="e.g. ₹49,999 / person"
                        className="h-9 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Package Title
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Itinerary Title"
                        className="h-9 mt-1 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Day-by-Day Itinerary ({days.length} Days)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Each day supports up to 2 photos. Upload custom images or preview destination fallbacks.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addDay}
                      className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {days.map((day, dIdx) => {
                      const dayNumber = dIdx + 1;
                      const customImg1 = dayImages.find(
                        (img) => img.day_number === dayNumber && img.position === 0
                      );
                      const customImg2 = dayImages.find(
                        (img) => img.day_number === dayNumber && img.position === 1
                      );

                      const fallbackUrl1 = photoPool.length
                        ? photoPool[(dIdx * 2) % photoPool.length]
                        : null;
                      const fallbackUrl2 = photoPool.length > 1
                        ? photoPool[(dIdx * 2 + 1) % photoPool.length]
                        : null;

                      return (
                        <div
                          key={dIdx}
                          className="rounded-xl border border-border p-4 bg-card shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wide">
                              Day {String(dayNumber).padStart(2, "0")}
                            </span>
                            <div className="flex-1 min-w-0">
                              <Input
                                value={day.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDays((prev) =>
                                    prev.map((it, idx) => (idx === dIdx ? { ...it, title: val } : it))
                                  );
                                }}
                                placeholder={`Day ${dayNumber} Title`}
                                className="h-8 text-xs font-semibold"
                              />
                            </div>
                            {days.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDay(dIdx)}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition"
                                title="Remove day"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <Textarea
                            value={day.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDays((prev) =>
                                prev.map((it, idx) =>
                                  idx === dIdx ? { ...it, description: val } : it
                                )
                              );
                            }}
                            placeholder="Detailed itinerary description for this day..."
                            rows={3}
                            className="text-xs leading-relaxed"
                          />

                          {/* 2 Day Image Slots (Max 2 images) */}
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                              <span>Day Photos (2 Slots)</span>
                              <span className="text-[10px] lowercase text-muted-foreground">
                                Drag &amp; drop or click to upload
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* SLOT 1 */}
                              <DayPhotoSlot
                                dayNumber={dayNumber}
                                position={0}
                                customImage={customImg1}
                                fallbackUrl={fallbackUrl1}
                                isUploading={uploadingSlot === `day-${dayNumber}-pos-0`}
                                onUpload={(file) => handleSlotFile(dayNumber, 0, file)}
                                onDelete={() => handleSlotDelete(dayNumber, 0)}
                              />

                              {/* SLOT 2 */}
                              <DayPhotoSlot
                                dayNumber={dayNumber}
                                position={1}
                                customImage={customImg2}
                                fallbackUrl={fallbackUrl2}
                                isUploading={uploadingSlot === `day-${dayNumber}-pos-1`}
                                onUpload={(file) => handleSlotFile(dayNumber, 1, file)}
                                onDelete={() => handleSlotDelete(dayNumber, 1)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & HIGHLIGHTS */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Welcome / Trip Overview
                    </Label>
                    <Textarea
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      placeholder="Welcome paragraph introducing the trip..."
                      rows={5}
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Tour Highlights (4–6 Bullet Points)
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addHighlight}
                        className="text-xs h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Highlight
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2e7d32] dark:text-gold">•</span>
                          <Input
                            value={h}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHighlights((prev) =>
                                prev.map((item, idx) => (idx === i ? val : item))
                              );
                            }}
                            placeholder="e.g. Sunset & Kecak Fire Dance at Uluwatu Temple"
                            className="h-8 text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeHighlight(i)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {highlights.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No custom highlights defined. (Will fallback to automatic highlights on display).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HOTELS */}
              {activeTab === "hotels" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Hotel Accommodations</h3>
                      <p className="text-xs text-muted-foreground">
                        Specify destination city, hotel tier or name, and nights stay.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addHotel}
                      className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Hotel
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {hotels.map((hotel, hIdx) => (
                      <div
                        key={hIdx}
                        className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center gap-2"
                      >
                        <div className="w-full sm:w-1/3">
                          <Label className="text-[10px] uppercase text-muted-foreground">City / Region</Label>
                          <Input
                            value={hotel.city}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHotels((prev) =>
                                prev.map((item, idx) => (idx === hIdx ? { ...item, city: val } : item))
                              );
                            }}
                            placeholder="e.g. Kuta / Seminyak"
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <div className="w-full sm:flex-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Hotel Name / Category</Label>
                          <Input
                            value={hotel.hotel_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHotels((prev) =>
                                prev.map((item, idx) =>
                                  idx === hIdx ? { ...item, hotel_name: val } : item
                                )
                              );
                            }}
                            placeholder="e.g. Hotel Grand Mercure / 4-Star"
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <div className="w-full sm:w-24">
                          <Label className="text-[10px] uppercase text-muted-foreground">Nights</Label>
                          <Input
                            type="number"
                            min="0"
                            value={hotel.nights ?? ""}
                            onChange={(e) => {
                              const val = e.target.value ? parseInt(e.target.value, 10) : null;
                              setHotels((prev) =>
                                prev.map((item, idx) => (idx === hIdx ? { ...item, nights: val } : item))
                              );
                            }}
                            placeholder="Nights"
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHotel(hIdx)}
                          className="self-end sm:self-center mt-2 sm:mt-5 p-1.5 text-muted-foreground hover:text-destructive"
                          title="Remove hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {hotels.length === 0 && (
                      <div className="text-center py-8 border border-dashed rounded-lg text-xs text-muted-foreground">
                        No hotels listed. Click "+ Add Hotel" to add accommodations.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
              {activeTab === "inclusions" && (
                <div className="space-y-6">
                  {/* INCLUSIONS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#2e7d32] dark:text-gold" /> Inclusions
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addInclusion}
                        className="text-xs h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Inclusion
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {inclusions.map((inc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#2e7d32] dark:text-gold shrink-0" />
                          <Input
                            value={inc}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInclusions((prev) =>
                                prev.map((item, idx) => (idx === i ? val : item))
                              );
                            }}
                            placeholder="e.g. Daily buffet breakfast at resorts"
                            className="h-8 text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeInclusion(i)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EXCLUSIONS */}
                  <div className="space-y-3 pt-4 border-t border-border/70">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <XIcon className="w-4 h-4 text-destructive" /> Exclusions
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addExclusion}
                        className="text-xs h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Exclusion
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {exclusions.map((exc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <XIcon className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <Input
                            value={exc}
                            onChange={(e) => {
                              const val = e.target.value;
                              setExclusions((prev) =>
                                prev.map((item, idx) => (idx === i ? val : item))
                              );
                            }}
                            placeholder="e.g. International airfare & visa fees"
                            className="h-8 text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeExclusion(i)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TERMS & CONDITIONS */}
              {activeTab === "terms" && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Important Notes &amp; Terms
                  </Label>
                  <Textarea
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    placeholder="Cancellation rules, payment terms, check-in policy..."
                    rows={8}
                    className="text-xs leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to use default Jain Tours standard travel policies.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="bg-[#1c2833] dark:bg-gold text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wide px-5"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" /> Save &amp; Publish
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Component for a single Day Photo Slot (Position 0 or 1)
const DayPhotoSlot = ({
  dayNumber,
  position,
  customImage,
  fallbackUrl,
  isUploading,
  onUpload,
  onDelete,
}: {
  dayNumber: number;
  position: number;
  customImage?: DayImageRecord;
  fallbackUrl: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const displayUrl = customImage ? adminPublicUrl(customImage.file_path) : fallbackUrl;
  const isCustom = !!customImage;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-lg border p-2.5 transition-all ${
        isDragOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : isCustom
          ? "border-border/80 bg-background"
          : "border-dashed border-border/70 bg-muted/20"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />

      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="text-[10px] font-bold text-foreground">
          Slot {position + 1}
        </span>
        <span
          className={`text-[9.5px] px-1.5 py-0.5 rounded font-semibold ${
            isCustom
              ? "bg-[#2e7d32]/10 text-[#2e7d32] dark:bg-gold/10 dark:text-gold"
              : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
          }`}
        >
          {isCustom ? "Custom Upload" : "Gallery Fallback"}
        </span>
      </div>

      {/* Image Preview Box */}
      <div className="relative h-28 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-800 border border-border/50 group">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`Day ${dayNumber} Photo ${position + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <span className="text-[10px]">No photo</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold py-1 px-2 rounded border border-border/70 hover:bg-muted transition"
        >
          <Upload className="w-3 h-3" /> {isCustom ? "Replace" : "Upload File"}
        </button>
        {isCustom && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isUploading}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
            title="Remove custom photo (revert to fallback)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ItineraryEditorDrawer;
