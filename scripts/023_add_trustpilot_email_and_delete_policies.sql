-- Add email column to trustpilot_submissions table
ALTER TABLE trustpilot_submissions
ADD COLUMN IF NOT EXISTS email text;

-- Add DELETE policy for users to remove their own TikTok submissions (only if approved or rejected)
CREATE POLICY "Users can delete their own approved/rejected TikTok submissions"
ON tiktok_submissions
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status IN ('approved', 'rejected')
);

-- Add DELETE policy for users to remove their own Trustpilot submissions (only if approved or rejected)
CREATE POLICY "Users can delete their own approved/rejected Trustpilot submissions"
ON trustpilot_submissions
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status IN ('approved', 'rejected')
);

-- Add comment
COMMENT ON COLUMN trustpilot_submissions.email IS 'Email address used for the Trustpilot review';
