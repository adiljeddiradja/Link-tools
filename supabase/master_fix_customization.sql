-- 1. Ensure all columns exist in 'profiles'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans-serif';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_bg TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Ensure all columns exist in 'links'
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 3. Reset RLS Policies to be broad (for debugging)
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);

-- 4. FORCED SCHEMA RELOAD
-- Run this to tell Supabase to refresh its API definition
NOTIFY pgrst, 'reload schema';
