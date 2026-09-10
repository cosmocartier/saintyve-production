-- Create investigation_cases table for tracking urgent order issues
CREATE TABLE IF NOT EXISTS investigation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigation_messages table for chat functionality
CREATE TABLE IF NOT EXISTS investigation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_by_admin BOOLEAN DEFAULT FALSE,
  read_by_supplier BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investigation_cases_order_id ON investigation_cases(order_id);
CREATE INDEX IF NOT EXISTS idx_investigation_cases_status ON investigation_cases(status);
CREATE INDEX IF NOT EXISTS idx_investigation_cases_priority ON investigation_cases(priority);
CREATE INDEX IF NOT EXISTS idx_investigation_cases_created_by ON investigation_cases(created_by);
CREATE INDEX IF NOT EXISTS idx_investigation_messages_case_id ON investigation_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_investigation_messages_created_at ON investigation_messages(created_at);

-- Enable RLS
ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investigation_cases
CREATE POLICY "Admins and suppliers can view all cases"
  ON investigation_cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

CREATE POLICY "Admins and suppliers can create cases"
  ON investigation_cases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

CREATE POLICY "Admins and suppliers can update cases"
  ON investigation_cases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

-- RLS Policies for investigation_messages
CREATE POLICY "Admins and suppliers can view messages in their cases"
  ON investigation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

CREATE POLICY "Admins and suppliers can send messages"
  ON investigation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

CREATE POLICY "Admins and suppliers can update message read status"
  ON investigation_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supplier')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investigation_case_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER investigation_cases_updated_at
  BEFORE UPDATE ON investigation_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_investigation_case_updated_at();
