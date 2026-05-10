-- Create enquiries table
CREATE TABLE public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  destination_slug TEXT NOT NULL,
  destination_name TEXT,
  itinerary_id UUID,
  itinerary_title TEXT,
  travel_dates TEXT,
  travellers TEXT,
  budget_per_person TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an enquiry (lead capture from public site)
CREATE POLICY "Anyone can submit enquiry"
ON public.enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Nobody can read enquiries from the client (admin views via Cloud dashboard)
-- No SELECT policy = no public reads

-- Update itineraries policies: allow public inserts/deletes through edge function only
-- Drop old admin-only policies since we're removing auth
DROP POLICY IF EXISTS "Admins can insert itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Admins can update itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Admins can delete itineraries" ON public.itineraries;

-- Itineraries remain publicly viewable (existing policy stays)
-- New writes happen through edge function with service role + password check
