-- Migrate all existing profiles to memberships table and set up auto-trigger for new profiles
-- This script ensures every user has a membership entry

-- Step 1: Migrate all existing profiles that don't have a membership yet
-- Set them all to bronze status
INSERT INTO public.memberships (user_id, member_id, status, member_since, valid_until)
SELECT 
  p.id,
  generate_member_id(p.id, 'bronze'),
  'bronze',
  COALESCE(p.created_at, now()),
  COALESCE(p.created_at, now()) + INTERVAL '1 year'
FROM public.profiles p
WHERE p.id NOT IN (SELECT user_id FROM public.memberships)
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Create a trigger function that automatically creates a bronze membership
-- whenever a new profile is created
CREATE OR REPLACE FUNCTION create_membership_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a bronze membership for the new profile
  INSERT INTO public.memberships (user_id, member_id, status, member_since, valid_until)
  VALUES (
    NEW.id,
    generate_member_id(NEW.id, 'bronze'),
    'bronze',
    now(),
    now() + INTERVAL '1 year'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger on profiles table
DROP TRIGGER IF EXISTS create_membership_on_profile_insert ON public.profiles;

CREATE TRIGGER create_membership_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_membership_for_new_profile();

-- Step 4: Remove the status column from profiles table since we're using memberships now
-- First, drop any constraints that reference the status column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_membership_status;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

-- Now drop the status column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS status;

-- Add comments
COMMENT ON FUNCTION create_membership_for_new_profile() IS 'Automatically creates a bronze membership for newly registered users';
COMMENT ON TRIGGER create_membership_on_profile_insert ON public.profiles IS 'Ensures every new profile gets a bronze membership entry';
