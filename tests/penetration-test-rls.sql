-- ============================================================================
-- PENETRATION TESTING: RLS Policy Security Tests
-- ============================================================================
-- Run these tests in Supabase SQL Editor to verify RLS policies are working
-- Expected: Most of these should FAIL (which means security is working!)
-- ============================================================================

-- ============================================================================
-- TEST 1: Attempt unauthorized INSERT on links table
-- ============================================================================
-- This should FAIL with: "new row violates row-level security policy"
-- (Good - means unauthenticated users cannot insert)

INSERT INTO public.links (user_id, slug, original_url, is_active)
VALUES ('attacker-id', 'hacked-link', 'https://malicious.com', true);

-- Expected: ERROR: new row violates row-level security policy for table "links"

-- ============================================================================
-- TEST 2: Attempt to read inactive links (should work for owners only)
-- ============================================================================
-- This should return NO ROWS for unauthenticated users
SELECT * FROM public.links WHERE is_active = false;

-- Expected: Empty result (only owners can see their inactive links)

-- ============================================================================
-- TEST 3: Attempt to UPDATE another user's link
-- ============================================================================
-- First, get a link ID from the database
-- SELECT id, user_id FROM public.links LIMIT 1;

-- Then try to update it (replace with actual ID and different user_id)
/*
UPDATE public.links 
SET original_url = 'https://hacked.com'
WHERE id = 'some-link-id' 
  AND user_id != auth.uid()::text;
*/

-- Expected: 0 rows updated (cannot update other users' links)

-- ============================================================================
-- TEST 4: Attempt to DELETE another user's link
-- ============================================================================
/*
DELETE FROM public.links 
WHERE id = 'some-link-id' 
  AND user_id != auth.uid()::text;
*/

-- Expected: 0 rows deleted (cannot delete other users' links)

-- ============================================================================
-- TEST 5: Attempt unauthorized INSERT on profiles table
-- ============================================================================
INSERT INTO public.profiles (user_id, handle, display_name)
VALUES ('attacker-id', 'hacker', 'Hacker Name');

-- Expected: ERROR: new row violates row-level security policy for table "profiles"

-- ============================================================================
-- TEST 6: Verify public can READ active profiles (for bio pages)
-- ============================================================================
-- This should SUCCEED (public access needed for bio pages)
SELECT handle, display_name, bio 
FROM public.profiles 
WHERE is_active = true 
LIMIT 5;

-- Expected: SUCCESS with results

-- ============================================================================
-- TEST 7: Verify public can READ active links (for redirects)
-- ============================================================================
-- This should SUCCEED (public access needed for link redirects)
SELECT slug, original_url 
FROM public.links 
WHERE is_active = true 
LIMIT 5;

-- Expected: SUCCESS with results

-- ============================================================================
-- TEST 8: Attempt to read rate_limits table directly
-- ============================================================================
-- This should FAIL (no public access to rate limits)
SELECT * FROM public.rate_limits LIMIT 5;

-- Expected: ERROR: permission denied or empty result

-- ============================================================================
-- TEST 9: Attempt SQL Injection via slug
-- ============================================================================
-- This should be blocked by input validation
/*
INSERT INTO public.links (user_id, slug, original_url)
VALUES (auth.uid()::text, '''; DROP TABLE links; --', 'https://example.com');
*/

-- Expected: ERROR: check constraint violation (slug format)

-- ============================================================================
-- TEST 10: Verify constraints prevent invalid data
-- ============================================================================
-- Test 10a: Invalid slug format
/*
INSERT INTO public.links (user_id, slug, original_url)
VALUES (auth.uid()::text, 'invalid slug!@#', 'https://example.com');
*/
-- Expected: ERROR: check constraint "links_slug_format" violated

-- Test 10b: URL too long (>2048 chars)
/*
INSERT INTO public.links (user_id, slug, original_url)
VALUES (auth.uid()::text, 'test-slug', REPEAT('x', 2049));
*/
-- Expected: ERROR: check constraint "links_url_length" violated

-- Test 10c: Invalid handle format
/*
INSERT INTO public.profiles (user_id, handle)
VALUES (auth.uid()::text, 'invalid handle!');
*/
-- Expected: ERROR: check constraint "profiles_handle_format" violated

-- ============================================================================
-- VERIFICATION: Check that policies are in place
-- ============================================================================
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('links', 'profiles', 'clicks')
ORDER BY tablename, policyname;

-- Expected: Should see all secure policies with auth.uid() checks

-- ============================================================================
-- VERIFICATION: Check that constraints are in place
-- ============================================================================
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  convalidated AS is_validated,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid IN ('public.links'::regclass, 'public.profiles'::regclass, 'public.clicks'::regclass)
  AND contype = 'c'
ORDER BY table_name, constraint_name;

-- Expected: Should see all constraints, with NOT VALID flag (convalidated = false)

-- ============================================================================
-- RESULTS SUMMARY
-- ============================================================================
-- ✅ PASS: If unauthorized access attempts FAIL
-- ✅ PASS: If public read access to active data SUCCEEDS
-- ✅ PASS: If invalid data is REJECTED by constraints
-- ❌ FAIL: If any unauthorized access SUCCEEDS (security issue!)
-- ============================================================================
