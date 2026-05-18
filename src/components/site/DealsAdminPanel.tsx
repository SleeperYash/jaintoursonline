import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Upload, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64, adminPublicUrl } from "@/hooks/useAdminAuth";
import { useDeals, type Deal } from "@/hooks/useDeals";
import { useStampPhotos, STAMP_SLOTS } from "@/hooks/useStampPhotos";

type Props = {
  callAdmin: (action: string, payload?: Record<string, unknown>) => Promise<any>;
};

const ACCEPT_IMG = "image/jpeg,image/jpg,image/png,image/webp";

const emptyForm = () => ({
  destination_name: "",
  duration: "",
  price: "",
  price_label: "PER PERSON · EXCL. AIRFARE",
  inc_hotel: true,
  inc_breakfast: true,
  inc_sightseeing: true,
  inc_transport: true,
  active: true,
  sort_order: 0,
});

const DealsAdminPanel = ({ callAdmin }: Props) => {
  const { toast } = useToast();
  const { deals, refetch } = useDeals();
  const { photos, refetch: refetchStamps } = useStampPhotos();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setFile(null);
    setOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({
      destination_name: d.destination_name,
      duration: d.duration,
      price: String(d.price),
      price_label: d.price_label,
      inc_hotel: d.inc_hotel,
      inc_breakfast: d.inc_breakfast,
      inc_sightseeing: d.inc_sightseeing,
      inc_transport: d.inc_transport,
      active: d.active,
      sort_order: d.sort_order,
    });
    setFile(null);
    setOpen(true);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Image only", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5MB", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleSave = async () => {
    if (!form.destination_name.trim() || !form.duration.trim() || !form.price) {
      toast({ title: "Name, duration and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        destination_name: form.destination_name.trim(),
        duration: form.duration.trim(),
        price: Number(form.price),
        price_label: form.price_label.trim() || "PER PERSON · EXCL. AIRFARE",
        inc_hotel: form.inc_hotel,
        inc_breakfast: form.inc_breakfast,
        inc_sightseeing: form.inc_sightseeing,
        inc_transport: form.inc_transport,
        active: form.active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (file) {
        payload.file_base64 = await fileToBase64(file);
        payload.file_name = file.name;
        payload.content_type = file.type;
      }
      if (editing) {
        payload.id = editing.id;
        await callAdmin("deal_update", payload);
      } else {
        await callAdmin("deal_create", payload);
      }
      toast({ title: editing ? "Deal updated" : "Deal added" });
      setOpen(false);
      await refetch();
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: Deal) => {
    if (!confirm(`Delete deal "${d.destination_name}"?`)) return;
    try {
      await callAdmin("deal_delete", { id: d.id });
      toast({ title: "Deleted" });
      await refetch();
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleStampUpload = useCallback(
    async (stampKey: string, f: File) => {
      if (!f.type.startsWith("image/")) {
        toast({ title: "Image only", variant: "destructive" });
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: "Max 5MB", variant: "destructive" });
        return;
      }
      try {
        const file_base64 = await fileToBase64(f);
        await callAdmin("stamp_upload", {
          stamp_key: stampKey,
          file_name: f.name,
          content_type: f.type,
          file_base64,
        });
        toast({ title: "Stamp updated" });
        await refetchStamps();
      } catch (err) {
        toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
      }
    },
    [callAdmin, refetchStamps, toast],
  );

  return (
    <div className="space-y-8">
      {/* Deals list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-luxe text-gold">Manage Deal Slides</p>
          <Button
            size="sm"
            onClick={openNew}
            className="bg-gold text-primary-foreground hover:bg-gold/90"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New Deal
          </Button>
        </div>

        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-border/60 p-4 rounded-md">
            No deals yet. Click "Add New Deal".
          </p>
        ) : (
          <div className="space-y-2">
            {deals.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 border border-border/60 p-2 rounded-md"
              >
                <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                  {d.image_path ? (
                    <img src={adminPublicUrl(d.image_path)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/40">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {d.destination_name}{" "}
                    {!d.active && <span className="text-[10px] text-muted-foreground">(hidden)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {d.duration} · ₹{Number(d.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {[
                      d.inc_hotel && "Hotel",
                      d.inc_breakfast && "Breakfast",
                      d.inc_sightseeing && "Sightseeing",
                      d.inc_transport && "Transport",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(d)}
                    className="p-2 text-foreground/70 hover:text-gold"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    className="p-2 text-foreground/70 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stamp photos */}
      <div>
        <p className="text-xs uppercase tracking-luxe text-gold mb-3">Stamp Destination Photos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAMP_SLOTS.map((slot) => {
            const img = photos[slot.key] ?? null;
            return (
              <div
                key={slot.key}
                className="border border-border/60 rounded-md p-2 bg-card"
              >
                <div
                  className="w-full aspect-[4/5] rounded overflow-hidden mb-2 flex items-center justify-center"
                  style={{
                    background: img ? "transparent" : `${slot.borderColor}22`,
                    border: `2px solid ${slot.borderColor}`,
                  }}
                >
                  {img ? (
                    <img src={img} alt={slot.label} className="w-full h-full object-cover" />
                  ) : (
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: slot.borderColor }}
                    >
                      No photo
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-center font-bold tracking-widest text-foreground mb-2">
                  {slot.label}
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept={ACCEPT_IMG}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) handleStampUpload(slot.key, f);
                    }}
                  />
                  <span className="block text-center cursor-pointer text-[10px] uppercase tracking-luxe px-2 py-1.5 border border-gold/60 text-gold hover:bg-gold/10 transition rounded">
                    <Upload className="w-3 h-3 inline mr-1" /> Upload Photo
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[95vw] bg-card border-border/60 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editing ? "Edit Deal" : "Add New Deal"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-light">
              Fill in the deal details. The image becomes the slide background.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-luxe">Destination Name *</Label>
              <Input
                value={form.destination_name}
                onChange={(e) => setForm((f) => ({ ...f, destination_name: e.target.value }))}
                placeholder="Thailand"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-luxe">Duration *</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="4 Nights / 5 Days"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-luxe">Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="29999"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-luxe">Price Label</Label>
              <Input
                value={form.price_label}
                onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-luxe">Inclusions</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  ["inc_hotel", "Hotel"],
                  ["inc_breakfast", "Breakfast"],
                  ["inc_sightseeing", "Sightseeing"],
                  ["inc_transport", "Transport"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={(v) =>
                        setForm((f) => ({ ...f, [key]: !!v }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-luxe">Upload Deal Background Photo</Label>
              <p className="text-[11px] text-muted-foreground mt-1">
                This image will appear as the background of the deal slide card.
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
                  const f = e.dataTransfer?.files?.[0];
                  if (f) handleFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition ${
                  dragOver ? "border-gold bg-gold/5" : "border-border/60"
                }`}
              >
                {preview || (editing?.image_path && !file) ? (
                  <img
                    src={preview ?? (editing?.image_path ? adminPublicUrl(editing.image_path) : "")}
                    alt="preview"
                    className="mx-auto max-h-40 rounded"
                  />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-xs text-foreground">Drag & drop or click to upload</p>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP · max 5MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_IMG}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    handleFile(f);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <Label className="text-sm">Active (visible on homepage)</Label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gold text-primary-foreground hover:bg-gold/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealsAdminPanel;