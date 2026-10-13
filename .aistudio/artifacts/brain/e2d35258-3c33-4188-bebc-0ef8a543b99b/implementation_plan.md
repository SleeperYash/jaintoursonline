# Document Brochure Itinerary Page Redesign

Transform the itinerary breakdown page (`/destinations/:slug/:itinerarySlug`) into a refined editorial document brochure layout inspired directly by the provided sample, seamlessly integrating the company logo, admin-configured package title, duration, and pricing, with AI-extracted overview and highlights, day-by-day photo galleries, and print/download capabilities.

## User Review & Critical Decisions

> [!IMPORTANT]
> The workflow remains 100% intact: Admin uploads PDF -> Supabase edge function parses content -> structured breakdown renders instantly on the website.

- **Confirmed Decision 1 (Layout Style)**: Document brochure layout matching the HTML sample directly, featuring a warm editorial paper canvas (`#faf8f5` in light mode with luxury dark mode counterpart), clean borders, and clear hierarchy.
- **Confirmed Decision 2 (AI Highlights & Overview)**: Parse function auto-extracts 4–6 prominent bullet highlights alongside the overview paragraph during AI PDF parsing, with graceful runtime fallback if highlights were not previously parsed.
- **Confirmed Decision 3 (Download & Print Actions)**: Dual-action support with both direct original PDF download and an optimized `@media print` A4 brochure view matching the sample layout.
- **Confirmed Decision 4 (Branding & Header)**: Replace the plain text agency name with the official high-resolution Jain Tours & Travels logo emblem, followed by the uppercase package title, duration, and starting price.

---

## 1. Overview & Core Concept

- **What It Does**: Renders each destination's tour package as a luxury travel brochure. Travelers can read a welcoming overview, scan key highlights, explore the day-by-day journey with paired photo grids, review hotel details, inclusions, exclusions, and travel policies, and either download the source PDF or print/save the brochure.
- **Target Audience / Persona**: Travelers seeking clear, comprehensive, and trustworthy package details, with quick access to quote inquiries and WhatsApp consultations.
- **Key Value**: Delivers a polished, tactile brochure aesthetic on desktop and mobile while preserving existing admin PDF parsing and lead capture workflows.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        [Jain Tours Logo Image]                         │
│                           ENCHANTING BALI                              │
│         8 DAYS / 7 NIGHTS  │  Starting Price: ₹49,999 per person       │
├────────────────────────────────────────────────────────────────────────┤
│ [Enquire Now]   [Download Original PDF]   [Print Brochure]  [WhatsApp] │
├────────────────────────────────────────────────────────────────────────┤
│ Overview / Welcome                                                     │
│ Welcome to the Island of the Gods! This meticulously crafted...        │
│                                                                        │
│ Highlights                                                             │
│ • Kecak Fire Dance at Uluwatu Temple                                   │
│ • West Nusa Penida Coastal Excursion                                   │
│ • White water rafting on the Ayung River                               │
│ • Tegalalang Rice Terraces and Ubud culture                            │
├────────────────────────────────────────────────────────────────────────┤
│ ── DAY-BY-DAY ITINERARY ────────────────────────────────────────────── │
│                                                                        │
│ Day 01: Arrival in Bali & Check-in                                     │
│ Welcome to Bali! Upon arrival at Ngurah Rai International Airport...   │
│ ┌──────────────────────────────┬──────────────────────────────┐        │
│ │   [Day Photo 1 - e.g. DPS]   │  [Day Photo 2 - Resort Pool] │        │
│ └──────────────────────────────┴──────────────────────────────┘        │
│                                                                        │
│ Day 02: Tanjung Benoa Water Sports & Uluwatu Sunset Tour               │
│ ...                                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ ── TRIP DETAILS ────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Hotel Details                                                      │ │
│ │ • Kuta / Seminyak (4 Nights): Hotel Grand Mercure or similar       │ │
│ │ • Ubud (3 Nights): Ubud Village Resort or similar                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Inclusions                                                         │ │
│ │ ✓ Accommodation, Breakfast, Private Transfers, Sightseeing...      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Exclusions                                                         │ │
│ │ ✗ Flights, Personal Expenses, Visa fees, Travel Insurance...       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Important Notes & Terms                                            │ │
│ │ • Check-in: 2:00 PM / Check-out: 11:00 AM                          │ │
│ │ • Itinerary sequence subject to local traffic and weather...       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme Tokens
- **Brochure Sheet Canvas**: Warm off-white/parchment background (`#FAF8F5` in light mode, `#111625` in dark mode) framed with a subtle border and soft drop shadow.
- **Header Lockup**: Centered company logo (`/src/assets/jain-tours-logo.png`), high-contrast title typography in Cormorant Garamond / bold serif, and a sage/emerald accent dividing line (`#8BA888` / brand imperial blue token).
- **Section Headers**: Distinctive dark bar headers (`bg-[#1C2833]` / `dark:bg-slate-800` with white text) and styled subheaders with left vertical accent bars matching the sample.
- **Day Photos**: 2-column balanced image grid (`aspect-[4/3]` or `h-64` per cell) with smooth hover zoom, rounded corners, subtle borders, and graceful fallbacks if no day image was extracted from the PDF.
- **Action Bar**: Clean utility bar featuring primary CTA ("Enquire Now"), secondary actions ("Download Original PDF", "Print / Save as PDF"), and direct WhatsApp chat link.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Edge Function Highlights Extraction vs. Client-Side Fallback**
  - *Chosen Approach*: Update `supabase/functions/parse-itinerary/index.ts` to include `"highlights": string[]` in the LLM tool definition and database schema. Additionally, in the frontend `ItineraryDetailView.tsx`, provide an intelligent fallback that derives 4–5 highlights from day titles and activities if a previously parsed itinerary lacks the new `highlights` field.
  - *Why*: Existing itineraries continue to look complete and beautiful immediately without requiring manual re-upload, while new uploads automatically receive high-precision AI highlights.
- **Decision 2: Print-Optimized Layout (@media print)**
  - *Chosen Approach*: Implement a dedicated `@media print` stylesheet that removes navigation headers, floating buttons, and breadcrumbs, and renders the exact A4 layout with page margins (`15mm`), preventing awkward breaks between day headers and images.
  - *Why*: Allows travelers and travel agents to print or "Save as PDF" directly from their browser with zero extra server-side PDF generation overhead.
- **Decision 3: Image Preservation Rule Compliance**
  - *Chosen Approach*: Obey user rule `<RULE[AGENTS_md]>` to store and reference extracted PDF photos by itinerary and day number. When a day has extracted photos, display them in the 2-column table grid; when only 1 photo exists, pair it with the destination showcase photo or show a full-width panoramic card.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────┐
│               ItineraryDetailPage.tsx                  │
│   (Route handler: /destinations/:slug/:itinerarySlug)  │
└───────────────────────────┬────────────────────────────┘
                            │ fetches itinerary data & lead state
┌───────────────────────────▼────────────────────────────┐
│               ItineraryDetailView.tsx                  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ BrochureHeader                                   │  │
│  │ (Company logo, Title, Duration, Price, Actions)  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ BrochureOverviewAndHighlights                    │  │
│  │ (Welcome paragraph, 4-6 bullet highlights)       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ BrochureDayByDayList                             │  │
│  │ (Day title, description, 2-column photo grid)    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ BrochureTripDetails                              │  │
│  │ (Hotels, Inclusions, Exclusions, Notes & Terms)  │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      InquiryForm Modal & Floating Enquiry Handlers     │
│   (Uses existing enquiry-to-sheet sync path)           │
└────────────────────────────────────────────────────────┘
```

### Steps to Implement:
1. **Edge Function Update (`supabase/functions/parse-itinerary/index.ts`)**:
   - Add `highlights: { type: "array", items: { type: "string" } }` to the tool schema.
   - Instruct the prompt to produce 4–6 punchy trip highlights (monuments, activities, unique experiences).
   - Save `highlights` in the itinerary JSON/record.
2. **Component Redesign (`src/components/site/ItineraryDetailView.tsx`)**:
   - Replace the generic accordion view with the editorial brochure document layout matching the sample.
   - Header with company logo (`/src/assets/jain-tours-logo.png`), bold uppercase title, duration, and price.
   - Overview & AI highlights section with clean typographic bullets.
   - Day-by-day sections with left accent bars, narrative paragraphs, and 2-column photo tables.
   - Trip details boxes for Hotel Details, Inclusions, Exclusions, and Important Notes/Terms.
   - Action bar for "Enquire Now", "Download Original PDF", "Print Brochure", and "WhatsApp".
   - Print stylesheet rules (`@media print`) matching the sample A4 styles.
3. **Verification**:
   - Verify TypeScript compilation (`compile_applet`) and linting (`lint_applet`).
   - Validate desktop and mobile responsiveness and print preview.
