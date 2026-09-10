-- Add address fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT,
ADD COLUMN IF NOT EXISTS address_zip TEXT,
ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
