-- Add access_granted column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS access_granted boolean NOT NULL DEFAULT false;

-- Existing confirmed users (registered before this feature) should have access by default
-- so they're not locked out. Set all existing profiles to true.
UPDATE public.profiles SET access_granted = true WHERE access_granted = false;
