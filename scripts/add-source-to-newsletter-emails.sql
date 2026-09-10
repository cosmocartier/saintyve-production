-- Add source column to newsletter_emails table
ALTER TABLE public.newsletter_emails
  ADD COLUMN IF NOT EXISTS source text;
