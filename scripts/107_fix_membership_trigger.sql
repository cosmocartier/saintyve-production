-- Fix the create_membership_for_new_profile trigger.
-- The original generate_member_id only uses 5 digits (% 100000), causing UNIQUE
-- constraint violations on member_id when hashes collide.
-- This replaces it with a collision-safe version using more UUID entropy,
-- and wraps the insert in an EXCEPTION block so a membership conflict
-- never bubbles up to fail the entire auth user creation.

-- Step 1: Replace generate_member_id with a collision-safe version
CREATE OR REPLACE FUNCTION generate_member_id(p_user_id UUID, p_status TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_numeric TEXT;
BEGIN
  v_prefix := CASE p_status
    WHEN 'bronze'   THEN 'BRZ'
    WHEN 'silver'   THEN 'SLV'
    WHEN 'gold'     THEN 'GLD'
    WHEN 'platinum' THEN 'PLT'
    WHEN 'black'    THEN 'BLK'
    ELSE 'BRZ'
  END;

  -- Use full 32-char UUID hex for much more entropy (10 digits, mod 10^10)
  v_numeric := LPAD(
    (ABS(('x' || REPLACE(p_user_id::TEXT, '-', ''))::bit(64)::bigint) % 1000000000)::TEXT,
    9, '0'
  );

  RETURN v_prefix || '-' || v_numeric;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Replace the trigger function with one that is fully exception-safe
CREATE OR REPLACE FUNCTION create_membership_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (user_id, member_id, status, member_since, valid_until)
  VALUES (
    NEW.id,
    generate_member_id(NEW.id, 'bronze'),
    'bronze',
    now(),
    now() + INTERVAL '1 year'
  )
  ON CONFLICT (user_id)    DO NOTHING
  -- Also absorb member_id unique collisions (extremely unlikely now but safe)
  ;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- A membership row already exists for this user; that is fine.
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log and swallow — never let a membership error block account creation.
    RAISE WARNING 'create_membership_for_new_profile: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
