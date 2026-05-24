ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS parsed_data jsonb,
  ADD COLUMN IF NOT EXISTS parsed_at timestamptz,
  ADD COLUMN IF NOT EXISTS parse_error text;