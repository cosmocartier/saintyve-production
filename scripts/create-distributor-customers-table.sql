-- Create distributor_customers table
CREATE TABLE IF NOT EXISTS public.distributor_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  street TEXT,
  country TEXT,
  phone TEXT,
  distributor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.distributor_customers ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own customers
CREATE POLICY "Distributors can view their own customers"
  ON public.distributor_customers
  FOR SELECT
  USING (
    auth.uid() = distributor
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Distributors can insert their own customers
CREATE POLICY "Distributors can insert their own customers"
  ON public.distributor_customers
  FOR INSERT
  WITH CHECK (
    auth.uid() = distributor
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Distributors can update their own customers
CREATE POLICY "Distributors can update their own customers"
  ON public.distributor_customers
  FOR UPDATE
  USING (
    auth.uid() = distributor
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Distributors can delete their own customers
CREATE POLICY "Distributors can delete their own customers"
  ON public.distributor_customers
  FOR DELETE
  USING (
    auth.uid() = distributor
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
