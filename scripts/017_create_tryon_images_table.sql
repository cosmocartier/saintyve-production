-- Create table for storing AI try-on images
CREATE TABLE IF NOT EXISTS tryon_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tryon_images_user_id ON tryon_images(user_id);

-- Enable RLS
ALTER TABLE tryon_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own try-on images"
  ON tryon_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own try-on images"
  ON tryon_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-on images"
  ON tryon_images FOR DELETE
  USING (auth.uid() = user_id);
