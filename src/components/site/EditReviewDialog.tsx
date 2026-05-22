import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Crop as CropIcon, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64, adminPublicUrl } from "@/hooks/useAdminAuth";
import type { DbClientReview } from "@/hooks/useClientReviews";
import ReviewPhotoEditor from "./ReviewPhotoEditor";

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp,image/avif";

type Props = {
  review: DbClientReview | null;
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
};

const EditReviewDialog = ({ review, callAdmin, onClose, onSaved }: Props) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!review) return;
    setName(review.name);
    setDestination(review.destination ?? "");
    setText(review.text);
    setRating(review.rating);
    setDate(review.date_label ?? "");
    setFile(null);
    setRemoveImage(false);
    setPreview(review.image_path ? adminPublicUrl(review.image_path) : null);
  }, [review]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setRemoveImage(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/") || !ACCEPT_IMG.split(",").includes(f.type)) {
      toast({ title: "Image must be JPG/PNG/WEBP/AVIF", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large (max 10MB)", variant: "destructive" });
      return;
    }
    setFile(f);
    setShowEditor(true);
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setRemoveImage(true);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review) return;
    if (!name.trim() || !text.trim()) {
      toast({ title: "Name and review are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        id: review.id,
        name: name.trim(),
        destination: destination.trim() || null,
        text: text.trim(),
        rating,
        date_label: date.trim() || null,
      };
      if (file) {
        if (!file.type.startsWith("image/") || !ACCEPT_IMG.split(",").includes(file.type)) {
          toast({ title: "Image must be JPG/PNG/WEBP/AVIF", variant: "destructive" });
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "Image too large (max 10MB)", variant: "destructive" });
          return;
        }
        payload.file_base64 = await fileToBase64(file);
        payload.file_name = file.name;
        payload.content_type = file.type;
      } else if (removeImage) {
        payload.remove_image = true;
      }
      await callAdmin("review_update", payload);
      toast({ title: "Review updated" });
      onSaved();
      onClose();
    } catch (err) {
      toast({
        title: "Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={!!review} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-foreground">
              Edit review
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Update any field below. Changes publish instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                  Guest name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                  maxLength={80}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                  Destination
                </Label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
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
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-2 min-h-[100px]"
                maxLength={800}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                  Rating
                </Label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2"
                  maxLength={40}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-luxe text-foreground/70">
                Photo
              </Label>
              <div className="mt-2 flex items-start gap-3">
                <div className="w-20 h-20 rounded border border-border/60 bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {preview ? (
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-foreground/30" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept={ACCEPT_IMG}
                    onChange={handlePick}
                  />
                  <div className="flex flex-wrap gap-2">
                    {file && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditor(true)}
                      >
                        <CropIcon className="w-3 h-3 mr-2" /> Crop & resize
                      </Button>
                    )}
                    {preview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                      >
                        <X className="w-3 h-3 mr-2" /> Remove photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gold text-primary-foreground hover:bg-gold/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditor && !!file} onOpenChange={(v) => !v && setShowEditor(false)}>
        <DialogContent className="max-w-xl w-[95vw] bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Crop & resize photo</DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Drag to reposition, slide to zoom. Output is resized for fast loading.
            </DialogDescription>
          </DialogHeader>
          {file && (
            <ReviewPhotoEditor
              file={file}
              onCancel={() => setShowEditor(false)}
              onConfirm={(f) => {
                setFile(f);
                setShowEditor(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditReviewDialog;
