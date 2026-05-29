// Parse an uploaded itinerary PDF into structured JSON (overview, days, inclusions, exclusions, visa)
// using unpdf for text extraction + Lovable AI Gateway for structuring. Caches result on the row.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Parsed = {
  title: string | null;
  starting_price: string | null;
  overview: string | null;
  days: { title: string; body: string; activities?: string[] }[];
  inclusions: string[];
  exclusions: string[];
  visa: string | null;
};

const SYSTEM = `You are a precise travel-itinerary parser. You receive raw text extracted from a tour itinerary PDF.
Return STRICT JSON using the provided tool. Rules:
- "title": the package / tour title exactly as printed on the PDF (e.g. "Majestic Dubai 5N/6D"). null if not found.
- "starting_price": the lowest "starting from" / "per person" price exactly as printed, including currency symbol (e.g. "₹49,999", "INR 1,25,000", "$899"). null if not found.
- "overview": 2-4 short sentences describing the trip. null if not present.
- "days": array. One entry per day. "title" like "Day 1 - Arrival in Dubai". "body" is the full descriptive paragraph for that day (clean line breaks). "activities" is an optional list of bullet activities for that day if clearly listed.
- "inclusions": clean bullet strings of what's included.
- "exclusions": clean bullet strings of what's NOT included.
- "visa": short paragraph about visa if mentioned, else null.
Never invent content. If a section is missing, return empty array or null. Strip bullets/markers like "•", "-", "✔".`;

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
        starting_price: { type: ["string", "null"] },
        overview: { type: ["string", "null"] },
        days: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              body: { type: "string" },
              activities: { type: "array", items: { type: "string" } },
            },
            required: ["title", "body"],
          },
        },
        inclusions: { type: "array", items: { type: "string" } },
        exclusions: { type: "array", items: { type: "string" } },
        visa: { type: ["string", "null"] },
      },
      required: ["title", "starting_price", "overview", "days", "inclusions", "exclusions", "visa"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE || !LOVABLE_API_KEY) {
    return json({ error: "Server not configured" }, 500);
  }

  let body: { itinerary_id?: string; force?: boolean; admin_password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const { itinerary_id } = body;
  if (!itinerary_id) return json({ error: "Missing itinerary_id" }, 400);

  // Only honor `force` when a valid admin password (header or body) is presented.
  // This prevents anonymous callers from bypassing the parsed_data cache and
  // triggering repeated paid AI invocations.
  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "";
  const providedPwd =
    req.headers.get("x-admin-password") ?? body.admin_password ?? "";
  const isAdmin = !!ADMIN_PASSWORD && providedPwd === ADMIN_PASSWORD;
  const force = isAdmin && body.force === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: row, error: rowErr } = await supabase
    .from("itineraries")
    .select("id,file_path,parsed_data,parsed_at")
    .eq("id", itinerary_id)
    .maybeSingle();
  if (rowErr || !row) return json({ error: rowErr?.message ?? "Not found" }, 404);

  // Return cache if present, not forced, AND already has the latest fields
  const cached = row.parsed_data as Partial<Parsed> | null;
  const cacheIsFresh =
    cached &&
    Object.prototype.hasOwnProperty.call(cached, "title") &&
    Object.prototype.hasOwnProperty.call(cached, "starting_price");
  if (!force && cacheIsFresh) {
    return json({ ok: true, cached: true, parsed: cached });
  }

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

  // Clip to keep token use sane
  const clipped = rawText.slice(0, 60000);

  // Call Lovable AI Gateway (OpenAI-compatible)
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
    await supabase.from("itineraries").update({ parse_error: `AI ${aiRes.status}` }).eq("id", itinerary_id);
    return json({ error: `AI error: ${aiRes.status}`, detail: t }, 502);
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

  await supabase
    .from("itineraries")
    .update({ parsed_data: parsed, parsed_at: new Date().toISOString(), parse_error: null })
    .eq("id", itinerary_id);

  return json({ ok: true, cached: false, parsed });
});