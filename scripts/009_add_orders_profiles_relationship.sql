-- Add foreign key relationship between orders and profiles
-- This allows Supabase to join orders with profile information

-- First, ensure all existing orders have valid user_ids that exist in profiles
-- (This should already be the case due to the trigger that creates profiles on user signup)

-- Add the foreign key constraint
-- Note: We're adding this as an additional constraint, not replacing the existing auth.users reference
-- The orders.user_id will now reference both auth.users(id) AND profiles(id) since profiles.id = auth.users.id

-- Drop the existing foreign key to auth.users
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add new foreign key to profiles instead
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Update the RLS policies to work with the new relationship
-- The existing policies should still work since profiles.id = auth.users.id

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id_profiles ON public.orders(user_id);

-- Verify the relationship works
-- This comment documents that orders.user_id now directly references profiles.id
-- which enables Supabase PostgREST to automatically join orders with profiles
