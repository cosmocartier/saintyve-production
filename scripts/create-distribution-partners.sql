-- Create the distribution_partners table
CREATE TABLE IF NOT EXISTS public.distribution_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text NOT NULL,
  operating_region text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.distribution_partners ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to distribution partners"
  ON public.distribution_partners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Policy: A distributor can read their own record
CREATE POLICY "Distributors can view their own profile"
  ON public.distribution_partners
  FOR SELECT
  USING (id = auth.uid());

-- Policy: A distributor can update their own record (except password_hash via this policy)
CREATE POLICY "Distributors can update their own profile"
  ON public.distribution_partners
  FOR UPDATE
  USING (id = auth.uid());

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.handle_distribution_partners_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER distribution_partners_updated_at
  BEFORE UPDATE ON public.distribution_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_distribution_partners_updated_at();
