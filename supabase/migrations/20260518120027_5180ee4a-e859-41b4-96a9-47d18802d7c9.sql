
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  price_label TEXT NOT NULL DEFAULT 'PER PERSON · EXCL. AIRFARE',
  inc_hotel BOOLEAN NOT NULL DEFAULT true,
  inc_breakfast BOOLEAN NOT NULL DEFAULT true,
  inc_sightseeing BOOLEAN NOT NULL DEFAULT true,
  inc_transport BOOLEAN NOT NULL DEFAULT true,
  image_path TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view deals"
  ON public.deals FOR SELECT
  USING (true);

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stamp_photos (
  stamp_key TEXT NOT NULL PRIMARY KEY,
  image_path TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stamp_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stamp photos"
  ON public.stamp_photos FOR SELECT
  USING (true);

CREATE TRIGGER stamp_photos_updated_at
  BEFORE UPDATE ON public.stamp_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.stamp_photos (stamp_key) VALUES
  ('malaysia'),
  ('singapore'),
  ('thailand'),
  ('sri-lanka'),
  ('kashmir'),
  ('himalayas'),
  ('andaman'),
  ('north-east-india');
