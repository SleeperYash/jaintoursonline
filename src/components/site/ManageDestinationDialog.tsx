import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings,
  Lock,
  Loader2,
  Upload,
  Trash2,
  Star,
  Replace,
  GripVertical,
  ImagePlus,
  FileText,
  MessageSquareQuote,
  Pencil,
  Crop as CropIcon,
  X,
  Tag,
  Eye,
  Sparkles,
} from "lucide-react";
import { useAdminAuth, fileToBase64, adminPublicUrl } from "@/hooks/useAdminAuth";
import {
  useDestinationImages,
  type DestinationImage,
} from "@/hooks/useDestinationImages";
import { useClientReviews, type DbClientReview } from "@/hooks/useClientReviews";
import { useHiddenDefaultImages } from "@/hooks/useHiddenDefaultImages";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { destinations as ALL_DESTINATIONS } from "@/data/destinations";
import EditReviewDialog from "./EditReviewDialog";
import ReviewPhotoEditor from "./ReviewPhotoEditor";
import DealsAdminPanel from "./DealsAdminPanel";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  starting_price: string | null;
  duration: string | null;
};

type Props = {
  destinationSlug?: string;
  destinationName?: string;
  allowSwitcher?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
};

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp,image/avif";

const ManageDestinationDialog = ({
  destinationSlug: propSlug,
  destinationName: propName,
  allowSwitcher = false,
  triggerClassName,
  triggerLabel,
}: Props) => {
  const { toast } = useToast();
  const { pwd, setPwd, authed, callAdmin, unlock } = useAdminAuth();
  const initialSlug = propSlug ?? ALL_DESTINATIONS[0]?.slug ?? "";
  const initialName =
    propName ?? ALL_DESTINATIONS.find((x) => x.slug === initialSlug)?.name ?? "";
  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  const [currentName, setCurrentName] = useState(initialName);
  const destinationSlug = currentSlug;
  const destinationName = currentName;
  const { images, refetch: refetchImages } = useDestinationImages(destinationSlug);
  const { hidden: hiddenDefaults, refetch: refetchHiddenDefaults } =
    useHiddenDefaultImages(destinationSlug);

  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [busy, setBusy] = useState(false);

  // Images
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<DestinationImage | null>(null);

  // Itineraries
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [itinTitle, setItinTitle] = useState("");
  const [itinFile, setItinFile] = useState<File | null>(null);
  const [itinPrice, setItinPrice] = useState("");
  const [itinDuration, setItinDuration] = useState("");
  const [uploadingItin, setUploadingItin] = useState(false);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [durationDrafts, setDurationDrafts] = useState<Record<string, string>>({});
  const [savingDurationId, setSavingDurationId] = useState<string | null>(null);
  const [reparsingId, setReparsingId] = useState<string | null>(null);

  // Reviews
  const { reviews, refetch: refetchReviews } = useClientReviews();
  const [revName, setRevName] = useState("");
  const [revDestination, setRevDestination] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revDate, setRevDate] = useState("");
  const [revFile, setRevFile] = useState<File | null>(null);
  const [revPreview, setRevPreview] = useState<string | null>(null);
  const [revShowEditor, setRevShowEditor] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<DbClientReview | null>(null);

  useEffect(() => {
    if (!revFile) {
      setRevPreview(null);
      return;
    }
    const url = URL.createObjectURL(revFile);
    setRevPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [revFile]);

  const fetchItineraries = useCallback(async () => {
    const { data } = await supabase
      .from("itineraries")
      .select("id,title,file_path,file_size,starting_price,duration")
      .eq("destination_slug", destinationSlug)
      .order("created_at", { ascending: false });
    setItineraries(data ?? []);
  }, [destinationSlug]);

  useEffect(() => {
    if (open && authed) {
      fetchItineraries();
    }
  }, [open, authed, fetchItineraries]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revText.trim()) {
      toast({ title: "Add name and review text", variant: "destructive" });
      return;
    }
    setSavingReview(true);
    try {
      const payload: Record<string, unknown> = {
        name: revName.trim(),
        destination: revDestination.trim() || null,
        text: revText.trim(),
        rating: revRating,
        date_label: revDate.trim() || null,
      };
      if (revFile) {
        if (!revFile.type.startsWith("image/")) {
          toast({ title: "Image must be JPG/PNG/WEBP/AVIF", variant: "destructive" });
          setSavingReview(false);
          return;
        }
        if (revFile.size > 10 * 1024 * 1024) {
          toast({ title: "Image too large (max 10MB)", variant: "destructive" });
          setSavingReview(false);
          return;
        }
        payload.file_base64 = await fileToBase64(revFile);
        payload.file_name = revFile.name;
        payload.content_type = revFile.type;
      }
      await callAdmin("review_create", payload);
      toast({ title: "Review added" });
      setRevName("");
      setRevDestination("");
      setRevText("");
      setRevRating(5);
      setRevDate("");
      setRevFile(null);
      const input = document.getElementById("manage-review-input") as HTMLInputElement | null;
      if (input) input.value = "";
      await refetchReviews();
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (r: DbClientReview) => {
    if (!confirm(`Delete review by "${r.name}"?`)) return;
    try {
      await callAdmin("review_delete", { id: r.id });
      toast({ title: "Deleted" });
      await refetchReviews();
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await unlock(pwd);
      toast({ title: "Unlocked" });
    } catch (err) {
      toast({
        title: "Wrong password",
        description: (err as Error).message,
        variant: "destructive",
      });
      setPwd("");
    } finally {
      setVerifying(false);
    }
  };

  // ------- IMAGES -------
  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setBusy(true);
      try {
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "Too large",
              description: `${file.name} is over 10MB`,
              variant: "destructive",
            });
            continue;
          }
          const file_base64 = await fileToBase64(file);
          await callAdmin("image_upload", {
            destination_slug: destinationSlug,
            file_name: file.name,
            content_type: file.type,
            file_base64,
          });
        }
        toast({ title: "Uploaded", description: `${files.length} image(s)` });
        await refetchImages();
      } catch (err) {
        toast({
          title: "Upload failed",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setBusy(false);
      }
    },
    [callAdmin, destinationSlug, refetchImages, toast],
  );

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    uploadFiles(list);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const list = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    uploadFiles(list);
  };

  const handleSetCover = async (img: DestinationImage) => {
    if (img.is_cover) return;
    setBusy(true);
    try {
      await callAdmin("image_set_cover", { id: img.id });
      await refetchImages();
      toast({ title: "Cover updated" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteImg = async (img: DestinationImage) => {
    if (!confirm("Remove this image?")) return;
    setBusy(true);
    try {
      await callAdmin("image_delete", { id: img.id });
      await refetchImages();
      toast({ title: "Removed" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const triggerReplace = (img: DestinationImage) => {
    setReplaceTarget(img);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTarget) {
      setReplaceTarget(null);
      return;
    }
    setBusy(true);
    try {
      const file_base64 = await fileToBase64(file);
      await callAdmin("image_replace", {
        id: replaceTarget.id,
        file_name: file.name,
        content_type: file.type,
        file_base64,
      });
      await refetchImages();
      toast({ title: "Replaced" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
      setReplaceTarget(null);
    }
  };

  const onItemDragStart = (id: string) => setDragId(id);
  const onItemDragOver = (e: React.DragEvent) => e.preventDefault();
  const onItemDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = images.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    setBusy(true);
    try {
      await callAdmin("image_reorder", {
        destination_slug: destinationSlug,
        ordered_ids: ids,
      });
      await refetchImages();
    } catch (err) {
      toast({ title: "Reorder failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  // ------- ITINERARIES -------
  const handleUploadItin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinFile || !itinTitle.trim()) {
      toast({ title: "Add a title and PDF", variant: "destructive" });
      return;
    }
    if (itinFile.type !== "application/pdf") {
      toast({ title: "PDF only", variant: "destructive" });
      return;
    }
    if (itinFile.size > 20 * 1024 * 1024) {
      toast({ title: "Max 20MB", variant: "destructive" });
      return;
    }
    setUploadingItin(true);
    try {
      const file_base64 = await fileToBase64(itinFile);
      await callAdmin("upload", {
        destination_slug: destinationSlug,
        title: itinTitle.trim(),
        file_name: itinFile.name,
        file_size: itinFile.size,
        content_type: itinFile.type,
        file_base64,
        starting_price: itinPrice.trim() || null,
        duration: itinDuration.trim() || null,
      });
      toast({ title: "Uploaded", description: itinTitle });
      setItinTitle("");
      setItinFile(null);
      setItinPrice("");
      setItinDuration("");
      const input = document.getElementById("manage-pdf-input") as HTMLInputElement | null;
      if (input) input.value = "";
      fetchItineraries();
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploadingItin(false);
    }
  };

  const handleDeleteItin = async (it: Itinerary) => {
    if (!confirm(`Delete "${it.title}"?`)) return;
    try {
      await callAdmin("delete", { id: it.id });
      toast({ title: "Deleted" });
      fetchItineraries();
    } catch (err) {
      toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleSavePrice = async (it: Itinerary) => {
    const value = (priceDrafts[it.id] ?? it.starting_price ?? "").trim();
    setSavingPriceId(it.id);
    try {
      await callAdmin("update_price", { id: it.id, starting_price: value || null });
      toast({ title: "Price updated", description: it.title });
      setPriceDrafts((p) => {
        const next = { ...p };
        delete next[it.id];
        return next;
      });
      fetchItineraries();
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleSaveDuration = async (it: Itinerary) => {
    const value = (durationDrafts[it.id] ?? it.duration ?? "").trim();
    setSavingDurationId(it.id);
    try {
      await callAdmin("update_duration", { id: it.id, duration: value || null });
      toast({ title: "Duration updated", description: it.title });
      setDurationDrafts((p) => {
        const next = { ...p };
        delete next[it.id];
        return next;
      });
      fetchItineraries();
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingDurationId(null);
    }
  };

  const handleReparse = async (it: Itinerary) => {
    if (!confirm(`Re-run AI parsing for "${it.title}"? This calls Gemini and overwrites the day-by-day, hotels, inclusions and exclusions for this itinerary.`)) return;
    setReparsingId(it.id);
    try {
      await callAdmin("reparse", { id: it.id });
      toast({ title: "Re-parsed", description: it.title });
      fetchItineraries();
    } catch (err) {
      toast({ title: "Re-parse failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setReparsingId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "text-xs uppercase tracking-luxe text-foreground/50 hover:text-gold inline-flex items-center gap-2"
        }
        title="Manage destinations"
      >
        <Settings className="w-4 h-4" /> {triggerLabel ?? "Manage"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-foreground flex items-center gap-3">
              <Lock className="w-5 h-5 text-gold" />
              {allowSwitcher ? "Manage Destinations" : `Manage ${destinationName}`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Admin only — manage itineraries, images, and published reviews{allowSwitcher ? " across all destinations." : " for this destination."}
            </DialogDescription>
          </DialogHeader>

          {authed && allowSwitcher && (
            <div className="mt-2">
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                Destination
              </Label>
              <select
                value={currentSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  const dest = ALL_DESTINATIONS.find((x) => x.slug === slug);
                  setCurrentSlug(slug);
                  setCurrentName(dest?.name ?? slug);
                }}
                className="mt-2 w-full bg-background border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold"
              >
                {ALL_DESTINATIONS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name} — {d.region}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!authed ? (
            <form onSubmit={handleUnlock} className="mt-2 space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                  Admin password
                </Label>
                <Input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="mt-2"
                  autoFocus
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={verifying || !pwd}
                className="w-full bg-gold text-primary-foreground hover:bg-gold/90"
              >
                {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Unlock
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="itinerary" className="mt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="itinerary" className="text-xs uppercase tracking-luxe">
                  <FileText className="w-4 h-4 mr-2" /> Itinerary
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs uppercase tracking-luxe">
                  <ImagePlus className="w-4 h-4 mr-2" /> Images
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs uppercase tracking-luxe">
                  <MessageSquareQuote className="w-4 h-4 mr-2" /> Reviews
                </TabsTrigger>
                <TabsTrigger value="deals" className="text-xs uppercase tracking-luxe">
                  <Tag className="w-4 h-4 mr-2" /> Deals
                </TabsTrigger>
              </TabsList>

              {/* ITINERARY TAB */}
              <TabsContent value="itinerary" className="mt-4 space-y-6">
                <form onSubmit={handleUploadItin} className="space-y-4 border border-border/60 p-4 md:p-5 rounded-md">
                  <p className="text-xs uppercase tracking-luxe text-gold">Upload new itinerary</p>
                  <div>
                    <Label className="text-xs uppercase tracking-luxe text-foreground/70">Title</Label>
                    <Input
                      value={itinTitle}
                      onChange={(e) => setItinTitle(e.target.value)}
                      placeholder={`7N ${destinationName} Sample`}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                      PDF (max 20MB)
                    </Label>
                    <Input
                      id="manage-pdf-input"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setItinFile(e.target.files?.[0] ?? null)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                      Starting price (optional)
                    </Label>
                    <Input
                      value={itinPrice}
                      onChange={(e) => setItinPrice(e.target.value)}
                      placeholder="e.g. ₹45,999"
                      maxLength={40}
                      className="mt-2"
                    />
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Shown as the "Starting from" price on the itinerary page. Leave blank to use the PDF / auto value.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                      Nights / Days (optional)
                    </Label>
                    <Input
                      value={itinDuration}
                      onChange={(e) => setItinDuration(e.target.value)}
                      placeholder="e.g. 5 Nights / 6 Days"
                      maxLength={40}
                      className="mt-2"
                    />
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Shown as the duration badge on the itinerary card. Leave blank to auto-detect from the PDF.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={uploadingItin}
                    className="bg-gold text-primary-foreground hover:bg-gold/90"
                  >
                    {uploadingItin ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" /> Upload
                      </>
                    )}
                  </Button>
                </form>

                <div>
                  <p className="text-xs uppercase tracking-luxe text-gold mb-3">
                    Existing ({itineraries.length})
                  </p>
                  {itineraries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {itineraries.map((it) => (
                        <div
                          key={it.id}
                          className="flex flex-col gap-3 border border-border/60 p-3 rounded-md"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-gold shrink-0" />
                            <p className="text-sm text-foreground flex-1 truncate">{it.title}</p>
                            <a
                              href={adminPublicUrl(it.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-foreground/60 hover:text-gold"
                              title="Preview PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteItin(it)}
                              className="p-2 text-foreground/60 hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={priceDrafts[it.id] ?? it.starting_price ?? ""}
                              onChange={(e) =>
                                setPriceDrafts((p) => ({ ...p, [it.id]: e.target.value }))
                              }
                              placeholder="₹ price"
                              maxLength={40}
                              className="h-9 flex-1 text-sm"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={
                                savingPriceId === it.id ||
                                (priceDrafts[it.id] ?? it.starting_price ?? "") ===
                                  (it.starting_price ?? "")
                              }
                              onClick={() => handleSavePrice(it)}
                            >
                              {savingPriceId === it.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={durationDrafts[it.id] ?? it.duration ?? ""}
                                onChange={(e) =>
                                  setDurationDrafts((p) => ({ ...p, [it.id]: e.target.value }))
                                }
                                placeholder="e.g. 5N / 6D"
                                maxLength={40}
                                className="h-9 flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={
                                  savingDurationId === it.id ||
                                  (durationDrafts[it.id] ?? it.duration ?? "") ===
                                    (it.duration ?? "")
                                }
                                onClick={() => handleSaveDuration(it)}
                              >
                                {savingDurationId === it.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* IMAGES TAB */}
              <TabsContent value="images" className="mt-4 space-y-6">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors",
                    dragOver ? "border-gold bg-gold/5" : "border-border/60",
                  )}
                >
                  <ImagePlus className="w-8 h-8 text-gold mx-auto mb-3" />
                  <p className="text-sm text-foreground mb-1">
                    Drag & drop images here, or
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs uppercase tracking-luxe text-gold hover:underline"
                    disabled={busy}
                  >
                    browse files
                  </button>
                  <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mt-2">
                    JPG, PNG, WEBP, AVIF · max 10MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_IMG}
                    multiple
                    className="hidden"
                    onChange={handlePick}
                  />
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept={ACCEPT_IMG}
                    className="hidden"
                    onChange={handleReplaceFile}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-luxe text-gold">
                      Images
                    </p>
                    {busy && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
                  </div>

                  {(() => {
                    const dest = ALL_DESTINATIONS.find((x) => x.slug === destinationSlug);
                    const allDefaults = dest ? [dest.image, ...(dest.gallery ?? [])].filter(Boolean) : [];
                    const defaults = allDefaults.filter((url) => !hiddenDefaults.has(url));
                    const hasDbCover = images.some((i) => i.is_cover);
                    const primaryDefaultIsCover = !hasDbCover;

                    const handleUseDefaultCover = async (url: string, isPrimary: boolean) => {
                      setBusy(true);
                      try {
                        if (isPrimary) {
                          // Just clear DB cover so the page falls back to dest.image
                          await callAdmin("image_clear_cover", { destination_slug: destinationSlug });
                        } else {
                          // Import this AI photo into storage and mark it as cover in one shot
                          const res = await fetch(url);
                          const blob = await res.blob();
                          const ct = blob.type || "image/jpeg";
                          const ext = ct.split("/")[1]?.split("+")[0] || "jpg";
                          const file = new File([blob], `ai-${Date.now()}.${ext}`, { type: ct });
                          const file_base64 = await fileToBase64(file);
                          await callAdmin("image_upload", {
                            destination_slug: destinationSlug,
                            file_name: file.name,
                            content_type: ct,
                            file_base64,
                            set_as_cover: true,
                          });
                        }
                        await refetchImages();
                        toast({ title: "Cover updated" });
                      } catch (err) {
                        toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
                      } finally {
                        setBusy(false);
                      }
                    };

                    const handleHideDefault = async (url: string) => {
                      if (!confirm("Remove this image from this destination? This can be reversed later by clearing the entry from the database.")) return;
                      setBusy(true);
                      try {
                        await callAdmin("default_image_hide", {
                          destination_slug: destinationSlug,
                          image_url: url,
                        });
                        await refetchHiddenDefaults();
                        toast({ title: "Image removed" });
                      } catch (err) {
                        toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
                      } finally {
                        setBusy(false);
                      }
                    };

                    return (
                      <div className="space-y-6">
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {defaults.map((url, idx) => {
                            const isPrimary = idx === 0 && url === dest?.image;
                            const isCover = isPrimary && primaryDefaultIsCover;
                            return (
                              <li
                                key={`def-${idx}`}
                                className={cn(
                                  "relative group border border-border/60 rounded-md overflow-hidden bg-background",
                                  isCover && "ring-2 ring-gold",
                                )}
                              >
                                <div className="aspect-[4/5] relative">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  {isCover && (
                                    <span className="absolute top-2 left-2 bg-gold text-primary-foreground text-[10px] uppercase tracking-luxe px-2 py-1 rounded inline-flex items-center gap-1">
                                      <Star className="w-3 h-3" /> Cover
                                    </span>
                                  )}
                                  <span className="absolute top-2 right-2 bg-ink/70 text-foreground text-[10px] uppercase tracking-luxe px-2 py-1 rounded">
                                    AI {idx + 1}
                                  </span>
                                </div>
                                <div className="p-2 flex flex-wrap gap-1 bg-card">
                                  <button
                                    type="button"
                                    disabled={busy || isCover}
                                    onClick={() => handleUseDefaultCover(url, isPrimary)}
                                    className="flex-1 min-w-0 text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-gold/60 text-gold hover:bg-gold/10 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
                                    title={isPrimary ? "Use the default image as cover" : "Import this AI photo and set as cover"}
                                  >
                                    <Star className="w-3 h-3" /> {isPrimary ? "Cover" : "Use as cover"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => handleHideDefault(url)}
                                    className="flex-1 min-w-0 text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-destructive/60 text-destructive hover:bg-destructive/10 transition inline-flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Remove this image from this destination"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                          {images.map((img) => (
                          <li
                            key={img.id}
                            draggable
                            onDragStart={() => onItemDragStart(img.id)}
                            onDragOver={onItemDragOver}
                            onDrop={() => onItemDrop(img.id)}
                            className={cn(
                              "relative group border border-border/60 rounded-md overflow-hidden bg-background",
                              dragId === img.id && "opacity-50",
                              img.is_cover && "ring-2 ring-gold",
                            )}
                          >
                            <div className="aspect-[4/5] relative">
                              <img
                                src={adminPublicUrl(img.file_path)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              {img.is_cover && (
                                <span className="absolute top-2 left-2 bg-gold text-primary-foreground text-[10px] uppercase tracking-luxe px-2 py-1 rounded inline-flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Cover
                                </span>
                              )}
                              <span
                                className="absolute top-2 right-2 bg-ink/70 text-foreground p-1.5 rounded cursor-grab"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="p-2 flex flex-wrap gap-1 bg-card">
                              <button
                                type="button"
                                disabled={busy || img.is_cover}
                                onClick={() => handleSetCover(img)}
                                className="flex-1 min-w-0 text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-gold/60 text-gold hover:bg-gold/10 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
                                title="Set as cover image"
                              >
                                <Star className="w-3 h-3" /> Cover
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => triggerReplace(img)}
                                className="flex-1 min-w-0 text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-border/60 text-foreground/80 hover:border-gold hover:text-gold transition inline-flex items-center justify-center gap-1"
                                title="Replace"
                              >
                                <Replace className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteImg(img)}
                                className="flex-1 min-w-0 text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-destructive/60 text-destructive hover:bg-destructive/10 transition inline-flex items-center justify-center gap-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </li>
                          ))}
                        </ul>

                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* REVIEWS TAB */}
              <TabsContent value="reviews" className="mt-4 space-y-6">
                <form
                  onSubmit={handleSubmitReview}
                  className="space-y-4 border border-border/60 p-4 md:p-5 rounded-md"
                >
                  <p className="text-xs uppercase tracking-luxe text-gold">Add a review</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                        Guest name
                      </Label>
                      <Input
                        value={revName}
                        onChange={(e) => setRevName(e.target.value)}
                        placeholder="Priya Mehta"
                        className="mt-2"
                        maxLength={80}
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                        Destination (optional)
                      </Label>
                      <Input
                        value={revDestination}
                        onChange={(e) => setRevDestination(e.target.value)}
                        placeholder="Bali, Indonesia"
                        className="mt-2"
                        maxLength={120}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                      Review
                    </Label>
                    <Textarea
                      value={revText}
                      onChange={(e) => setRevText(e.target.value)}
                      placeholder="What did they love about the trip?"
                      className="mt-2 min-h-[100px]"
                      maxLength={800}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                        Rating
                      </Label>
                      <select
                        value={revRating}
                        onChange={(e) => setRevRating(Number(e.target.value))}
                        className="mt-2 w-full bg-background border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} ★
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                        Date label
                      </Label>
                      <Input
                        value={revDate}
                        onChange={(e) => setRevDate(e.target.value)}
                        placeholder="2 months ago"
                        className="mt-2"
                        maxLength={40}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                        Photo (optional)
                      </Label>
                      <Input
                        id="manage-review-input"
                        type="file"
                        accept={ACCEPT_IMG}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          e.target.value = "";
                          if (f && (!f.type.startsWith("image/") || !ACCEPT_IMG.split(",").includes(f.type))) {
                            toast({ title: "Image must be JPG/PNG/WEBP/AVIF", variant: "destructive" });
                            return;
                          }
                          if (f && f.size > 10 * 1024 * 1024) {
                            toast({ title: "Image too large (max 10MB)", variant: "destructive" });
                            return;
                          }
                          setRevFile(f);
                          if (f) setRevShowEditor(true);
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {revPreview && (
                    <div className="flex items-start gap-3 border border-border/60 rounded-md p-3">
                      <img
                        src={revPreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border border-border/60 shrink-0"
                      />
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-xs uppercase tracking-luxe text-foreground/60">
                          Photo preview
                        </p>
                        <p className="text-xs text-foreground/80 truncate">
                          {revFile?.name} · {((revFile?.size ?? 0) / 1024).toFixed(0)} KB
                        </p>
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setRevShowEditor(true)}
                          >
                            <CropIcon className="w-3 h-3 mr-2" /> Crop & resize
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRevFile(null);
                              const input = document.getElementById(
                                "manage-review-input",
                              ) as HTMLInputElement | null;
                              if (input) input.value = "";
                            }}
                          >
                            <X className="w-3 h-3 mr-2" /> Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={savingReview}
                    className="bg-gold text-primary-foreground hover:bg-gold/90"
                  >
                    {savingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" /> Publish review
                      </>
                    )}
                  </Button>
                </form>

                <div>
                  <p className="text-xs uppercase tracking-luxe text-gold mb-3">
                    Published ({reviews.length})
                  </p>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-light">
                      No reviews yet. Add one above.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {reviews.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-start gap-3 border border-border/60 p-3 rounded-md"
                        >
                          {r.image_path ? (
                            <img
                              src={adminPublicUrl(r.image_path)}
                              alt=""
                              className="w-14 h-14 rounded object-cover shrink-0 border border-border/60"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs shrink-0">
                              {r.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-foreground font-medium truncate">
                                {r.name}
                              </p>
                              <div className="flex gap-0.5">
                                {Array.from({ length: r.rating }).map((_, k) => (
                                  <Star key={k} className="w-3 h-3 fill-rating-star text-rating-star" />
                                ))}
                              </div>
                            </div>
                            {r.destination && (
                              <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
                                {r.destination}
                              </p>
                            )}
                            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{r.text}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingReview(r)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gold/50 text-gold text-[10px] uppercase tracking-luxe hover:bg-gold hover:text-primary-foreground transition"
                              title="Edit review"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border/60 text-foreground/60 text-[10px] uppercase tracking-luxe hover:border-destructive/60 hover:text-destructive transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              {/* DEALS TAB */}
              <TabsContent value="deals" className="mt-4">
                <DealsAdminPanel callAdmin={callAdmin} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={revShowEditor && !!revFile} onOpenChange={(v) => !v && setRevShowEditor(false)}>
        <DialogContent className="max-w-xl w-[95vw] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Crop & resize photo</DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Drag to reposition, slide to zoom. Output is resized for fast loading.
            </DialogDescription>
          </DialogHeader>
          {revFile && (
            <ReviewPhotoEditor
              file={revFile}
              onCancel={() => setRevShowEditor(false)}
              onConfirm={(f) => {
                setRevFile(f);
                setRevShowEditor(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <EditReviewDialog
        review={editingReview}
        callAdmin={callAdmin}
        onClose={() => setEditingReview(null)}
        onSaved={refetchReviews}
      />
    </>
  );
};

export default ManageDestinationDialog;
