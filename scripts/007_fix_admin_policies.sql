-- Fix infinite recursion in RLS policies
-- This script drops the problematic policies and recreates them correctly

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Drop existing user policies to recreate them with admin support
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- Drop any existing is_admin functions to prevent "function is not unique" error
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

-- Create a secure function to check admin status without recursion
-- This uses SECURITY DEFINER to bypass RLS when checking the role
CREATE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Recreate profiles policies with admin support
-- Users can view their own profile OR admins can view all profiles
CREATE POLICY "Users can view profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Users can update their own profile OR admins can update all profiles
CREATE POLICY "Users can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Recreate orders policies with admin support
-- Users can view their own orders OR admins can view all orders
CREATE POLICY "Users can view orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- Users can create their own orders
CREATE POLICY "Users can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders OR admins can update all orders
CREATE POLICY "Users can update orders"
  ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- Recreate order items policies with admin support
-- Users can view items from their own orders OR admins can view all order items
CREATE POLICY "Users can view order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- Users can create items for their own orders
CREATE POLICY "Users can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can update order items
CREATE POLICY "Admins can update order items"
  ON public.order_items
  FOR UPDATE
  USING (public.is_admin());

-- Add policy for admins to view all profiles (needed for customer management)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Ensure the role column has the correct default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Update any existing NULL roles to 'customer'
UPDATE public.profiles SET role = 'customer' WHERE role IS NULL;
