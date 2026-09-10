-- Create the memberships table to track user loyalty/membership data
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core membership data
  member_id TEXT NOT NULL UNIQUE, -- Format: "PLT-12345"
  status TEXT NOT NULL DEFAULT 'bronze' CHECK (status IN ('bronze', 'silver', 'gold', 'platinum', 'black')),
  
  -- Dates
  member_since TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  last_status_change TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  tier_history JSONB DEFAULT '[]'::jsonb, -- Track status changes over time
  notes TEXT, -- Admin notes about this membership
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one membership per user
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_valid_until ON public.memberships(valid_until);
CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON public.memberships(member_id);

-- Enable RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own membership"
  ON public.memberships
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships"
  ON public.memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update memberships"
  ON public.memberships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert memberships"
  ON public.memberships
  FOR INSERT
  WITH CHECK (true);

-- Fixed member ID generation to use proper PostgreSQL functions
-- Function to automatically generate member_id based on status
CREATE OR REPLACE FUNCTION generate_member_id(p_user_id UUID, p_status TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_numeric TEXT;
  v_hash INTEGER;
BEGIN
  -- Get prefix based on status
  v_prefix := CASE p_status
    WHEN 'bronze' THEN 'BRZ'
    WHEN 'silver' THEN 'SLV'
    WHEN 'gold' THEN 'GLD'
    WHEN 'platinum' THEN 'PLT'
    WHEN 'black' THEN 'BLK'
    ELSE 'BRZ'
  END;
  
  -- Generate a numeric value from UUID hash (ensures uniqueness)
  v_hash := ABS(('x' || SUBSTRING(REPLACE(p_user_id::TEXT, '-', '') FROM 1 FOR 8))::bit(32)::int);
  v_numeric := LPAD((v_hash % 100000)::TEXT, 5, '0');
  
  RETURN v_prefix || '-' || v_numeric;
END;
$$ LANGUAGE plpgsql;

-- Function to update valid_until automatically (1 year from member_since)
CREATE OR REPLACE FUNCTION set_membership_valid_until()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valid_until IS NULL OR NEW.valid_until = OLD.valid_until THEN
    NEW.valid_until := NEW.member_since + INTERVAL '1 year';
  END IF;
  
  -- Update member_id if status changed
  IF NEW.status != OLD.status OR NEW.member_id IS NULL THEN
    NEW.member_id := generate_member_id(NEW.user_id, NEW.status);
    NEW.last_status_change := now();
    
    -- Add to tier history
    NEW.tier_history := COALESCE(NEW.tier_history, '[]'::jsonb) || 
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'changed_at', now()
      );
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_membership_metadata
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION set_membership_valid_until();

-- Migrate existing users to memberships table
INSERT INTO public.memberships (user_id, member_id, status, member_since, valid_until)
SELECT 
  id,
  generate_member_id(id, COALESCE(status, 'bronze')),
  COALESCE(status, 'bronze'),
  COALESCE(created_at, now()),
  COALESCE(created_at, now()) + INTERVAL '1 year'
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.memberships)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.memberships IS 'Central table for tracking user membership/loyalty status and metadata';
COMMENT ON COLUMN public.memberships.member_id IS 'Unique member identifier (e.g., PLT-12345)';
COMMENT ON COLUMN public.memberships.tier_history IS 'JSON array tracking all status changes over time';
