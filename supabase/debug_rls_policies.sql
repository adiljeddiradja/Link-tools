-- ============================================================================
-- DEBUG: Check Current RLS Policies
-- ============================================================================
-- Run this to see current policies and identify the issue
-- ============================================================================

-- 1. Check if RLS is enabled on profiles table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 2. Check current UPDATE policies on profiles
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND cmd = 'UPDATE';

-- 3. Check your user authentication
SELECT 
  auth.uid() as "Your User ID",
  auth.role() as "Your Role";

-- 4. Check if your profile exists and user_id matches
SELECT 
  id,
  user_id,
  handle,
  is_active,
  CASE 
    WHEN auth.uid()::text = user_id THEN '✅ Match'
    ELSE '❌ No Match'
  END as "User ID Check"
FROM public.profiles
WHERE auth.uid()::text = user_id;

-- 5. Try manual update to see exact error
-- Replace 'your-profile-id' with actual profile ID
/*
UPDATE public.profiles 
SET is_active = NOT is_active 
WHERE id = 'your-profile-id';
*/
