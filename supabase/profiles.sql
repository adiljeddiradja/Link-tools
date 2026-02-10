
-- Create profiles table
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  handle text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  bg_color text default '#0f172a', -- Default slate-900
  bg_image text, -- URL for background image
  button_style text default 'rounded-xl', -- rounded-xl, rounded-full, sharp
  theme_color text default 'blue', -- blue, purple, pink, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add profile_id to links table
alter table public.links add column profile_id uuid references public.profiles(id);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Anyone can read profiles" on public.profiles for select using (true);
create policy "Anyone can insert profiles" on public.profiles for insert with check (true);
create policy "Anyone can update own profiles" on public.profiles for update using (true);
create policy "Anyone can delete own profiles" on public.profiles for delete using (true);
