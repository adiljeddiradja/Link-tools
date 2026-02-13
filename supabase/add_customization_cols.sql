-- 1. Add customization columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans-serif';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_bg TEXT; -- Could be hex or gradient string

-- 2. Add is_hidden column to links
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 3. Update existing links to have is_hidden = false if null
UPDATE public.links SET is_hidden = false WHERE is_hidden IS NULL;

-- 4. Ensure RLS update policy allows changing these new columns
-- (Already handled by "Anyone can update links/profiles" policies if they exist, but good to be sure)
DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);
