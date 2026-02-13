-- Add is_active column to links table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='is_active') THEN
        ALTER TABLE public.links ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add is_active column to profiles table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Policy to allow update on links (CRITICAL: Required for the toggle to work)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'links' AND policyname = 'Anyone can update links') THEN
        CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);
    END IF;
END $$;
