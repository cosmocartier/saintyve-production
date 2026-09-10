-- Add credits column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed_up, credited
  credits_awarded INTEGER DEFAULT 0,
  qualifying_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Function to check and award referral credits
CREATE OR REPLACE FUNCTION check_referral_credits()
RETURNS TRIGGER AS $$
DECLARE
  referral_record RECORD;
BEGIN
  -- Only process completed orders with total >= 200
  IF NEW.status = 'completed' AND NEW.total_amount >= 200 THEN
    -- Check if this user was referred
    SELECT * INTO referral_record
    FROM referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'signed_up'
    LIMIT 1;
    
    IF FOUND THEN
      -- Award 50 credits to referrer
      UPDATE profiles
      SET credits = credits + 50
      WHERE id = referral_record.referrer_id;
      
      -- Update referral status
      UPDATE referrals
      SET status = 'credited',
          credits_awarded = 50,
          qualifying_order_id = NEW.id,
          updated_at = NOW()
      WHERE id = referral_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically award credits
DROP TRIGGER IF EXISTS trigger_check_referral_credits ON orders;
CREATE TRIGGER trigger_check_referral_credits
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_referral_credits();
