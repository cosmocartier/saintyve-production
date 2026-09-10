-- Add card image fields to memberships table
ALTER TABLE public.memberships
ADD COLUMN IF NOT EXISTS card_front_url TEXT,
ADD COLUMN IF NOT EXISTS card_back_url TEXT;

COMMENT ON COLUMN public.memberships.card_front_url IS 'URL to front side image of physical membership card';
COMMENT ON COLUMN public.memberships.card_back_url IS 'URL to back side image of physical membership card';
