-- Fix the foreign key constraint on distributor_customers.distributor
-- It currently points to profiles(id) but should point to distribution_partners(id)

ALTER TABLE public.distributor_customers
  DROP CONSTRAINT IF EXISTS distributor_customers_distributor_fkey;

ALTER TABLE public.distributor_customers
  ADD CONSTRAINT distributor_customers_distributor_fkey
  FOREIGN KEY (distributor)
  REFERENCES public.distribution_partners(id)
  ON DELETE CASCADE;
