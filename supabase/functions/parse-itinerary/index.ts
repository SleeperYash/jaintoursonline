// Parse an uploaded itinerary PDF into normalized, editable Supabase rows.
// ADMIN-ONLY: requires the admin password (header `x-admin-password` or body
// `admin_password`). This is invoked from `admin-itineraries` immediately
// after an admin uploads or replaces a PDF — never from visitor pages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Parsed = {
  title: string | null;
  destination: string | null;
  duration: string | null;
  starting_price: string | null;
  overview: string | null;
  visa_information: string | null;
  terms_conditions: string | null;
  days: { day_number: number; title: string; description: string }[];
  hotels: { city: string; hotel_name: string; nights: number | null }[];
  inclusions: string[];
  exclusions: string[];
};

const SYSTEM = `You are a precise travel-itinerary parser. You receive raw text extracted from a tour itinerary PDF.
Return STRICT JSON using the provided tool. Rules:
- "title": package/tour title as printed (e.g. "Majestic Dubai 5N/6D"). null if not found.
- "destination": the main destination/country (e.g. "Dubai", "Thailand"). null if not clear.
- "duration": as printed (e.g. "5 Nights / 6 Days", "4N/5D"). null if not present.
- "starting_price": lowest "starting from" / "per person" price exactly as printed with currency (e.g. "₹49,999"). null if not found.
- "overview": 2-4 short sentences describing the trip. null if not present.
- "visa_information": short paragraph about visa if mentioned, else null.
- "terms_conditions": full terms & conditions / cancellation / payment terms text if printed, else null.
- "days": array, one entry per day. day_number is 1-based. title like "Arrival in Dubai". description is the full paragraph for that day with activities merged in.
- "hotels": array of accommodations. For each: city, hotel_name (use "TBD" or hotel category if exact name not printed), nights (integer or null).
- "inclusions": clean bullet strings of what is included.
- "exclusions": clean bullet strings of what is NOT included.
Never invent content. If a section is missing, return empty array or null. Strip markers like "•", "-", "✔".`;

const TOOL = {
  type: "function",
  function: {
    name: "save_itinerary",
    description: "Save structured itinerary data",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: ["string", "null"] },
        destination: { type: ["string", "null"] },
        duration: { type: ["string", "null"] },
        starting_price: { type: ["string", "null"] },
        overview: { type: ["string", "null"] },
        visa_information: { type: ["string", "null"] },
        terms_conditions: { type: ["string", "null"] },
        days: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              day_number: { type: "number" },
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["day_number", "title", "description"],
          },
        },
        hotels: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              city: { type: "string" },
              hotel_name: { type: "string" },
              nights: { type: ["number", "null"] },
            },
            required: ["city", "hotel_name", "nights"],
          },
        },
        inclusions: { type: "array", items: { type: "string" } },
        exclusions: { type: "array", items: { type: "string" } },
      },
      required: [
        "title",
        "destination",
        "duration",
        "starting_price",
        "overview",
        "visa_information",
        "terms_conditions",
        "days",
        "hotels",
        "inclusions",
        "exclusions",
      ],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "";
  if (!SUPABASE_URL || !SERVICE_ROLE || !LOVABLE_API_KEY || !ADMIN_PASSWORD) {
    return json({ error: "Server not configured" }, 500);
  }

  let body: { itinerary_id?: string; admin_password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // ADMIN-ONLY. Visitors must never reach Gemini.
  const providedPwd =
    req.headers.get("x-admin-password") ?? body.admin_password ?? "";
  if (providedPwd !== ADMIN_PASSWORD) {
    return json({ error: "Forbidden" }, 403);
  }

  const { itinerary_id } = body;
  if (!itinerary_id) return json({ error: "Missing itinerary_id" }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: row, error: rowErr } = await supabase
    .from("itineraries")
    .select("id,file_path,starting_price,duration")
    .eq("id", itinerary_id)
    .maybeSingle();
  if (rowErr || !row) return json({ error: rowErr?.message ?? "Not found" }, 404);

  // Download PDF
  const { data: file, error: dlErr } = await supabase.storage
    .from("itineraries")
    .download(row.file_path);
  if (dlErr || !file) return json({ error: dlErr?.message ?? "Download failed" }, 500);

  let rawText = "";
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    rawText = Array.isArray(text) ? text.join("\n") : String(text ?? "");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF parse failed";
    await supabase.from("itineraries").update({ parse_error: msg }).eq("id", itinerary_id);
    return json({ error: msg }, 500);
  }

  const clipped = rawText.slice(0, 80000);

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Itinerary PDF text:\n\n${clipped}` },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "save_itinerary" } },
    }),
  });

  if (!aiRes.ok) {
    const t = await aiRes.text();
    console.error("AI gateway error", aiRes.status, t);
    await supabase.from("itineraries").update({ parse_error: `AI ${aiRes.status}` }).eq("id", itinerary_id);
    return json({ error: `AI error: ${aiRes.status}` }, 502);
  }
  const aiJson = await aiRes.json();
  const call = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) {
    return json({ error: "No structured output" }, 502);
  }
  let parsed: Parsed;
  try {
    parsed = JSON.parse(call.function.arguments);
  } catch {
    return json({ error: "Bad JSON from AI" }, 502);
  }

  // Write scalar fields. Don't overwrite manual price/duration edits if the
  // admin already supplied them on upload (row.starting_price / row.duration).
  const scalarUpdate: Record<string, unknown> = {
    overview: parsed.overview ?? null,
    visa_information: parsed.visa_information ?? null,
    terms_conditions: parsed.terms_conditions ?? null,
    destination: parsed.destination ?? null,
    ai_processed: true,
    parsed_at: new Date().toISOString(),
    parse_error: null,
    // Keep legacy parsed_data populated for any old reader still around
    parsed_data: parsed,
  };
  if (!row.starting_price && parsed.starting_price) {
    scalarUpdate.starting_price = parsed.starting_price;
  }
  if (!row.duration && parsed.duration) {
    scalarUpdate.duration = parsed.duration;
  }
  if (parsed.title) {
    // Only update title if admin left it empty — not the case at upload time,
    // but defensive. Title is required at upload, skip.
  }
  await supabase.from("itineraries").update(scalarUpdate).eq("id", itinerary_id);

  // Replace child rows atomically (delete + insert).
  await supabase.from("itinerary_days").delete().eq("itinerary_id", itinerary_id);
  await supabase.from("itinerary_hotels").delete().eq("itinerary_id", itinerary_id);
  await supabase.from("itinerary_inclusions").delete().eq("itinerary_id", itinerary_id);
  await supabase.from("itinerary_exclusions").delete().eq("itinerary_id", itinerary_id);

  if (parsed.days?.length) {
    await supabase.from("itinerary_days").insert(
      parsed.days.map((d, i) => ({
        itinerary_id,
        day_number: d.day_number || i + 1,
        title: d.title ?? "",
        description: d.description ?? "",
      })),
    );
  }
  if (parsed.hotels?.length) {
    await supabase.from("itinerary_hotels").insert(
      parsed.hotels.map((h, i) => ({
        itinerary_id,
        position: i,
        city: h.city ?? "",
        hotel_name: h.hotel_name ?? "",
        nights: h.nights ?? null,
      })),
    );
  }
  if (parsed.inclusions?.length) {
    await supabase.from("itinerary_inclusions").insert(
      parsed.inclusions.map((text, i) => ({
        itinerary_id,
        position: i,
        inclusion_text: text,
      })),
    );
  }
  if (parsed.exclusions?.length) {
    await supabase.from("itinerary_exclusions").insert(
      parsed.exclusions.map((text, i) => ({
        itinerary_id,
        position: i,
        exclusion_text: text,
      })),
    );
  }

  return json({ ok: true, parsed });
});