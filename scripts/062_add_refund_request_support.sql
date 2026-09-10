-- Add refund request support to investigation_case_resolutions table
-- This extends the existing table without breaking current functionality

-- Add new columns for refund data
ALTER TABLE investigation_case_resolutions
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_method TEXT,
ADD COLUMN IF NOT EXISTS refund_details TEXT;

-- Drop the old constraint
ALTER TABLE investigation_case_resolutions
DROP CONSTRAINT IF EXISTS investigation_case_resolutions_resolution_type_check;

-- Add new constraint that includes refund_request
ALTER TABLE investigation_case_resolutions
ADD CONSTRAINT investigation_case_resolutions_resolution_type_check
CHECK (resolution_type IN ('store_link', 'custom_request', 'refund_request'));

-- Create index for refund_method lookups (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_investigation_resolutions_refund_method
ON investigation_case_resolutions(refund_method) WHERE refund_method IS NOT NULL;
