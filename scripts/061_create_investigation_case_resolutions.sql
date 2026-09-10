-- Create table to store customer resolutions for investigation cases
CREATE TABLE IF NOT EXISTS investigation_case_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  resolution_type TEXT NOT NULL CHECK (resolution_type IN ('store_link', 'custom_request')),
  product_link TEXT,
  link_notes TEXT,
  custom_description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for case_id lookups
CREATE INDEX IF NOT EXISTS idx_investigation_case_resolutions_case_id 
  ON investigation_case_resolutions(case_id);

-- Enable RLS
ALTER TABLE investigation_case_resolutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admins and suppliers can view resolutions
CREATE POLICY "Admins and suppliers can view case resolutions"
  ON investigation_case_resolutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

-- Allow public insert (customers submitting via public form with token)
CREATE POLICY "Anyone can submit case resolutions"
  ON investigation_case_resolutions FOR INSERT
  WITH CHECK (true);

-- Admins and suppliers can update resolutions
CREATE POLICY "Admins and suppliers can update case resolutions"
  ON investigation_case_resolutions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resolution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER investigation_case_resolutions_updated_at
  BEFORE UPDATE ON investigation_case_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_resolution_updated_at();
