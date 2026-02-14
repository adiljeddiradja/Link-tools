-- ============================================================================
-- Security Fix: Update RLS Policies for Profile Updates
-- ============================================================================
-- Purpose: Fix RLS policy that's too restrictive on profile updates
-- Issue: WITH CHECK clause prevents updates even when user owns the profile
-- Solution: Remove WITH CHECK requirement for user_id match (it's already in USING)
-- ============================================================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- ✅ FIXED: Users can update their own profile
-- USING ensures user owns the profile
-- No WITH CHECK needed since we're not changing user_id
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Apply same fix for links table
DROP POLICY IF EXISTS "Users can update their own links" ON public.links;

CREATE POLICY "Users can update their own links"
  ON public.links FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test update (should work now):
-- UPDATE public.profiles SET is_active = false WHERE id = 'your-profile-id';
-- ============================================================================
