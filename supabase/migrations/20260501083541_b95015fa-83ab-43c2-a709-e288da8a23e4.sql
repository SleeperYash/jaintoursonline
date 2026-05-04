
-- Destination images: per-destination uploaded images with ordering and one cover
CREATE TABLE public.destination_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_destination_images_slug ON public.destination_images (destination_slug, position);
-- Only one cover per destination
CREATE UNIQUE INDEX uniq_destination_cover
  ON public.destination_images (destination_slug)
  WHERE is_cover = true;

ALTER TABLE public.destination_images ENABLE ROW LEVEL SECURITY;

-- Public can read (used to render hero/gallery on destination pages)
CREATE POLICY "Destination images are viewable by everyone"
  ON public.destination_images
  FOR SELECT
  USING (true);

-- Writes go through the admin edge function (service role bypasses RLS).
-- No INSERT/UPDATE/DELETE policies for anon/authenticated.

CREATE TRIGGER update_destination_images_updated_at
  BEFORE UPDATE ON public.destination_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
