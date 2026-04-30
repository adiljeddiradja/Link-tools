-- Pro Features V2: Priority Links & Newsletter
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enable_newsletter BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS newsletter_text TEXT DEFAULT 'Subscribe to my newsletter';

-- Create Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, email)
);

-- RLS for Subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a subscriber
CREATE POLICY "Anyone can insert subscribers" 
ON public.subscribers 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Only profile owner can view subscribers
CREATE POLICY "Profile owners can view subscribers" 
ON public.subscribers 
FOR SELECT 
TO authenticated 
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

NOTIFY pgrst, 'reload schema';
