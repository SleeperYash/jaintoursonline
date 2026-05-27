-- Create table to track hidden default/AI images per destination
CREATE TABLE public.hidden_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (destination_slug, image_url)
);

-- Grant access: public can view (since SELECT policies on itineraries are public),
-- but only admins should modify. We'll leave authenticated for admin actions via edge function.
GRANT SELECT ON public.hidden_defaults TO anon;
GRANT SELECT ON public.hidden_defaults TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.hidden_defaults TO service_role;

-- Enable RLS
ALTER TABLE public.hidden_defaults ENABLE ROW LEVEL SECURITY;

-- Everyone can view which defaults are hidden (needed for public destination pages)
CREATE POLICY "Hidden defaults are viewable by everyone"
ON public.hidden_defaults
FOR SELECT
TO public
USING (true);