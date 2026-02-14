-- ============================================================================
-- Quick Start: Applying Security Fixes
-- ============================================================================
-- Run these SQL scripts in order in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Fix RLS Policies (CRITICAL)
-- File: fix_rls_policies.sql
-- This secures your database by ensuring users can only modify their own data

-- Step 2: Add Database Constraints
-- File: add_db_constraints.sql
-- This adds validation at the database level for data integrity

-- Step 3: Create Rate Limiting Infrastructure
-- File: create_rate_limits_table.sql
-- This creates the table needed for rate limiting

-- ============================================================================
-- After running SQL migrations, you need to:
-- ============================================================================

-- 1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
--    (Get this from Supabase Dashboard > Settings > API > service_role key)
--    
--    Add to .env.local:
--    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
--
--    ⚠️ CRITICAL: This key should NEVER be committed to git!
--    It's already in .gitignore, but double check.

-- 2. Test the application
--    Run: npm run dev
--    Test login, creating links, creating profiles

-- 3. Monitor rate limiting
--    After testing, check the rate_limits table:

SELECT 
  action,
  COUNT(*) as attempt_count,
  identifier,
  MAX(timestamp) as last_attempt
FROM public.rate_limits
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY action, identifier
ORDER BY attempt_count DESC;

-- 4. Periodic cleanup (run this manually or set up a cron job)
--    Clean up old rate limit records:

SELECT cleanup_rate_limits();

-- ============================================================================
-- Verification Tests
-- ============================================================================

-- Test 1: Verify RLS policies are in place
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('links', 'profiles', 'clicks')
ORDER BY tablename, policyname;

-- Expected result: Should see secure policies with auth.uid() checks

-- Test 2: Verify constraints are in place
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid IN ('public.links'::regclass, 'public.profiles'::regclass, 'public.clicks'::regclass)
  AND contype = 'c'
ORDER BY table_name, constraint_name;

-- Expected result: Should see format and length constraints

-- Test 3: Test that unauthenticated users CANNOT insert
-- This should FAIL (which is good!):
-- INSERT INTO public.links (user_id, slug, original_url) 
-- VALUES ('test-user', 'test-slug', 'https://example.com');

-- Test 4: Test that invalid slugs are rejected
-- This should FAIL (which is good!):
-- INSERT INTO public.links (user_id, slug, original_url) 
-- VALUES (auth.uid()::text, 'invalid slug!', 'https://example.com');

-- ============================================================================
-- Rollback (if needed)
-- ============================================================================

-- If you need to rollback the RLS policies:
/*
DROP POLICY IF EXISTS "Public can read active links" ON public.links;
DROP POLICY IF EXISTS "Authenticated users can insert their own links" ON public.links;
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;

-- Recreate old permissive policies (NOT RECOMMENDED)
CREATE POLICY "Anyone can read links" ON public.links FOR SELECT USING (true);
CREATE POLICY "Anyone can insert links" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete links" ON public.links FOR DELETE USING (true);
*/

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. All changes are backward compatible with existing application flow
-- 2. Public can still READ active links/profiles (for bio pages and redirects)
-- 3. Only authenticated users can modify their own data
-- 4. Rate limiting prevents brute force attacks
-- 5. Security headers protect against XSS and other client-side attacks
-- ============================================================================
