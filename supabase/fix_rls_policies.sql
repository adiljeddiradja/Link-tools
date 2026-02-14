-- ============================================================================
-- Security Fix: Row Level Security Policies
-- ============================================================================
-- Purpose: Replace overly permissive policies with secure, user-scoped policies
-- Impact: Public can still READ active data, but only owners can modify their data
-- Backward Compatible: YES - existing app flow unchanged
-- ============================================================================

-- ============================================================================
-- 1. FIX LINKS TABLE POLICIES
-- ============================================================================

-- Drop unsafe policies
DROP POLICY IF EXISTS "Anyone can insert links" ON public.links;
DROP POLICY IF EXISTS "Anyone can delete links" ON public.links;
DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
DROP POLICY IF EXISTS "Anyone can read links" ON public.links;

-- ✅ SECURE: Public can read ACTIVE links (for redirects and bio pages)
CREATE POLICY "Public can read active links"
  ON public.links FOR SELECT
  USING (is_active = true);

-- ✅ SECURE: Authenticated users can insert their own links
CREATE POLICY "Authenticated users can insert their own links"
  ON public.links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- ✅ SECURE: Users can update their own links
CREATE POLICY "Users can update their own links"
  ON public.links FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ✅ SECURE: Users can delete their own links
CREATE POLICY "Users can delete their own links"
  ON public.links FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- 2. FIX PROFILES TABLE POLICIES
-- ============================================================================

-- Drop unsafe policies
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can delete own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- ✅ SECURE: Public can read ACTIVE profiles (for bio pages)
CREATE POLICY "Public can read active profiles"
  ON public.profiles FOR SELECT
  USING (is_active = true);

-- ✅ SECURE: Authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- ✅ SECURE: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ✅ SECURE: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- 3. FIX CLICKS TABLE POLICIES (ANALYTICS)
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Users can view clicks for their own links" ON public.clicks;

-- ✅ SECURE: Public can insert clicks (for analytics tracking)
-- Note: This is intentional - we need to track clicks from public redirects
CREATE POLICY "Public can insert clicks for analytics"
  ON public.clicks FOR INSERT
  WITH CHECK (true);

-- ✅ SECURE: Users can only view analytics for their own links
CREATE POLICY "Users can view their own link analytics"
  ON public.clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE public.links.id = public.clicks.link_id
      AND public.links.user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to test)
-- ============================================================================

-- Test 1: Check all policies are created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('links', 'profiles', 'clicks')
-- ORDER BY tablename, policyname;

-- Test 2: Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('links', 'profiles', 'clicks');

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Public reads are preserved for:
--    - Active links (for redirects to work)
--    - Active profiles (for bio pages to work)
--    - Click analytics insertion (for tracking to work)
--
-- 2. All modifications (INSERT/UPDATE/DELETE) require authentication
--    and user ownership verification (auth.uid() = user_id)
--
-- 3. Backward compatibility: Existing app functionality unchanged
--    - Bio pages still publicly accessible
--    - Link redirects still work
--    - Analytics still tracks clicks
--    - Users can manage their own data
-- ============================================================================
