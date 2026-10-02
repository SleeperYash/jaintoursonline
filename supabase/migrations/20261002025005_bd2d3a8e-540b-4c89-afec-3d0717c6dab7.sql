CREATE TABLE public.itinerary_day_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0),
  position integer NOT NULL DEFAULT 0,
  file_path text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (itinerary_id, day_number, position)
);
GRANT SELECT ON public.itinerary_day_images TO anon, authenticated;
GRANT ALL ON public.itinerary_day_images TO service_role;
ALTER TABLE public.itinerary_day_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary day images are viewable by everyone"
  ON public.itinerary_day_images FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_itinerary_day_images_itin ON public.itinerary_day_images(itinerary_id, day_number, position);
CREATE TRIGGER trg_itinerary_day_images_updated
  BEFORE UPDATE ON public.itinerary_day_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();