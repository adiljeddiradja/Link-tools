-- Create 'clicks' table for real-time analytics
CREATE TABLE IF NOT EXISTS public.clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own clicks
CREATE POLICY "Users can view clicks for their own links"
ON public.clicks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.links
        WHERE public.links.id = public.clicks.link_id
        AND public.links.user_id::text = auth.uid()::text
    )
);

-- Allow public to insert clicks
CREATE POLICY "Anyone can insert clicks"
ON public.clicks FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON public.clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_profile_id ON public.clicks(profile_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
