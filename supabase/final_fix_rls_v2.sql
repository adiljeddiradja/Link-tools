-- ============================================================================
-- FINAL FIX RLS POLICIES (V2)
-- ============================================================================
-- This script performs a FULL RESET of policies for links and profiles tables.
-- It fixes:
-- 1. "New row violates RLS" error on update (removes WITH CHECK)
-- 2. "Missing data" issue (adds policy for owners to view their own inactive data)
-- ============================================================================

-- ============================================================================
-- 1. RESET PROFILES POLICIES
-- ============================================================================

-- Enable RLS just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- DROP ALL existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can delete own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- CREATE NEW POLICIES

-- SELECT: Public can see ALL (to allow app-level "Inactive" handling), Owners can see EVERYTHING matches their ID
CREATE POLICY "Public can view all profiles"
ON public.profiles FOR SELECT
USING ( true );

CREATE POLICY "Owners can view own profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- INSERT: Authenticated users can create profile for themselves
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- UPDATE: Owners can update their own profile
-- NOTE: No WITH CHECK to allow changing status freely
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- DELETE: Owners can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );


-- ============================================================================
-- 2. RESET LINKS POLICIES
-- ============================================================================

-- Enable RLS just in case
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- DROP ALL existing policies
DROP POLICY IF EXISTS "Anyone can insert links" ON public.links;
DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
DROP POLICY IF EXISTS "Anyone can delete links" ON public.links;
DROP POLICY IF EXISTS "Anyone can read links" ON public.links;
DROP POLICY IF EXISTS "Public can read active links" ON public.links;
DROP POLICY IF EXISTS "Authenticated users can insert their own links" ON public.links;
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;

-- CREATE NEW POLICIES

-- SELECT: Public can see ALL, Owners can see EVERYTHING
CREATE POLICY "Public can view all links"
ON public.links FOR SELECT
USING ( true );

CREATE POLICY "Owners can view own links"
ON public.links FOR SELECT
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- INSERT: Authenticated users can create links for themselves
CREATE POLICY "Users can insert own links"
ON public.links FOR INSERT
TO authenticated
WITH CHECK ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- UPDATE: Owners can update their own links
CREATE POLICY "Users can update own links"
ON public.links FOR UPDATE
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );

-- DELETE: Owners can delete their own links
CREATE POLICY "Users can delete own links"
ON public.links FOR DELETE
TO authenticated
USING ( auth.uid()::text = user_id OR auth.uid()::uuid::text = user_id );


-- ============================================================================
-- 3. RESET CLICKS POLICIES
-- ============================================================================

ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Users can view clicks for their own links" ON public.clicks;
DROP POLICY IF EXISTS "Public can insert clicks for analytics" ON public.clicks;
DROP POLICY IF EXISTS "Users can view their own link analytics" ON public.clicks;

-- INSERT: Public can insert (for tracking)
CREATE POLICY "Public can record clicks"
ON public.clicks FOR INSERT
WITH CHECK (true);

-- SELECT: Users can view clicks for their own links
CREATE POLICY "Users can view own link analytics"
ON public.clicks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.links
    WHERE public.links.id = public.clicks.link_id
    AND (public.links.user_id = auth.uid()::text OR public.links.user_id = auth.uid()::uuid::text)
  )
);
