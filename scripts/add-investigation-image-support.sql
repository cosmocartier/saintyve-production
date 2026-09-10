-- Add image_url column to investigation_messages for image attachment support
ALTER TABLE investigation_messages
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies are already in place, so images will inherit the same security
