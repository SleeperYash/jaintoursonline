import { useRef, useState } from "react";
import { Loader2, ImagePlus, Trash2, CheckCircle2, Smartphone, Monitor } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64 } from "@/hooks/useAdminAuth";
import { useSpecialOffers, type SpecialOffer } from "@/hooks/useSpecialOffers";
import { Button } from "@/components/ui/button";

type Props = {
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
};

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp";

const SpecialOffersAdminSection = ({ callAdmin }: Props) => {
  const { toast } = useToast();
  const { offers, refetch } = useSpecialOffers();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadBanner = async (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Image files only", description: "Please upload a JPG, PNG, or WEBP image.", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Banner image size must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      await callAdmin("offer_upload", {
        file_base64: await fileToBase64(f),
        file_name: f.name,
        content_type: f.type,
      });
      toast({
        title: "Special Offer Banner Uploaded",
        description: "Your banner is now live and automatically scales without cropping across desktop and mobile.",
      });
      await refetch();
    } catch (err) {
      const msg = (err as Error).message;
      toast({
        title: "Upload failed",
        description: /unknown action/i.test(msg)
          ? "Offer banner uploads go live once this draft is accepted."
          : msg,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeBanner = async (path: string) => {
    if (!confirm("Are you sure you want to delete this offer banner?")) return;
    try {
      await callAdmin("offer_delete", { path });
      toast({ title: "Banner deleted" });
      await refetch();
    } catch (err) {
      toast({ title: "Failed to delete", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="border-t border-border/60 pt-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs uppercase tracking-luxe text-gold font-semibold">Special Offers Banner</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Zero-Crop Universal Sizing
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Upload a single promotional banner. The display automatically scales to fit both desktop and mobile screens with natural proportions and zero cropping.
        </p>
      </div>

      {/* Universal Single Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadBanner(e.dataTransfer?.files?.[0] ?? null);
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-gold bg-gold/10 scale-[1.01]"
            : "border-border/70 hover:border-gold/60 bg-muted/20 hover:bg-muted/30"
        }`}
      >
        {uploading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <p className="text-xs font-medium text-foreground">Uploading banner &amp; optimizing display…</p>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2.5">
              <ImagePlus className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">Click to upload or drag &amp; drop banner</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
              Recommended wide aspect ratio (e.g. 16:9 or 2:1, such as 1600 × 800) · Max 5MB (JPG, PNG, WEBP)
            </p>
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3 text-primary" /> Desktop optimized
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-primary" /> Mobile zero-crop
              </span>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_IMG}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            void uploadBanner(file);
          }}
        />
      </div>

      {/* Uploaded Offers List */}
      {offers.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-luxe text-foreground font-semibold">
              Active Offer Banners ({offers.length})
            </Label>
            <span className="text-[10px] text-muted-foreground">Rotates automatically every 7 seconds</span>
          </div>

          <div className="space-y-2.5">
            {offers.map((offer: SpecialOffer) => {
              const primaryImage = offer.legacy ?? offer.desktop ?? offer.mobile;
              if (!primaryImage) return null;

              return (
                <div
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border/70 rounded-xl p-3 bg-card shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={primaryImage.url}
                      alt={offer.name}
                      className="h-16 w-32 shrink-0 rounded-lg object-contain bg-muted/60 border border-border/50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {primaryImage.name.replace(/^[0-9]+-/, "")}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Universal (Desktop &amp; Mobile)</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        Path: {primaryImage.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBanner(primaryImage.path)}
                      className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs"
                      title="Delete offer banner"
                    >
                      <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOffersAdminSection;
