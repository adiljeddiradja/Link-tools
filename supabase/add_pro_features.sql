-- Linkiez Pro Features Migration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_type TEXT DEFAULT 'theme'; -- theme, color, gradient, animated
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_gradient TEXT; -- for custom CSS gradients
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_color TEXT; -- for solid colors

-- Update RLS for safety (optional but recommended)
NOTIFY pgrst, 'reload schema';
