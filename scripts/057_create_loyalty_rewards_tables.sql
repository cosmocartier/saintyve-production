-- Create loyalty_rewards table for monthly rewards per tier
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('Bronze Edition', 'Silver Edition', 'Gold Edition', 'Platinum Edition', 'Black Edition')),
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('discount', 'credits', 'free_shipping', 'exclusive_access', 'gift')),
  value NUMERIC, -- Discount percentage, credit amount, etc.
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier, month, title)
);

-- Create loyalty_user_rewards table for tracking user rewards
CREATE TABLE IF NOT EXISTS loyalty_user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'expired')),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_id)
);

-- Enable RLS
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_rewards
CREATE POLICY "Anyone can view active rewards"
  ON loyalty_rewards
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage rewards"
  ON loyalty_rewards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for loyalty_user_rewards
CREATE POLICY "Users can view their own rewards"
  ON loyalty_user_rewards
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards"
  ON loyalty_user_rewards
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert user rewards"
  ON loyalty_user_rewards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all user rewards"
  ON loyalty_user_rewards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_loyalty_rewards_tier_month ON loyalty_rewards(tier, month);
CREATE INDEX idx_loyalty_rewards_is_active ON loyalty_rewards(is_active);
CREATE INDEX idx_loyalty_user_rewards_user_id ON loyalty_user_rewards(user_id);
CREATE INDEX idx_loyalty_user_rewards_status ON loyalty_user_rewards(status);
CREATE INDEX idx_loyalty_user_rewards_reward_id ON loyalty_user_rewards(reward_id);

-- Insert sample rewards for current month
INSERT INTO loyalty_rewards (tier, month, title, description, reward_type, value, expires_at, is_active) VALUES
  ('Bronze Edition', TO_CHAR(NOW(), 'YYYY-MM'), '5% Off Next Order', 'Get 5% discount on your next purchase', 'discount', 5, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Bronze Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Welcome Credits', 'Earn 50 bonus credits this month', 'credits', 50, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  
  ('Silver Edition', TO_CHAR(NOW(), 'YYYY-MM'), '10% Off Next Order', 'Get 10% discount on your next purchase', 'discount', 10, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Silver Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Bonus Credits', 'Earn 100 bonus credits this month', 'credits', 100, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Silver Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Priority Support', 'Get priority customer support access', 'exclusive_access', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  
  ('Gold Edition', TO_CHAR(NOW(), 'YYYY-MM'), '15% Off Next Order', 'Get 15% discount on your next purchase', 'discount', 15, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Gold Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Premium Credits', 'Earn 200 bonus credits this month', 'credits', 200, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Gold Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Free Express Shipping', 'Free express shipping on next order', 'free_shipping', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  
  ('Platinum Edition', TO_CHAR(NOW(), 'YYYY-MM'), '20% Off Next Order', 'Get 20% discount on your next purchase', 'discount', 20, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Platinum Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Elite Credits', 'Earn 350 bonus credits this month', 'credits', 350, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Platinum Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'VIP Early Access', 'Early access to new releases', 'exclusive_access', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Platinum Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Exclusive Gift', 'Special gift with next order', 'gift', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  
  ('Black Edition', TO_CHAR(NOW(), 'YYYY-MM'), '25% Off Next Order', 'Get 25% discount on your next purchase', 'discount', 25, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Black Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Ultimate Credits', 'Earn 500 bonus credits this month', 'credits', 500, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Black Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Concierge Service', 'Personal shopping assistant', 'exclusive_access', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Black Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Luxury Gift', 'Premium gift with next order', 'gift', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true),
  ('Black Edition', TO_CHAR(NOW(), 'YYYY-MM'), 'Unlimited Free Shipping', 'Free shipping on all orders this month', 'free_shipping', NULL, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '7 days'), true)
ON CONFLICT (tier, month, title) DO NOTHING;
