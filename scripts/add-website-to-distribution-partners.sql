-- Add website column to distribution_partners table
ALTER TABLE public.distribution_partners
ADD COLUMN IF NOT EXISTS website text;
