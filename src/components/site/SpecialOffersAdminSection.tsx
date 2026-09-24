import { useRef, useState } from "react";
import { Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64 } from "@/hooks/useAdminAuth";
import { useSpecialOffers, type SpecialOffer, type SpecialOfferVariant } from "@/hooks/useSpecialOffers";
import { Button } from "@/components/ui/button";

type Props = {
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<any>;
};

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp";
type BannerVariant = "desktop" | "mobile";

const SpecialOffersAdminSection = ({ callAdmin }: Props) => {
  const { toast } = useToast();
  const { offers, refetch } = useSpecialOffers();
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (f: File | null, variant: BannerVariant, offerId?: string) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Image only", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5MB", variant: "destructive" });
      return;
    }
    const uploadKey = `${offerId ?? "new"}-${variant}`;
    setUploading(uploadKey);
    try {
      await callAdmin("offer_upload", {
        file_base64: await fileToBase64(f),
        file_name: f.name,
        content_type: f.type,
        variant,
        offer_id: offerId,
      });
      toast({ title: `${variant === "desktop" ? "Desktop" : "Mobile"} banner uploaded` });
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
      setUploading(null);
    }
  };

  const UploadBox = ({ variant, offerId, compact = false }: { variant: BannerVariant; offerId?: string; compact?: boolean }) => {
    const key = `${offerId ?? "new"}-${variant}`;
    const inputRef = offerId ? undefined : variant === "desktop" ? desktopInputRef : mobileInputRef;
    const localRef = useRef<HTMLInputElement>(null);
    const activeRef = inputRef ?? localRef;
    const busy = uploading === key;
    return (
      <div
        onDragOver={(event) => { event.preventDefault(); setDragOver(key); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(null);
          void upload(event.dataTransfer?.files?.[0] ?? null, variant, offerId);
        }}
        onClick={() => !busy && activeRef.current?.click()}
        className={`border-2 border-dashed rounded-md text-center cursor-pointer transition ${compact ? "p-3" : "p-4"} ${dragOver === key ? "border-gold bg-gold/5" : "border-border/60"}`}
      >
        {busy ? (
          <p className="text-xs text-foreground flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</p>
        ) : (
          <><ImagePlus className={`${compact ? "w-5 h-5" : "w-6 h-6"} text-gold mx-auto mb-2`} /><p className="text-xs text-foreground">{compact ? `Add ${variant} version` : `Upload ${variant} banner`}</p>{!compact && <p className="text-[10px] text-muted-foreground mt-1">{variant === "desktop" ? "Recommended 1400 × 420" : "Recommended 1080 × 540"} · max 5MB</p>}</>
        )}
        <input ref={activeRef} type="file" accept={ACCEPT_IMG} className="hidden" onChange={(event) => { const file = event.target.files?.[0] ?? null; event.target.value = ""; void upload(file, variant, offerId); }} />
      </div>
    );
  };

  const VariantPreview = ({ offer, variant, image }: { offer: SpecialOffer; variant: BannerVariant; image: SpecialOfferVariant | null }) => image ? (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">{variant}</p>
      <div className="flex items-center gap-2">
        <img src={image.url} alt="" className="w-28 h-12 object-contain rounded bg-muted shrink-0" />
        <p className="flex-1 min-w-0 text-[11px] text-muted-foreground truncate">{image.name}</p>
        <Button type="button" variant="ghost" size="icon" onClick={() => remove(image.path)} title={`Delete ${variant} banner`} className="text-foreground/70 hover:text-destructive shrink-0"><Trash2 /></Button>
      </div>
    </div>
  ) : <UploadBox variant={variant} offerId={offer.id} compact />;

  const remove = async (path: string) => {
    if (!confirm("Delete this offer banner?")) return;
    try {
      await callAdmin("offer_delete", { path });
      toast({ title: "Deleted" });
      await refetch();
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="border-t border-border/60 pt-6">
      <p className="text-xs uppercase tracking-luxe text-gold mb-1">Special Offers Banner</p>
      <p className="text-[11px] text-muted-foreground mb-3">
        Upload a wide desktop banner and a separate mobile banner for each offer. If one version is
        missing, the available image is used automatically. Banners rotate every 7 seconds.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <UploadBox variant="desktop" />
        <UploadBox variant="mobile" />
      </div>

      {offers.length > 0 && (
        <div className="mt-3 space-y-2">
          <Label className="text-xs uppercase tracking-luxe">Uploaded Offers</Label>
          {offers.map((o) => (
            <div key={o.id} className="border border-border/60 p-3 rounded-md space-y-3">
              <p className="text-xs text-foreground truncate">{o.name}</p>
              {o.legacy ? (
                <div className="flex items-center gap-2">
                  <img src={o.legacy.url} alt="" className="w-28 h-12 object-contain rounded bg-muted shrink-0" />
                  <p className="flex-1 text-[11px] text-muted-foreground">Shared desktop and mobile fallback</p>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(o.legacy?.path ?? "")} title="Delete banner" className="text-foreground/70 hover:text-destructive"><Trash2 /></Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <VariantPreview offer={o} variant="desktop" image={o.desktop} />
                  <VariantPreview offer={o} variant="mobile" image={o.mobile} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffersAdminSection;
