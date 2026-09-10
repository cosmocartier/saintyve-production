-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  user_email TEXT, -- If set, only this user can use the coupon
  instagram_tag TEXT, -- Optional Instagram tag for influencer coupons
  enabled BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- NULL for unlimited, number for limited uses
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- NULL for no expiration
  applicable_products UUID[], -- NULL for all products, array of product IDs for specific products
  minimum_order_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_user_email ON public.coupons(user_email);
CREATE INDEX IF NOT EXISTS idx_coupons_enabled ON public.coupons(enabled);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read enabled coupons (for validation)
CREATE POLICY "Anyone can read enabled coupons"
  ON public.coupons
  FOR SELECT
  USING (enabled = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage coupons"
  ON public.coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Insert 50 pre-made coupon codes
INSERT INTO public.coupons (code, discount_type, discount_value, user_email, instagram_tag, usage_limit, valid_until, applicable_products, minimum_order_value) VALUES
-- General discount coupons (unlimited use)
('WELCOME10', 'percentage', 10, NULL, NULL, NULL, NULL, NULL, 0),
('SAVE15', 'percentage', 15, NULL, NULL, NULL, NULL, NULL, 50),
('SAVE20', 'percentage', 20, NULL, NULL, NULL, NULL, NULL, 100),
('FIRST25', 'percentage', 25, NULL, NULL, 1, NULL, NULL, 0), -- One-time use per user
('PREMIUM30', 'percentage', 30, NULL, NULL, NULL, NULL, NULL, 200),

-- Fixed amount discounts
('EURO5OFF', 'fixed', 5, NULL, NULL, NULL, NULL, NULL, 0),
('EURO10OFF', 'fixed', 10, NULL, NULL, NULL, NULL, NULL, 30),
('EURO20OFF', 'fixed', 20, NULL, NULL, NULL, NULL, NULL, 75),
('EURO50OFF', 'fixed', 50, NULL, NULL, NULL, NULL, NULL, 150),
('EURO100OFF', 'fixed', 100, NULL, NULL, NULL, NULL, NULL, 300),

-- Limited use coupons
('FLASH50', 'percentage', 50, NULL, NULL, 100, NOW() + INTERVAL '7 days', NULL, 0),
('EARLY40', 'percentage', 40, NULL, NULL, 50, NOW() + INTERVAL '3 days', NULL, 0),
('EXCLUSIVE35', 'percentage', 35, NULL, NULL, 25, NOW() + INTERVAL '14 days', NULL, 100),

-- Influencer coupons (with Instagram tags)
('STYLE15', 'percentage', 15, NULL, '@fashionista', NULL, NULL, NULL, 0),
('TREND20', 'percentage', 20, NULL, '@trendsetters', NULL, NULL, NULL, 0),
('VIBE25', 'percentage', 25, NULL, '@vibecheck', NULL, NULL, NULL, 50),
('DRIP30', 'percentage', 30, NULL, '@dripculture', NULL, NULL, NULL, 100),
('FRESH20', 'percentage', 20, NULL, '@freshstyle', NULL, NULL, NULL, 0),

-- VIP/Exclusive coupons (user-specific - email will be set by admin)
('VIP50', 'percentage', 50, NULL, NULL, 1, NULL, NULL, 0),
('VIP100', 'fixed', 100, NULL, NULL, 1, NULL, NULL, 0),
('EXCLUSIVE60', 'percentage', 60, NULL, NULL, 1, NULL, NULL, 150),
('PRIVATE40', 'percentage', 40, NULL, NULL, 3, NULL, NULL, 0),
('SPECIAL75', 'fixed', 75, NULL, NULL, 1, NULL, NULL, 200),

-- Seasonal/Event coupons
('SUMMER25', 'percentage', 25, NULL, NULL, NULL, NOW() + INTERVAL '90 days', NULL, 0),
('WINTER30', 'percentage', 30, NULL, NULL, NULL, NOW() + INTERVAL '90 days', NULL, 75),
('SPRING20', 'percentage', 20, NULL, NULL, NULL, NOW() + INTERVAL '90 days', NULL, 0),
('FALL15', 'percentage', 15, NULL, NULL, NULL, NOW() + INTERVAL '90 days', NULL, 0),
('HOLIDAY40', 'percentage', 40, NULL, NULL, NULL, NOW() + INTERVAL '30 days', NULL, 100),

-- Bundle/Minimum purchase coupons
('BIG50', 'percentage', 50, NULL, NULL, NULL, NULL, NULL, 500),
('MEGA100', 'fixed', 100, NULL, NULL, NULL, NULL, NULL, 400),
('SUPER75', 'fixed', 75, NULL, NULL, NULL, NULL, NULL, 250),
('ULTRA60', 'percentage', 60, NULL, NULL, NULL, NULL, NULL, 600),

-- Friend referral coupons
('FRIEND10', 'percentage', 10, NULL, NULL, NULL, NULL, NULL, 0),
('REFER15', 'percentage', 15, NULL, NULL, NULL, NULL, NULL, 0),
('SHARE20', 'percentage', 20, NULL, NULL, NULL, NULL, NULL, 50),

-- Newsletter/Email coupons
('NEWS10', 'percentage', 10, NULL, NULL, NULL, NULL, NULL, 0),
('EMAIL15', 'percentage', 15, NULL, NULL, NULL, NULL, NULL, 0),
('SUBSCRIBE20', 'percentage', 20, NULL, NULL, 1, NULL, NULL, 0),

-- Social media coupons
('INSTA15', 'percentage', 15, NULL, NULL, NULL, NULL, NULL, 0),
('FOLLOW20', 'percentage', 20, NULL, NULL, NULL, NULL, NULL, 0),
('LIKE10', 'percentage', 10, NULL, NULL, NULL, NULL, NULL, 0),

-- Birthday/Anniversary coupons
('BDAY30', 'percentage', 30, NULL, NULL, 1, NULL, NULL, 0),
('ANNIV40', 'percentage', 40, NULL, NULL, 1, NULL, NULL, 0),
('CELEBRATE25', 'percentage', 25, NULL, NULL, 1, NULL, NULL, 0),

-- Loyalty coupons
('LOYAL20', 'percentage', 20, NULL, NULL, NULL, NULL, NULL, 0),
('RETURN25', 'percentage', 25, NULL, NULL, NULL, NULL, NULL, 0),
('VALUED30', 'percentage', 30, NULL, NULL, NULL, NULL, NULL, 100),

-- Flash sale coupons
('FLASH24H', 'percentage', 35, NULL, NULL, 200, NOW() + INTERVAL '1 day', NULL, 0),
('QUICK30', 'percentage', 30, NULL, NULL, 150, NOW() + INTERVAL '6 hours', NULL, 0),
('RUSH25', 'percentage', 25, NULL, NULL, 100, NOW() + INTERVAL '12 hours', NULL, 0);

-- Create coupon_usage table to track individual uses
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coupon_usage
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id);

-- Enable RLS on coupon_usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage
CREATE POLICY "Users can read own coupon usage"
  ON public.coupon_usage
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can insert usage records
CREATE POLICY "System can insert coupon usage"
  ON public.coupon_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can view all usage
CREATE POLICY "Admins can view all coupon usage"
  ON public.coupon_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
