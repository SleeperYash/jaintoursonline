import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Crop, RotateCcw, Check, Loader2 } from "lucide-react";

type Props = {
  file: File;
  /** Called with the cropped result (as a File). If null, user cleared crop and wants original. */
  onConfirm: (result: File) => void;
  onCancel: () => void;
  aspect?: number;
  /** Max output dimension (longer side) for resize. Defaults to 1200px. */
  maxDimension?: number;
};

const getCroppedBlob = async (
  src: string,
  area: Area,
  maxDim: number,
  type: string,
): Promise<Blob> => {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not load image for cropping"));
    i.src = src;
  });
  const scale = Math.min(1, maxDim / Math.max(area.width, area.height));
  const outW = Math.max(1, Math.round(area.width * scale));
  const outH = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image editor is unavailable in this browser");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outW, outH);
  const outType = type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Crop failed"))), outType, 0.9),
  );
};

const ReviewPhotoEditor = ({
  file,
  onConfirm,
  onCancel,
  aspect = 1,
  maxDimension = 1200,
}: Props) => {
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleApply = async () => {
    if (!area) {
      onConfirm(file);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedBlob(src, area, maxDimension, file.type);
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const base = file.name.replace(/\.[^.]+$/, "") || "photo";
      const result = new File([blob], `${base}-cropped.${ext}`, { type: blob.type });
      onConfirm(result);
    } catch (err) {
      setError((err as Error).message || "Crop failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = () => onConfirm(file);

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 bg-background border border-border/60 rounded-md overflow-hidden">
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            objectFit="contain"
          />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Crop className="w-4 h-4 text-gold shrink-0" />
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.05}
          onValueChange={(v) => setZoom(v[0])}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setCrop({ x: 0, y: 0 });
          }}
          className="p-2 text-foreground/60 hover:text-gold"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={handleSkip} disabled={busy}>
          Use original
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          disabled={busy}
          className="bg-gold text-primary-foreground hover:bg-gold/90"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Apply crop
        </Button>
      </div>
    </div>
  );
};

export default ReviewPhotoEditor;
