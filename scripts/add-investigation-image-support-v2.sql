-- Add image_url column to investigation_messages table for image support in chat

ALTER TABLE investigation_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_investigation_messages_image_url 
ON investigation_messages(image_url) 
WHERE image_url IS NOT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN investigation_messages.image_url IS 'URL of uploaded image attachment in the message';
