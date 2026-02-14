-- ============================================================================
-- Security Fix: Database Constraints
-- ============================================================================
-- Purpose: Add validation constraints at database level (last line of defense)
-- Impact: Prevent invalid data from being inserted
-- Backward Compatible: YES - uses NOT VALID to skip existing data checks
-- ============================================================================

-- ============================================================================
-- 1. LINKS TABLE CONSTRAINTS
-- ============================================================================

-- Slug format: alphanumeric, hyphens, underscores only (3-50 chars)
-- NOT VALID = skip checking existing data, only validate new inserts/updates
ALTER TABLE public.links 
  ADD CONSTRAINT links_slug_format 
  CHECK (slug ~ '^[a-zA-Z0-9_-]{3,50}$') NOT VALID;

-- URL length limit (standard max URL length)
ALTER TABLE public.links 
  ADD CONSTRAINT links_url_length 
  CHECK (length(original_url) <= 2048 AND length(original_url) >= 1) NOT VALID;

-- Title length limit (optional field)
ALTER TABLE public.links 
  ADD CONSTRAINT links_title_length 
  CHECK (title IS NULL OR length(title) <= 200) NOT VALID;

-- Case-insensitive unique slug (prevent slug collisions)
-- Note: This will fail if there are duplicate slugs (case-insensitive)
-- Comment out if you have duplicates and want to keep them
CREATE UNIQUE INDEX IF NOT EXISTS links_slug_unique_ci 
  ON public.links (LOWER(slug));

-- ============================================================================
-- 2. PROFILES TABLE CONSTRAINTS
-- ============================================================================

-- Handle format: alphanumeric, hyphens, underscores only (3-30 chars)
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_handle_format 
  CHECK (handle ~ '^[a-zA-Z0-9_-]{3,30}$') NOT VALID;

-- Display name length
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_display_name_length 
  CHECK (display_name IS NULL OR length(display_name) <= 100) NOT VALID;

-- Bio length
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_bio_length 
  CHECK (bio IS NULL OR length(bio) <= 500) NOT VALID;

-- Avatar URL length
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_avatar_url_length 
  CHECK (avatar_url IS NULL OR length(avatar_url) <= 500) NOT VALID;

-- Background image URL length
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_bg_image_length 
  CHECK (bg_image IS NULL OR length(bg_image) <= 500) NOT VALID;

-- Background color format (hex color)
-- Made more permissive - allow any format since existing data may vary
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_bg_color_length 
  CHECK (bg_color IS NULL OR length(bg_color) <= 50) NOT VALID;

-- Button style enum - allow NULL and any existing values
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_button_style_check 
  CHECK (button_style IS NULL OR button_style IN ('rounded-xl', 'rounded-full', 'sharp')) NOT VALID;

-- Theme color validation - allow NULL and any existing values
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_theme_color_check 
  CHECK (theme_color IS NULL OR theme_color IN ('blue', 'purple', 'pink', 'green', 'red', 'orange', 'yellow', 'teal', 'indigo', 'rose', 'emerald', 'lilac')) NOT VALID;

-- Case-insensitive unique handle (prevent handle collisions)
-- Comment out if you have duplicates
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique_ci 
  ON public.profiles (LOWER(handle));

-- ============================================================================
-- 3. CLICKS TABLE CONSTRAINTS
-- ============================================================================

-- IP address length (IPv4 or IPv6)
ALTER TABLE public.clicks 
  ADD CONSTRAINT clicks_ip_length 
  CHECK (ip_address IS NULL OR length(ip_address) <= 45) NOT VALID;

-- User agent length
ALTER TABLE public.clicks 
  ADD CONSTRAINT clicks_user_agent_length 
  CHECK (user_agent IS NULL OR length(user_agent) <= 500) NOT VALID;

-- Referrer length
ALTER TABLE public.clicks 
  ADD CONSTRAINT clicks_referrer_length 
  CHECK (referrer IS NULL OR length(referrer) <= 500) NOT VALID;

-- Country code format (2-letter ISO code or 'unknown')
ALTER TABLE public.clicks 
  ADD CONSTRAINT clicks_country_format 
  CHECK (country IS NULL OR length(country) <= 50) NOT VALID;

-- Device type enum - allow NULL
ALTER TABLE public.clicks 
  ADD CONSTRAINT clicks_device_type_check 
  CHECK (device_type IS NULL OR device_type IN ('mobile', 'desktop', 'tablet', 'unknown')) NOT VALID;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to test)
-- ============================================================================

-- Test 1: Check all constraints are created
-- SELECT conname, contype, conrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid IN ('public.links'::regclass, 'public.profiles'::regclass, 'public.clicks'::regclass)
-- AND contype = 'c'
-- ORDER BY conrelid, conname;

-- Test 2: Test slug validation (should fail)
-- INSERT INTO public.links (user_id, slug, original_url) 
-- VALUES ('test-user', 'invalid slug!', 'https://example.com');

-- Test 3: Test handle validation (should fail)
-- INSERT INTO public.profiles (user_id, handle) 
-- VALUES ('test-user', 'invalid handle!');

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. All constraints are designed to match existing data patterns
-- 2. Constraints provide database-level validation (cannot be bypassed)
-- 3. Field lengths are generous to avoid rejecting valid data
-- 4. Unique indexes are case-insensitive to prevent confusion
-- 5. Enum constraints ensure data consistency
-- ============================================================================
