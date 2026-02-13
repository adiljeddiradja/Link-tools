-- Add position column for link reordering
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing rows to have a default position based on created_at
WITH numbered_links AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at ASC) as row_num
    FROM public.links
)
UPDATE public.links
SET position = numbered_links.row_num
FROM numbered_links
WHERE public.links.id = numbered_links.id;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
