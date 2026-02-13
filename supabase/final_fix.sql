-- 1. Ensure columns exist
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Drop existing update policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

-- 3. Create full-access update policies (for demo purposes)
CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

-- 4. Verify: Try to manually set a link to inactive in Table Editor after running this.
