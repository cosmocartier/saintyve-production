-- Add supplier role support and create supplier invoices table

-- Create supplier_invoices table
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_price NUMERIC(10, 2),
  order_ids UUID[] NOT NULL DEFAULT '{}',
  csv_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add processed_by_supplier column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS processed_by_supplier BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier_id ON public.supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_processed_by_supplier ON public.orders(processed_by_supplier);

-- Enable RLS
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is supplier
CREATE OR REPLACE FUNCTION public.is_supplier(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'supplier';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_supplier(UUID) TO authenticated;

-- RLS Policies for supplier_invoices

-- Suppliers can view their own invoices
CREATE POLICY "Suppliers can view own invoices"
ON public.supplier_invoices
FOR SELECT
TO authenticated
USING (
  supplier_id = auth.uid() AND public.is_supplier()
);

-- Suppliers can create their own invoices
CREATE POLICY "Suppliers can create own invoices"
ON public.supplier_invoices
FOR INSERT
TO authenticated
WITH CHECK (
  supplier_id = auth.uid() AND public.is_supplier()
);

-- Suppliers can update their own invoices
CREATE POLICY "Suppliers can update own invoices"
ON public.supplier_invoices
FOR UPDATE
TO authenticated
USING (
  supplier_id = auth.uid() AND public.is_supplier()
);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.supplier_invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update orders RLS to allow suppliers to view processing orders
CREATE POLICY "Suppliers can view processing orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  status = 'processing' AND public.is_supplier()
);

-- Suppliers can update processed_by_supplier field
CREATE POLICY "Suppliers can mark orders as processed"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  status = 'processing' AND public.is_supplier()
)
WITH CHECK (
  status = 'processing' AND public.is_supplier()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_supplier_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_invoice_updated_at
BEFORE UPDATE ON public.supplier_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_supplier_invoice_updated_at();

-- To set a user as supplier, run:
-- UPDATE public.profiles SET role = 'supplier' WHERE email = 'supplier@example.com';
