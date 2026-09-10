-- Fix RLS policies to allow admin users to access supplier tables

-- Drop existing policies for supplier_product_prices
DROP POLICY IF EXISTS "Suppliers can insert their own prices" ON supplier_product_prices;
DROP POLICY IF EXISTS "Suppliers can update their own prices" ON supplier_product_prices;
DROP POLICY IF EXISTS "Suppliers can view their own prices" ON supplier_product_prices;

-- Create new policies that allow both admin and supplier roles
CREATE POLICY "Suppliers and admins can insert prices" ON supplier_product_prices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );

CREATE POLICY "Suppliers and admins can update prices" ON supplier_product_prices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );

CREATE POLICY "Suppliers and admins can view prices" ON supplier_product_prices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );

-- Drop existing policies for supplier_invoices
DROP POLICY IF EXISTS "Suppliers can create own invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Suppliers can update own invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Suppliers can view own invoices" ON supplier_invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON supplier_invoices;

-- Create new policies that allow both admin and supplier roles
CREATE POLICY "Suppliers and admins can create invoices" ON supplier_invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );

CREATE POLICY "Suppliers and admins can update invoices" ON supplier_invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );

CREATE POLICY "Suppliers and admins can view invoices" ON supplier_invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('supplier', 'admin')
    )
  );
