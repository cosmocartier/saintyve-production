-- Add RLS policy to allow users to update ONLY the credits_collected field on their own Trustpilot submissions
-- This is required so users can mark submissions as collected when claiming credits

-- Drop existing policy if it exists (in case we're re-running this)
DROP POLICY IF EXISTS "Users can update credits_collected on own submissions" ON public.trustpilot_submissions;

-- Create new policy that allows users to update only the credits_collected column
CREATE POLICY "Users can update credits_collected on own submissions"
ON public.trustpilot_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also add the same policy for tiktok_submissions
DROP POLICY IF EXISTS "Users can update credits_collected on own TikTok submissions" ON public.tiktok_submissions;

CREATE POLICY "Users can update credits_collected on own TikTok submissions"
ON public.tiktok_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also add the same policy for referrals
DROP POLICY IF EXISTS "Users can update credits_collected on own referrals" ON public.referrals;

CREATE POLICY "Users can update credits_collected on own referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (auth.uid() = referrer_id)
WITH CHECK (auth.uid() = referrer_id);
