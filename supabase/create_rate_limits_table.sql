-- ============================================================================
-- Security Fix: Rate Limiting Infrastructure
-- ============================================================================
-- Purpose: Prevent brute force attacks and API abuse
-- Impact: Track and limit request rates per identifier (IP or user)
-- Backward Compatible: YES - new infrastructure, doesn't affect existing code
-- ============================================================================

-- ============================================================================
-- 1. CREATE RATE_LIMITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,        -- IP address or user_id
  action TEXT NOT NULL,             -- 'login', 'create_link', 'create_profile', etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb  -- Additional context if needed
);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup index (identifier + action + timestamp)
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
  ON public.rate_limits(identifier, action, timestamp DESC);

-- Cleanup index (timestamp only for periodic cleanup)
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp 
  ON public.rate_limits(timestamp);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (for server-side rate limiting)
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: No direct public access (rate limiting is server-side only)
CREATE POLICY "No public access to rate limits"
  ON public.rate_limits
  FOR ALL
  TO anon, authenticated
  USING (false);

-- ============================================================================
-- 4. CLEANUP FUNCTION
-- ============================================================================

-- Function to remove old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Log cleanup (optional)
  RAISE NOTICE 'Rate limits cleaned up at %', NOW();
END;
$$;

-- ============================================================================
-- 5. TABLE CONSTRAINTS
-- ============================================================================

-- Identifier max length
ALTER TABLE public.rate_limits 
  ADD CONSTRAINT rate_limits_identifier_length 
  CHECK (length(identifier) <= 255);

-- Action max length
ALTER TABLE public.rate_limits 
  ADD CONSTRAINT rate_limits_action_length 
  CHECK (length(action) <= 100);

-- Action must be from allowed list
ALTER TABLE public.rate_limits 
  ADD CONSTRAINT rate_limits_action_enum 
  CHECK (action IN ('login', 'signup', 'create_link', 'update_link', 'delete_link', 
                     'create_profile', 'update_profile', 'delete_profile', 'api_request'));

-- ============================================================================
-- OPTIONAL: SCHEDULED CLEANUP (requires pg_cron extension)
-- ============================================================================

-- To enable automated cleanup, install pg_cron extension first:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Then schedule the cleanup to run every hour:
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *',  -- Every hour at minute 0
--   'SELECT cleanup_rate_limits()'
-- );

-- ============================================================================
-- MANUAL CLEANUP (if pg_cron is not available)
-- ============================================================================

-- Run this manually or via application cron job:
-- SELECT cleanup_rate_limits();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Insert a test rate limit record
-- INSERT INTO public.rate_limits (identifier, action) 
-- VALUES ('127.0.0.1', 'login');

-- Test 2: Query rate limits for an identifier
-- SELECT * FROM public.rate_limits 
-- WHERE identifier = '127.0.0.1' 
-- AND action = 'login' 
-- AND timestamp > NOW() - INTERVAL '1 minute';

-- Test 3: Run cleanup manually
-- SELECT cleanup_rate_limits();

-- Test 4: Check table structure
-- \d public.rate_limits

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Rate limiting is enforced server-side (API routes or Edge Functions)
-- 2. Client-side code has no direct access to this table
-- 3. Cleanup function should be run periodically to prevent table bloat
-- 4. Default retention: 24 hours (configurable in cleanup function)
-- 5. Metadata field allows storing additional context (e.g., user agent)
-- ============================================================================
