-- Add admin policies for product management tables
-- This allows admins to fully manage products, variants, and images

-- Products table policies for admins
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.is_admin());

-- Product variants table policies for admins
CREATE POLICY "Admins can insert product variants"
  ON public.product_variants
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product variants"
  ON public.product_variants
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete product variants"
  ON public.product_variants
  FOR DELETE
  USING (public.is_admin());

-- Product images table policies for admins
CREATE POLICY "Admins can insert product images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update product images"
  ON public.product_images
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON public.product_images
  FOR DELETE
  USING (public.is_admin());
