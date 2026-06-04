import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GS_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const SPREADSHEET_ID = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");
    const SHEET_NAME = Deno.env.get("GOOGLE_SHEETS_SHEET_NAME") || "Enquiries";

    if (!LOVABLE_API_KEY || !GS_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Google Sheets connector not linked" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!SPREADSHEET_ID) {
      return new Response(JSON.stringify({ ok: false, error: "GOOGLE_SHEETS_SPREADSHEET_ID not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();
    const row = [
      now,
      body.name ?? "",
      body.phone ?? "",
      body.email ?? "",
      body.destination_name ?? body.destination_slug ?? "",
      body.travel_dates ?? "",
      body.travellers ?? "",
      body.budget_per_person ?? "",
      body.message ?? "",
    ];

    const range = `${SHEET_NAME}!A:I`;
    const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Sheets append failed", res.status, text);
      return new Response(JSON.stringify({ ok: false, status: res.status, error: text }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enquiry-to-sheet error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});