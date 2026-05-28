INSERT INTO storage.buckets (id, name, public) VALUES ('itineraries', 'itineraries', true) ON CONFLICT (id) DO NOTHING;

-- Policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'itineraries');
