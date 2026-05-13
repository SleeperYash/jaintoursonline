// Travel concierge AI chat. Collects traveller info, recommends a matching
// itinerary from the uploaded library, and generates a custom package.
import { createClient } from "npm:@supabase/supabase-js@2";

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

type Msg = { role: "user" | "assistant" | "system" | "tool"; content: string; tool_call_id?: string; tool_calls?: any };

const DESTINATIONS = [
  "Andaman","Tamil Nadu","Goa","Gujarat","Himachal Pradesh","Kashmir","Spiti","Leh-Ladakh",
  "Madhya Pradesh","North East","Kerala","Rajasthan","Uttarakhand","Char Dham","Delhi",
  "Europe","Switzerland","Italy","France","Turkey","Japan","Mauritius","Australia","Dubai",
  "Thailand","Singapore-Malaysia","Bali","Vietnam","Maldives","Bhutan","Sri Lanka",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!LOVABLE_API_KEY) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages.slice(-30) : [];
  const leadInfo = body?.leadInfo ?? {};
  const leadId: string | undefined = body?.leadId;

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Fetch uploaded itineraries so the AI knows what's available.
  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("destination_slug, title")
    .order("created_at", { ascending: false });

  const itinList = (itineraries ?? [])
    .map((i: any) => `- ${i.destination_slug}: ${i.title}`)
    .join("\n") || "(none uploaded yet)";

  const sys = `You are "Yatra", the warm, premium AI travel concierge for Jain Tours & Travels (Mumbai). You help Indian travellers plan trips.

DESTINATIONS WE OFFER:
${DESTINATIONS.join(", ")}

UPLOADED ITINERARY LIBRARY (match user requests to these when possible):
${itinList}

YOUR JOB:
1. Greet warmly. Ask ONE question at a time, conversationally — don't dump all questions at once.
2. Collect: destination, travel dates, number of travellers, budget per person, departure city, trip type (honeymoon / family / adventure / luxury / pilgrimage), special preferences (Jain food, vegetarian, accessibility, etc).
3. Once you have ENOUGH info (destination + dates + travellers + budget at minimum), call the "create_package" tool to generate a custom package. Match to an uploaded itinerary if one fits; otherwise blend similar ones into a custom proposal.
4. Keep replies short (1-3 sentences). Use Indian English. Mention vegetarian/Jain meal options when relevant.
5. After the tool returns, briefly tell the user the package is ready below and invite them to book.

Never invent destinations outside the list. Always be encouraging.`;

  const tools = [{
    type: "function",
    function: {
      name: "create_package",
      description: "Generate a final travel package once enough info is collected.",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          title: { type: "string", description: "e.g. '7-Night Bali Honeymoon Escape'" },
          tagline: { type: "string" },
          duration: { type: "string", description: "e.g. '6 Nights / 7 Days'" },
          travellers: { type: "string" },
          departureCity: { type: "string" },
          tripType: { type: "string" },
          estimatedPricePerPerson: { type: "string", description: "INR price range, e.g. '₹85,000 – ₹1,10,000 per person'" },
          totalEstimate: { type: "string", description: "INR total range" },
          overview: { type: "string", description: "2-3 sentence pitch." },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                activities: { type: "array", items: { type: "string" } },
              },
              required: ["day", "title", "description"],
            },
          },
          hotelSuggestions: { type: "array", items: { type: "string" } },
          inclusions: { type: "array", items: { type: "string" } },
          exclusions: { type: "array", items: { type: "string" } },
          matchedItinerary: { type: "string", description: "destination_slug of the uploaded itinerary used as base, or 'custom-blend'" },
        },
        required: ["destination", "title", "duration", "overview", "days", "inclusions", "exclusions", "estimatedPricePerPerson"],
      },
    },
  }];

  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, ...messages],
        tools,
      }),
    });

    if (aiRes.status === 429) return json({ error: "Too many requests. Please retry shortly." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `AI error: ${t.slice(0, 300)}` }, 500);
    }

    const data = await aiRes.json();
    const choice = data?.choices?.[0]?.message ?? {};
    let reply: string = choice?.content ?? "";
    let pkg: any = null;

    const toolCall = choice?.tool_calls?.[0];
    if (toolCall?.function?.name === "create_package") {
      try { pkg = JSON.parse(toolCall.function.arguments ?? "{}"); } catch { pkg = null; }
      if (!reply) {
        reply = "Here's a custom package crafted for you. Have a look below — and tap Book Now or chat with our expert on WhatsApp when you're ready! 🌟";
      }
    }

    // Persist lead (upsert)
    let nextLeadId = leadId;
    const leadRow: any = {
      name: leadInfo?.name ?? null,
      phone: leadInfo?.phone ?? null,
      email: leadInfo?.email ?? null,
      destination: leadInfo?.destination ?? pkg?.destination ?? null,
      travel_dates: leadInfo?.travelDates ?? null,
      travelers: leadInfo?.travellers ?? null,
      budget: leadInfo?.budget ?? null,
      departure_city: leadInfo?.departureCity ?? null,
      trip_type: leadInfo?.tripType ?? null,
      preferences: leadInfo?.preferences ?? null,
      conversation: [...messages, { role: "assistant", content: reply }],
      generated_package: pkg,
    };

    if (nextLeadId) {
      await supabase.from("chat_leads").update(leadRow).eq("id", nextLeadId);
    } else {
      const { data: ins } = await supabase.from("chat_leads").insert(leadRow).select("id").single();
      nextLeadId = ins?.id;
    }

    return json({ ok: true, reply, package: pkg, leadId: nextLeadId });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
