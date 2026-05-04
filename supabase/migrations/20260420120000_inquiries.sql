-- Inquiries table for travel inquiry form submissions
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  destination text,
  travel_dates text,
  travelers text,
  budget text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- Anyone (including anonymous visitors) can submit an inquiry
create policy "Anyone can submit an inquiry"
on public.inquiries
for insert
to anon, authenticated
with check (true);

-- No public read access: inquiries are private business data.
-- Reads will be added later via a secure admin role.
