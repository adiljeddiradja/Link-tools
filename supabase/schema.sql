
-- Create links table
create table public.links (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- simplified for this demo, usually uuid references auth.users
  slug text not null unique,
  original_url text not null,
  title text,
  is_for_bio boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.links enable row level security;

-- Policy to allow anyone to read links (for redirect)
create policy "Anyone can read links"
  on public.links for select
  using (true);

-- Policy to allow insert (for demo purposes)
create policy "Anyone can insert links"
  on public.links for insert
  with check (true);

-- Policy to allow delete (for demo purposes)
create policy "Anyone can delete links"
  on public.links for delete
  using (true);
