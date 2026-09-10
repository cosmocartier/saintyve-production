-- ============================================================================
-- DATABASE CLEANUP SCRIPT
-- ============================================================================
-- This script removes all user-related data, functions, triggers, and policies
-- while preserving the product catalog (products, product_variants, product_images)
-- 
-- CAUTION: This will permanently delete all user data, orders, profiles, etc.
-- Run this script only when you want to reset the database to a clean state
-- ============================================================================

-- Disable RLS temporarily to avoid policy conflicts during cleanup
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupon_usage DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL RLS POLICIES
-- ============================================================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Drop orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Drop order_items policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update all order items" ON public.order_items;

-- Drop cart_items policies
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

-- Drop user_likes policies
DROP POLICY IF EXISTS "Users can view own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.user_likes;

-- Drop coupons policies
DROP POLICY IF EXISTS "Anyone can view enabled coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can view all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;

-- Drop coupon_usage policies
DROP POLICY IF EXISTS "Users can view own coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "Admins can view all coupon usage" ON public.coupon_usage;

-- ============================================================================
-- DROP ALL TRIGGERS ON USER TABLES
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_order_updated ON public.orders;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;

-- ============================================================================
-- DROP ALL INDEXES ON USER TABLES
-- ============================================================================

DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_cart_items_user_id;
DROP INDEX IF EXISTS idx_user_likes_user_id;
DROP INDEX IF EXISTS idx_user_likes_product_id;
DROP INDEX IF EXISTS idx_coupons_code;
DROP INDEX IF EXISTS idx_coupon_usage_user_id;
DROP INDEX IF EXISTS idx_coupon_usage_coupon_id;

-- ============================================================================
-- DROP ALL USER-RELATED TABLES (CASCADE to handle foreign keys)
-- ============================================================================

DROP TABLE IF EXISTS public.coupon_usage CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.user_likes CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- DROP ALL USER-RELATED FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- ============================================================================
-- REVOKE PERMISSIONS (cleanup)
-- ============================================================================

-- Note: We're not revoking permissions on products tables as they should remain accessible

-- ============================================================================
-- VERIFICATION QUERIES (uncomment to check what remains)
-- ============================================================================

-- List all remaining tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- List all remaining functions
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- List all remaining triggers
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- List all remaining policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'DATABASE CLEANUP COMPLETED SUCCESSFULLY';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Removed:';
  RAISE NOTICE '  - All user profiles and authentication data';
  RAISE NOTICE '  - All orders and order items';
  RAISE NOTICE '  - All cart items';
  RAISE NOTICE '  - All user likes/wishlist';
  RAISE NOTICE '  - All coupons and coupon usage';
  RAISE NOTICE '  - All user-related functions and triggers';
  RAISE NOTICE '  - All RLS policies on user tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Preserved:';
  RAISE NOTICE '  - products table and data';
  RAISE NOTICE '  - product_variants table and data';
  RAISE NOTICE '  - product_images table and data';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now reinitialize user-related database elements.';
  RAISE NOTICE '============================================================================';
END $$;
