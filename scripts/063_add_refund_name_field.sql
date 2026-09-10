-- Add refund_name column to store the account holder name for bank transfers
ALTER TABLE investigation_case_resolutions
ADD COLUMN IF NOT EXISTS refund_name TEXT;

-- Add comment to clarify the purpose
COMMENT ON COLUMN investigation_case_resolutions.refund_name IS 'Account holder name for bank transfer refunds';
