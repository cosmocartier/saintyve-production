-- Add delivery issue tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_issue BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Add comment
COMMENT ON COLUMN orders.delivery_issue IS 'Flag to indicate if there is a delivery issue that needs investigation';
COMMENT ON COLUMN orders.delivery_notes IS 'Notes about delivery issues or special instructions';

-- Update RLS policies to allow suppliers and admins to update these fields
-- (existing policies should already cover this, but adding explicit comment)
