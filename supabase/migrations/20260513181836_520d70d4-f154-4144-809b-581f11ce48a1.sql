CREATE TABLE public.chat_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  destination TEXT,
  travel_dates TEXT,
  travelers TEXT,
  budget TEXT,
  departure_city TEXT,
  trip_type TEXT,
  preferences TEXT,
  conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_package JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit chat lead"
  ON public.chat_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own chat lead by id"
  ON public.chat_leads FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view chat leads"
  ON public.chat_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete chat leads"
  ON public.chat_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER chat_leads_updated_at
  BEFORE UPDATE ON public.chat_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();