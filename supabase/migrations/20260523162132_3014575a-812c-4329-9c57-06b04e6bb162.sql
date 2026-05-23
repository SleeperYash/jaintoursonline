
-- 1. chat_leads: allow anyone to submit a lead
CREATE POLICY "Anyone can submit chat leads"
ON public.chat_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. enquiries: allow admins to read
CREATE POLICY "Admins can view enquiries"
ON public.enquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enquiries"
ON public.enquiries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lock down has_role execution. RLS policies invoke it via the table owner,
-- so revoking from anon/authenticated does not break RLS checks.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 4. Restrict listing of itineraries bucket to admins; individual public URLs still work.
DROP POLICY IF EXISTS "Itineraries are publicly listable" ON storage.objects;
CREATE POLICY "Admins can list itineraries bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'itineraries' AND public.has_role(auth.uid(), 'admin'));
