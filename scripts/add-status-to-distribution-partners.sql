-- Add status column to distribution_partners table
ALTER TABLE public.distribution_partners
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Verified', 'Closed', 'Banned'));

-- Allow public (unauthenticated) users to submit an application (INSERT only)
CREATE POLICY "Anyone can apply as distribution partner"
  ON public.distribution_partners
  FOR INSERT
  WITH CHECK (true);
