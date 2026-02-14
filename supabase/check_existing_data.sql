-- ============================================================================
-- DIAGNOSTIC: Check existing data before applying constraints
-- ============================================================================
-- Run this first to see what data would violate the constraints
-- ============================================================================

-- Check slugs in links table that would violate the constraint
SELECT 
  id,
  slug,
  length(slug) as slug_length,
  CASE 
    WHEN slug !~ '^[a-zA-Z0-9_-]{3,50}$' THEN 'INVALID FORMAT'
    WHEN length(slug) < 3 THEN 'TOO SHORT'
    WHEN length(slug) > 50 THEN 'TOO LONG'
    ELSE 'OK'
  END as status
FROM public.links
WHERE slug !~ '^[a-zA-Z0-9_-]{3,50}$' 
   OR length(slug) < 3 
   OR length(slug) > 50;

-- Check handles in profiles table that would violate the constraint
SELECT 
  id,
  handle,
  length(handle) as handle_length,
  CASE 
    WHEN handle !~ '^[a-zA-Z0-9_-]{3,30}$' THEN 'INVALID FORMAT'
    WHEN length(handle) < 3 THEN 'TOO SHORT'
    WHEN length(handle) > 30 THEN 'TOO LONG'
    ELSE 'OK'
  END as status
FROM public.profiles
WHERE handle !~ '^[a-zA-Z0-9_-]{3,30}$' 
   OR length(handle) < 3 
   OR length(handle) > 30;

-- Check URLs that are too long
SELECT id, slug, length(original_url) as url_length
FROM public.links
WHERE length(original_url) > 2048 OR length(original_url) < 1;

-- Check hex colors that are invalid
SELECT id, handle, bg_color
FROM public.profiles
WHERE bg_color IS NOT NULL 
  AND bg_color !~ '^#[0-9a-fA-F]{6}$';
