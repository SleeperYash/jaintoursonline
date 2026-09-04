import { useRef, useState } from "react";
import { Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64 } from "@/hooks/useAdminAuth";
import { useSpecialOffers } from "@/hooks/useSpecialOffers";

type Props = {
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<any>;
};

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp";

const SpecialOffersAdminSection = ({ callAdmin }: Props) => {
  const { toast } = useToast();
  const { offers, refetch } = useSpecialOffers();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Image only", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await callAdmin("offer_upload", {
        file_base64: await fileToBase64(f),
        file_name: f.name,
        content_type: f.type,
      });
      toast({ title: "Offer banner uploaded" });
      await refetch();
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

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
        Wide banner images shown above "Signature Travel Collections" on the homepage. They rotate
        automatically every 7 seconds. Best size: wide rectangle (e.g. 1920 × 450).
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer?.files?.[0] ?? null);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition ${
          dragOver ? "border-gold bg-gold/5" : "border-border/60"
        }`}
      >
        {uploading ? (
          <p className="text-xs text-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
          </p>
        ) : (
          <>
            <ImagePlus className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-xs text-foreground">Drag & drop or click to upload offer banner</p>
            <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP · max 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_IMG}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            e.target.value = "";
            void upload(f);
          }}
        />
      </div>

      {offers.length > 0 && (
        <div className="mt-3 space-y-2">
          <Label className="text-xs uppercase tracking-luxe">Uploaded Banners</Label>
          {offers.map((o) => (
            <div key={o.path} className="flex items-center gap-3 border border-border/60 p-2 rounded-md">
              <img src={o.url} alt="" className="w-28 h-12 object-cover rounded bg-muted shrink-0" />
              <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate">{o.name}</p>
              <button
                type="button"
                onClick={() => remove(o.path)}
                className="p-2 text-foreground/70 hover:text-destructive shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffersAdminSection;
