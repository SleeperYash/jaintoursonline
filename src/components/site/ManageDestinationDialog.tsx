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
} from "lucide-react";
import { useAdminAuth, fileToBase64, adminPublicUrl } from "@/hooks/useAdminAuth";
import {
  useDestinationImages,
  type DestinationImage,
} from "@/hooks/useDestinationImages";
import { useClientReviews, type DbClientReview } from "@/hooks/useClientReviews";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { destinations as ALL_DESTINATIONS } from "@/data/destinations";

type Itinerary = {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
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
  const [uploadingItin, setUploadingItin] = useState(false);

  // Reviews
  const { reviews, refetch: refetchReviews } = useClientReviews();
  const [revName, setRevName] = useState("");
  const [revDestination, setRevDestination] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revDate, setRevDate] = useState("");
  const [revFile, setRevFile] = useState<File | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  const fetchItineraries = useCallback(async () => {
    const { data } = await supabase
      .from("itineraries")
      .select("id,title,file_path,file_size")
      .eq("destination_slug", destinationSlug)
      .order("created_at", { ascending: false });
    setItineraries(data ?? []);
  }, [destinationSlug]);

  useEffect(() => {
    if (open && authed) fetchItineraries();
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
      });
      toast({ title: "Uploaded", description: itinTitle });
      setItinTitle("");
      setItinFile(null);
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
              Admin only — manage itineraries and images{allowSwitcher ? " across all destinations." : " for this destination."}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="itinerary" className="text-xs uppercase tracking-luxe">
                  <FileText className="w-4 h-4 mr-2" /> Itinerary
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs uppercase tracking-luxe">
                  <ImagePlus className="w-4 h-4 mr-2" /> Images
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs uppercase tracking-luxe">
                  <MessageSquareQuote className="w-4 h-4 mr-2" /> Reviews
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
                          className="flex items-center gap-3 border border-border/60 p-3 rounded-md"
                        >
                          <FileText className="w-4 h-4 text-gold shrink-0" />
                          <p className="text-sm text-foreground flex-1 truncate">{it.title}</p>
                          <button
                            onClick={() => handleDeleteItin(it)}
                            className="p-2 text-foreground/60 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                      Images ({images.length})
                    </p>
                    {busy && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
                  </div>

                  {images.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-light text-center py-6">
                      No images yet. Upload one above.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageDestinationDialog;
