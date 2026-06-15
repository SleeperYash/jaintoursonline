ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_name_len             CHECK (char_length(name)  <= 200),
  ADD CONSTRAINT enquiries_phone_len            CHECK (char_length(phone) <= 30),
  ADD CONSTRAINT enquiries_email_len            CHECK (char_length(email) <= 300),
  ADD CONSTRAINT enquiries_email_fmt            CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  ADD CONSTRAINT enquiries_destination_slug_len CHECK (char_length(destination_slug) <= 200),
  ADD CONSTRAINT enquiries_destination_name_len CHECK (destination_name IS NULL OR char_length(destination_name) <= 200),
  ADD CONSTRAINT enquiries_itinerary_title_len  CHECK (itinerary_title  IS NULL OR char_length(itinerary_title)  <= 300),
  ADD CONSTRAINT enquiries_travel_dates_len     CHECK (travel_dates     IS NULL OR char_length(travel_dates)     <= 200),
  ADD CONSTRAINT enquiries_travellers_len       CHECK (travellers       IS NULL OR char_length(travellers)       <= 100),
  ADD CONSTRAINT enquiries_budget_len           CHECK (budget_per_person IS NULL OR char_length(budget_per_person) <= 100);