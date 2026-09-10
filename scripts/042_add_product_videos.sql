-- Add product_videos table
CREATE TABLE IF NOT EXISTS product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_display_order ON product_videos(product_id, display_order);

-- Add RLS policies
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product videos"
  ON product_videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert product videos"
  ON product_videos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update product videos"
  ON product_videos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product videos"
  ON product_videos FOR DELETE
  USING (auth.uid() IS NOT NULL);
