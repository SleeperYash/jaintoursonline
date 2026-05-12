// Public edge function: generates a day-by-day itinerary + best months
// for a destination, tailored to Indian travellers, using Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { name, country, duration, highlights } = body ?? {};
  if (!name) return json({ error: "Missing name" }, 400);

  // Pick a sensible day count from "5 – 7 Nights" → middle of the range.
  let dayCount = 5;
  const m = String(duration ?? "").match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) dayCount = Math.round((parseInt(m[1]) + parseInt(m[2])) / 2) + 1;
  else {
    const single = String(duration ?? "").match(/(\d+)/);
    if (single) dayCount = parseInt(single[1]) + 1;
  }
  dayCount = Math.max(3, Math.min(12, dayCount));

  const sys = `You are an expert travel curator for Indian families and honeymooners.
Reply with ONLY valid JSON, no prose, no markdown fences.`;

  const user = `Create a day-by-day itinerary for "${name}" (${country ?? ""}), ${dayCount} days total.
Highlights to weave in: ${(highlights ?? []).join(", ")}.

Tone: warm, premium, written for Indian travellers (mention vegetarian/Jain food options, temples, family-friendly sightseeing, local shopping bazaars, practical tips like SIM, currency, weather).

Return JSON in this exact shape:
{
  "stops": ["City A","City B","City C"],
  "bestMonths": [10,11,12,1,2,3],
  "days": [
    {
      "day": 1,
      "location": "Arrival city",
      "description": "One short sentence. Crisp, Indian-traveller voice.",
      "activities": ["chip 1","chip 2","chip 3"]
    }
  ]
}

Rules:
- Exactly ${dayCount} day objects, day numbers 1..${dayCount}.
- "stops" = ordered route cities (3 to 6).
- "bestMonths" = month numbers (1=Jan..12=Dec) recommended to visit.
- "activities" = exactly 3 short chips per day (max 3 words each).
- description must be ONE sentence, max 110 characters.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) return json({ error: "Rate limit, please retry shortly" }, 429);
    if (res.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!res.ok) {
      const t = await res.text();
      return json({ error: `AI error: ${t.slice(0, 200)}` }, 500);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    // sanitize
    const stops = Array.isArray(parsed.stops) ? parsed.stops.slice(0, 6).map(String) : [];
    const bestMonths = Array.isArray(parsed.bestMonths)
      ? parsed.bestMonths.map((n: any) => Number(n)).filter((n: number) => n >= 1 && n <= 12)
      : [];
    const days = Array.isArray(parsed.days)
      ? parsed.days.slice(0, dayCount).map((d: any, i: number) => ({
          day: Number(d?.day) || i + 1,
          location: String(d?.location ?? "").slice(0, 60),
          description: String(d?.description ?? "").slice(0, 130),
          activities: Array.isArray(d?.activities)
            ? d.activities.slice(0, 3).map((a: any) => String(a).slice(0, 24))
            : [],
        }))
      : [];

    return json({ ok: true, stops, bestMonths, days });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
