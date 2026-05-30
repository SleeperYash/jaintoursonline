
-- 1. Extend itineraries with editable scalar fields
ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS destination text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS visa_information text,
  ADD COLUMN IF NOT EXISTS terms_conditions text,
  ADD COLUMN IF NOT EXISTS ai_processed boolean NOT NULL DEFAULT false;

-- Mark already-parsed rows as ai_processed so the admin UI can show their status
UPDATE public.itineraries SET ai_processed = true WHERE parsed_data IS NOT NULL;

-- 2. itinerary_days
CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itin ON public.itinerary_days(itinerary_id, day_number);
GRANT SELECT ON public.itinerary_days TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itinerary_days TO authenticated;
GRANT ALL ON public.itinerary_days TO service_role;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary days are viewable by everyone"
  ON public.itinerary_days FOR SELECT USING (true);

-- 3. itinerary_hotels
CREATE TABLE IF NOT EXISTS public.itinerary_hotels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  city text NOT NULL DEFAULT '',
  hotel_name text NOT NULL DEFAULT '',
  nights int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itinerary_hotels_itin ON public.itinerary_hotels(itinerary_id, position);
GRANT SELECT ON public.itinerary_hotels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itinerary_hotels TO authenticated;
GRANT ALL ON public.itinerary_hotels TO service_role;
ALTER TABLE public.itinerary_hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary hotels are viewable by everyone"
  ON public.itinerary_hotels FOR SELECT USING (true);

-- 4. itinerary_inclusions
CREATE TABLE IF NOT EXISTS public.itinerary_inclusions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  inclusion_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itinerary_inclusions_itin ON public.itinerary_inclusions(itinerary_id, position);
GRANT SELECT ON public.itinerary_inclusions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itinerary_inclusions TO authenticated;
GRANT ALL ON public.itinerary_inclusions TO service_role;
ALTER TABLE public.itinerary_inclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary inclusions are viewable by everyone"
  ON public.itinerary_inclusions FOR SELECT USING (true);

-- 5. itinerary_exclusions
CREATE TABLE IF NOT EXISTS public.itinerary_exclusions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  exclusion_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itinerary_exclusions_itin ON public.itinerary_exclusions(itinerary_id, position);
GRANT SELECT ON public.itinerary_exclusions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itinerary_exclusions TO authenticated;
GRANT ALL ON public.itinerary_exclusions TO service_role;
ALTER TABLE public.itinerary_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary exclusions are viewable by everyone"
  ON public.itinerary_exclusions FOR SELECT USING (true);

-- 6. updated_at triggers
CREATE TRIGGER trg_itinerary_days_updated
  BEFORE UPDATE ON public.itinerary_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_itinerary_hotels_updated
  BEFORE UPDATE ON public.itinerary_hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
