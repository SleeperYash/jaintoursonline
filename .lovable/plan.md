# Architecture Refactor: AI Parsing Only on Upload

## Goal

Gemini runs **exactly once** — when an admin uploads (or replaces) a PDF. All extracted data is stored in **editable, normalized Supabase tables** that you can edit directly in the Supabase Table Editor. Visitor page views never call Gemini; they read pre-parsed rows.

## 1. Database changes (new migration)

Extend `itineraries` and add four child tables:

`**itineraries**` (add columns)

- `destination` text — display name (e.g. "Dubai")
- `slug` text — URL slug for the package (auto from title)
- `overview` text
- `visa_information` text
- `terms_conditions` text
- `ai_processed` boolean default false
- (keeps: id, title, destination_slug, duration, starting_price, file_path, parsed_at, parse_error, created_at, updated_at)
- Remove dependency on `parsed_data` JSONB (column kept for backward-compat but no longer read)

`**itinerary_days**` — id, itinerary_id (FK, cascade), day_number, title, description
`**itinerary_hotels**` — id, itinerary_id (FK, cascade), city, hotel_name, nights
`**itinerary_inclusions**` — id, itinerary_id (FK, cascade), inclusion_text, position
`**itinerary_exclusions**` — id, itinerary_id (FK, cascade), exclusion_text, position

All new tables: RLS enabled, public SELECT (so visitors can read), no public write. GRANTs to anon (SELECT) + authenticated + service_role.

Trigger to keep `itineraries.updated_at` fresh.

## 2. Edge function: `parse-itinerary` (rewritten)

- Triggered **only by admin** (`admin-itineraries` calls it after upload, with service-role token or admin password).
- Extracts PDF text → calls Gemini 2.5 Flash with a tool that returns the full structured payload (title, destination, duration, starting_price, overview, visa_information, terms_conditions, days[], hotels[], inclusions[], exclusions[]).
- Writes scalar fields to `itineraries`; deletes + reinserts rows in the four child tables.
- Sets `ai_processed = true`, `parsed_at = now()`.
- **Refuses non-admin callers entirely** (no anonymous force, no anonymous parsing).

## 3. Edge function: `admin-itineraries` (updated)

- `upload` action: after inserting itinerary row, immediately calls the new parser internally. Returns parsed payload.
- New `reparse` action: admin-triggered re-run (e.g. when PDF replaced).
- New `replace_pdf` action: swaps file, then re-parses.

## 4. Frontend changes

- `ItineraryDetailView.tsx`: **stop calling** `supabase.functions.invoke("parse-itinerary")`. Instead query `itineraries` + child tables directly by id.
- `ItineraryCard.tsx`: read `starting_price` from the row already passed in (already supported via `initialPrice`); remove the lazy parse-itinerary fallback.
- `ItineraryViewer.tsx`: remove the "lazy-parse unparsed itineraries" loop.
- `ManageDestinationDialog.tsx`: add a "Re-parse with AI" button per itinerary (admin-only).

## 5. What you can edit directly in Supabase after deploy


| Field                                  | Table                                                |
| -------------------------------------- | ---------------------------------------------------- |
| Price                                  | `itineraries.starting_price`                         |
| Duration, title, overview, visa, terms | `itineraries`                                        |
| Day-by-day                             | `itinerary_days` rows                                |
| Hotels                                 | `itinerary_hotels` rows                              |
| Inclusions / Exclusions                | `itinerary_inclusions` / `itinerary_exclusions` rows |


No PDF re-upload, no AI re-run needed for edits.

## Technical notes

- Existing itineraries already in DB will show whatever scalar fields are populated; their `parsed_data` JSONB stays as a fallback read path only until you click "Re-parse" once per itinerary (one-time backfill). I'll handle that gracefully in the detail view (prefer normalized rows, fall back to legacy `parsed_data` if no normalized rows exist yet).
- `parse-itinerary` will require the admin password header, so visitor browsers can never invoke it.

## Files changed

- New migration: `supabase/migrations/<ts>_itinerary_normalized.sql`
- `supabase/functions/parse-itinerary/index.ts` — rewrite (admin-gated, writes normalized rows)
- `supabase/functions/admin-itineraries/index.ts` — wire `upload` → parser; add `reparse`
- `src/components/site/ItineraryDetailView.tsx` — read from DB, no AI call
- `src/components/site/ItineraryCard.tsx` — drop lazy parse fallback
- `src/components/site/ItineraryViewer.tsx` — drop lazy parse loop
- `src/components/site/ManageDestinationDialog.tsx` — add Re-parse button