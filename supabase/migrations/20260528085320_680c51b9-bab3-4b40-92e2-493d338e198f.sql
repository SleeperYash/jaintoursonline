CREATE TABLE public.hidden_default_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (destination_slug, image_url)
);

GRANT SELECT ON public.hidden_default_images TO anon, authenticated;
GRANT ALL ON public.hidden_default_images TO service_role;

ALTER TABLE public.hidden_default_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hidden defaults are viewable by everyone"
ON public.hidden_default_images
FOR SELECT
USING (true);

CREATE INDEX idx_hidden_default_images_slug ON public.hidden_default_images(destination_slug);