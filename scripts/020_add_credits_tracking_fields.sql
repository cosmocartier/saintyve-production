-- Add fields to profiles table for tracking credit earning activities
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_credits_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trustpilot_review_submitted BOOLEAN DEFAULT FALSE;

-- Create table for TikTok video submissions
CREATE TABLE IF NOT EXISTS tiktok_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  proof_url TEXT, -- Screenshot or link showing 100k views
  views_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for tiktok_submissions
ALTER TABLE tiktok_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TikTok submissions"
  ON tiktok_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own TikTok submissions"
  ON tiktok_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add pending_credits column to orders if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pending_credits BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_pending_credits ON orders(user_id, pending_credits) WHERE pending_credits = TRUE;
CREATE INDEX IF NOT EXISTS idx_tiktok_submissions_user ON tiktok_submissions(user_id);
