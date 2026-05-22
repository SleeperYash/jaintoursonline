// Admin password-gated management for itineraries AND destination images.
// Public site never gets the admin password — it lives only as a server secret.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const decodeBase64File = (fileBase64: unknown) => {
  if (typeof fileBase64 !== "string" || !fileBase64.trim()) {
    throw new Error("Missing image data");
  }
  const raw = fileBase64.includes(",") ? fileBase64.split(",").pop() ?? "" : fileBase64;
  const bin = atob(raw);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const safeFileName = (fileName: unknown) =>
  String(fileName || "photo.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");

const normalizeImageType = (contentType: unknown) => {
  const type = String(contentType || "").toLowerCase();
  return type === "image/jpg" ? "image/jpeg" : type;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!ADMIN_PASSWORD || !SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "Server not configured" }, 500);
  }

  const provided = req.headers.get("x-admin-password") ?? "";
  if (provided !== ADMIN_PASSWORD) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ ok: false, error: "Invalid password" });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = body?.action as string;

  try {
    // ---------- AUTH ----------
    if (action === "verify") {
      return json({ ok: true });
    }

    // ---------- ITINERARIES (existing) ----------
    if (action === "upload") {
      const { destination_slug, title, file_base64, file_name, file_size, content_type } = body ?? {};
      if (!destination_slug || !title || !file_base64 || !file_name) {
        return json({ error: "Missing fields" }, 400);
      }
      if (content_type !== "application/pdf") {
        return json({ error: "Only PDF files allowed" }, 400);
      }
      const bin = atob(file_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (bytes.byteLength > 20 * 1024 * 1024) return json({ error: "Max 20MB" }, 400);

      const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${destination_slug}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("itineraries")
        .upload(path, bytes, { contentType: "application/pdf", upsert: false });
      if (upErr) return json({ error: upErr.message }, 500);

      const { data, error: dbErr } = await supabase
        .from("itineraries")
        .insert({
          destination_slug,
          title: String(title).trim(),
          file_path: path,
          file_size: file_size ?? bytes.byteLength,
        })
        .select()
        .single();
      if (dbErr) {
        await supabase.storage.from("itineraries").remove([path]);
        return json({ error: dbErr.message }, 500);
      }
      return json({ ok: true, itinerary: data });
    }

    if (action === "delete") {
      const { id } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: existing, error: fetchErr } = await supabase
        .from("itineraries")
        .select("file_path")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr) return json({ error: fetchErr.message }, 500);
      if (existing?.file_path) {
        await supabase.storage.from("itineraries").remove([existing.file_path]);
      }
      const { error: delErr } = await supabase.from("itineraries").delete().eq("id", id);
      if (delErr) return json({ error: delErr.message }, 500);
      return json({ ok: true });
    }

    // ---------- DESTINATION IMAGES ----------
    if (action === "image_upload") {
      const { destination_slug, file_base64, file_name, content_type, set_as_cover } = body ?? {};
      if (!destination_slug || !file_base64 || !file_name || !content_type) {
        return json({ error: "Missing fields" }, 400);
      }
      if (!ALLOWED_IMAGE_TYPES.has(String(content_type).toLowerCase())) {
        return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
      }
      const bin = atob(file_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (bytes.byteLength > 10 * 1024 * 1024) return json({ error: "Max 10MB per image" }, 400);

      const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `images/${destination_slug}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("itineraries")
        .upload(path, bytes, { contentType: String(content_type), upsert: false });
      if (upErr) return json({ error: upErr.message }, 500);

      // next position
      const { data: maxRow } = await supabase
        .from("destination_images")
        .select("position")
        .eq("destination_slug", destination_slug)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextPos = (maxRow?.position ?? -1) + 1;

      // first image becomes cover automatically if none set
      const { data: existingCover } = await supabase
        .from("destination_images")
        .select("id")
        .eq("destination_slug", destination_slug)
        .eq("is_cover", true)
        .maybeSingle();

      const willBeCover = !!set_as_cover || !existingCover;

      if (willBeCover && existingCover) {
        await supabase
          .from("destination_images")
          .update({ is_cover: false })
          .eq("id", existingCover.id);
      }

      const { data, error: dbErr } = await supabase
        .from("destination_images")
        .insert({
          destination_slug,
          file_path: path,
          file_size: bytes.byteLength,
          content_type: String(content_type),
          position: nextPos,
          is_cover: willBeCover,
        })
        .select()
        .single();
      if (dbErr) {
        await supabase.storage.from("itineraries").remove([path]);
        return json({ error: dbErr.message }, 500);
      }
      return json({ ok: true, image: data });
    }

    if (action === "image_replace") {
      const { id, file_base64, file_name, content_type } = body ?? {};
      if (!id || !file_base64 || !file_name || !content_type) {
        return json({ error: "Missing fields" }, 400);
      }
      if (!ALLOWED_IMAGE_TYPES.has(String(content_type).toLowerCase())) {
        return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
      }
      const { data: existing, error: fetchErr } = await supabase
        .from("destination_images")
        .select("file_path,destination_slug")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr || !existing) return json({ error: fetchErr?.message ?? "Not found" }, 404);

      const bin = atob(file_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (bytes.byteLength > 10 * 1024 * 1024) return json({ error: "Max 10MB per image" }, 400);

      const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `images/${existing.destination_slug}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("itineraries")
        .upload(path, bytes, { contentType: String(content_type), upsert: false });
      if (upErr) return json({ error: upErr.message }, 500);

      const { data, error: updErr } = await supabase
        .from("destination_images")
        .update({
          file_path: path,
          file_size: bytes.byteLength,
          content_type: String(content_type),
        })
        .eq("id", id)
        .select()
        .single();
      if (updErr) {
        await supabase.storage.from("itineraries").remove([path]);
        return json({ error: updErr.message }, 500);
      }
      // delete the previous file
      if (existing.file_path) {
        await supabase.storage.from("itineraries").remove([existing.file_path]);
      }
      return json({ ok: true, image: data });
    }

    if (action === "image_delete") {
      const { id } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: existing, error: fetchErr } = await supabase
        .from("destination_images")
        .select("file_path,destination_slug,is_cover")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr) return json({ error: fetchErr.message }, 500);
      if (!existing) return json({ error: "Not found" }, 404);

      const { error: delErr } = await supabase.from("destination_images").delete().eq("id", id);
      if (delErr) return json({ error: delErr.message }, 500);
      if (existing.file_path) {
        await supabase.storage.from("itineraries").remove([existing.file_path]);
      }

      // If we deleted the cover, promote the first remaining image
      if (existing.is_cover) {
        const { data: next } = await supabase
          .from("destination_images")
          .select("id")
          .eq("destination_slug", existing.destination_slug)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (next) {
          await supabase
            .from("destination_images")
            .update({ is_cover: true })
            .eq("id", next.id);
        }
      }
      return json({ ok: true });
    }

    if (action === "image_clear_cover") {
      const { destination_slug } = body ?? {};
      if (!destination_slug) return json({ error: "Missing destination_slug" }, 400);
      const { error: updErr } = await supabase
        .from("destination_images")
        .update({ is_cover: false })
        .eq("destination_slug", destination_slug)
        .eq("is_cover", true);
      if (updErr) return json({ error: updErr.message }, 500);
      return json({ ok: true });
    }

    if (action === "image_set_cover") {
      const { id } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: target, error: fetchErr } = await supabase
        .from("destination_images")
        .select("destination_slug")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr || !target) return json({ error: fetchErr?.message ?? "Not found" }, 404);

      // Clear current cover, then set new (unique partial index requires ordered ops)
      await supabase
        .from("destination_images")
        .update({ is_cover: false })
        .eq("destination_slug", target.destination_slug)
        .eq("is_cover", true);

      const { error: updErr } = await supabase
        .from("destination_images")
        .update({ is_cover: true })
        .eq("id", id);
      if (updErr) return json({ error: updErr.message }, 500);
      return json({ ok: true });
    }

    if (action === "image_reorder") {
      const { destination_slug, ordered_ids } = body ?? {};
      if (!destination_slug || !Array.isArray(ordered_ids)) {
        return json({ error: "Missing fields" }, 400);
      }
      // Update positions sequentially
      for (let i = 0; i < ordered_ids.length; i++) {
        const id = ordered_ids[i];
        const { error: updErr } = await supabase
          .from("destination_images")
          .update({ position: i })
          .eq("id", id)
          .eq("destination_slug", destination_slug);
        if (updErr) return json({ error: updErr.message }, 500);
      }
      return json({ ok: true });
    }

    // ---------- CLIENT REVIEWS ----------
    if (action === "review_create") {
      const { name, destination, text, rating, date_label, file_base64, file_name, content_type } = body ?? {};
      if (!name || !text) return json({ error: "Missing name or text" }, 400);
      let image_path: string | null = null;
      if (file_base64 && file_name && content_type) {
        if (!ALLOWED_IMAGE_TYPES.has(String(content_type).toLowerCase())) {
          return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
        }
        const bin = atob(file_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (bytes.byteLength > 10 * 1024 * 1024) return json({ error: "Max 10MB per image" }, 400);
        const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
        image_path = `reviews/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("itineraries")
          .upload(image_path, bytes, { contentType: String(content_type), upsert: false });
        if (upErr) return json({ error: upErr.message }, 500);
      }
      const { data: maxRow } = await supabase
        .from("client_reviews")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextPos = (maxRow?.position ?? -1) + 1;
      const { data, error: dbErr } = await supabase
        .from("client_reviews")
        .insert({
          name: String(name).trim(),
          destination: destination ? String(destination).trim() : null,
          text: String(text).trim(),
          rating: Math.max(1, Math.min(5, Number(rating) || 5)),
          date_label: date_label ? String(date_label).trim() : null,
          image_path,
          position: nextPos,
        })
        .select()
        .single();
      if (dbErr) {
        if (image_path) await supabase.storage.from("itineraries").remove([image_path]);
        return json({ error: dbErr.message }, 500);
      }
      return json({ ok: true, review: data });
    }

    if (action === "review_update") {
      const {
        id,
        name,
        destination,
        text,
        rating,
        date_label,
        file_base64,
        file_name,
        content_type,
        remove_image,
      } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: existing, error: fetchErr } = await supabase
        .from("client_reviews")
        .select("image_path")
        .eq("id", id)
        .maybeSingle();
      if (fetchErr || !existing) return json({ error: fetchErr?.message ?? "Not found" }, 404);

      const updates: Record<string, unknown> = {};
      if (typeof name === "string") updates.name = name.trim();
      if (typeof text === "string") updates.text = text.trim();
      if (destination !== undefined)
        updates.destination = destination ? String(destination).trim() : null;
      if (date_label !== undefined)
        updates.date_label = date_label ? String(date_label).trim() : null;
      if (rating !== undefined)
        updates.rating = Math.max(1, Math.min(5, Number(rating) || 5));

      let oldPathToRemove: string | null = null;

      if (file_base64 && file_name && content_type) {
        const imageType = normalizeImageType(content_type);
        if (!ALLOWED_IMAGE_TYPES.has(imageType)) {
          return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
        }
        const bytes = decodeBase64File(file_base64);
        if (bytes.byteLength > 10 * 1024 * 1024) return json({ error: "Max 10MB per image" }, 400);
        const safe = safeFileName(file_name);
        const path = `reviews/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("itineraries")
          .upload(path, bytes, { contentType: imageType, upsert: true });
        if (upErr) return json({ error: `Image upload failed: ${upErr.message}` }, 500);
        updates.image_path = path;
        if (existing.image_path) oldPathToRemove = existing.image_path;
      } else if (remove_image && existing.image_path) {
        updates.image_path = null;
        oldPathToRemove = existing.image_path;
      }

      const { data, error: updErr } = await supabase
        .from("client_reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (updErr) {
        if (updates.image_path) await supabase.storage.from("itineraries").remove([String(updates.image_path)]);
        return json({ error: updErr.message }, 500);
      }
      if (oldPathToRemove) {
        await supabase.storage.from("itineraries").remove([oldPathToRemove]);
      }
      return json({ ok: true, review: data });
    }

    if (action === "review_delete") {
      const { id } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: existing } = await supabase
        .from("client_reviews")
        .select("image_path")
        .eq("id", id)
        .maybeSingle();
      const { error: delErr } = await supabase.from("client_reviews").delete().eq("id", id);
      if (delErr) return json({ error: delErr.message }, 500);
      if (existing?.image_path) {
        await supabase.storage.from("itineraries").remove([existing.image_path]);
      }
      return json({ ok: true });
    }

    // ---------- DEALS ----------
    if (action === "deal_list") {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, deals: data ?? [] });
    }

    if (action === "deal_create" || action === "deal_update") {
      const {
        id,
        destination_name,
        duration,
        price,
        price_label,
        inc_hotel,
        inc_breakfast,
        inc_sightseeing,
        inc_transport,
        active,
        sort_order,
        file_base64,
        file_name,
        content_type,
        remove_image,
      } = body ?? {};

      let image_path: string | null | undefined = undefined;
      let oldPathToRemove: string | null = null;

      if (file_base64 && file_name && content_type) {
        if (!ALLOWED_IMAGE_TYPES.has(String(content_type).toLowerCase())) {
          return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
        }
        const bin = atob(file_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (bytes.byteLength > 5 * 1024 * 1024) return json({ error: "Max 5MB per image" }, 400);
        const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
        image_path = `deals/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("itineraries")
          .upload(image_path, bytes, { contentType: String(content_type), upsert: false });
        if (upErr) return json({ error: upErr.message }, 500);
      }

      if (action === "deal_create") {
        if (!destination_name || !duration || price === undefined || price === null) {
          return json({ error: "Missing fields" }, 400);
        }
        const { data, error: dbErr } = await supabase
          .from("deals")
          .insert({
            destination_name: String(destination_name).trim(),
            duration: String(duration).trim(),
            price: Number(price),
            price_label: price_label ? String(price_label).trim() : undefined,
            inc_hotel: inc_hotel !== false,
            inc_breakfast: inc_breakfast !== false,
            inc_sightseeing: inc_sightseeing !== false,
            inc_transport: inc_transport !== false,
            active: active !== false,
            sort_order: Number(sort_order) || 0,
            image_path: image_path ?? null,
          })
          .select()
          .single();
        if (dbErr) {
          if (image_path) await supabase.storage.from("itineraries").remove([image_path]);
          return json({ error: dbErr.message }, 500);
        }
        return json({ ok: true, deal: data });
      } else {
        if (!id) return json({ error: "Missing id" }, 400);
        const { data: existing } = await supabase
          .from("deals")
          .select("image_path")
          .eq("id", id)
          .maybeSingle();
        const updates: Record<string, unknown> = {};
        if (destination_name !== undefined) updates.destination_name = String(destination_name).trim();
        if (duration !== undefined) updates.duration = String(duration).trim();
        if (price !== undefined) updates.price = Number(price);
        if (price_label !== undefined) updates.price_label = String(price_label).trim();
        if (inc_hotel !== undefined) updates.inc_hotel = !!inc_hotel;
        if (inc_breakfast !== undefined) updates.inc_breakfast = !!inc_breakfast;
        if (inc_sightseeing !== undefined) updates.inc_sightseeing = !!inc_sightseeing;
        if (inc_transport !== undefined) updates.inc_transport = !!inc_transport;
        if (active !== undefined) updates.active = !!active;
        if (sort_order !== undefined) updates.sort_order = Number(sort_order) || 0;
        if (image_path !== undefined) {
          updates.image_path = image_path;
          if (existing?.image_path) oldPathToRemove = existing.image_path;
        } else if (remove_image && existing?.image_path) {
          updates.image_path = null;
          oldPathToRemove = existing.image_path;
        }
        const { data, error: updErr } = await supabase
          .from("deals")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (updErr) return json({ error: updErr.message }, 500);
        if (oldPathToRemove) await supabase.storage.from("itineraries").remove([oldPathToRemove]);
        return json({ ok: true, deal: data });
      }
    }

    if (action === "deal_delete") {
      const { id } = body ?? {};
      if (!id) return json({ error: "Missing id" }, 400);
      const { data: existing } = await supabase
        .from("deals")
        .select("image_path")
        .eq("id", id)
        .maybeSingle();
      const { error: delErr } = await supabase.from("deals").delete().eq("id", id);
      if (delErr) return json({ error: delErr.message }, 500);
      if (existing?.image_path) await supabase.storage.from("itineraries").remove([existing.image_path]);
      return json({ ok: true });
    }

    // ---------- STAMP PHOTOS ----------
    if (action === "stamp_upload") {
      const { stamp_key, file_base64, file_name, content_type } = body ?? {};
      if (!stamp_key || !file_base64 || !file_name || !content_type) {
        return json({ error: "Missing fields" }, 400);
      }
      if (!ALLOWED_IMAGE_TYPES.has(String(content_type).toLowerCase())) {
        return json({ error: "Only JPG, PNG, WEBP or AVIF images allowed" }, 400);
      }
      const bin = atob(file_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (bytes.byteLength > 5 * 1024 * 1024) return json({ error: "Max 5MB per image" }, 400);

      const safe = String(file_name).replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `stamps/${stamp_key}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("itineraries")
        .upload(path, bytes, { contentType: String(content_type), upsert: false });
      if (upErr) return json({ error: upErr.message }, 500);

      const { data: existing } = await supabase
        .from("stamp_photos")
        .select("image_path")
        .eq("stamp_key", stamp_key)
        .maybeSingle();

      const { data, error: updErr } = await supabase
        .from("stamp_photos")
        .upsert({ stamp_key, image_path: path, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (updErr) {
        await supabase.storage.from("itineraries").remove([path]);
        return json({ error: updErr.message }, 500);
      }
      if (existing?.image_path) {
        await supabase.storage.from("itineraries").remove([existing.image_path]);
      }
      return json({ ok: true, stamp: data });
    }

    if (action === "stamp_clear") {
      const { stamp_key } = body ?? {};
      if (!stamp_key) return json({ error: "Missing stamp_key" }, 400);
      const { data: existing } = await supabase
        .from("stamp_photos")
        .select("image_path")
        .eq("stamp_key", stamp_key)
        .maybeSingle();
      const { error: updErr } = await supabase
        .from("stamp_photos")
        .update({ image_path: null })
        .eq("stamp_key", stamp_key);
      if (updErr) return json({ error: updErr.message }, 500);
      if (existing?.image_path) await supabase.storage.from("itineraries").remove([existing.image_path]);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
