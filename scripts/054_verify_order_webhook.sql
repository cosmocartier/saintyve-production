-- Verify and ensure the order confirmation webhook is properly set up

-- 1. Check if the webhook already exists in Supabase
-- You need to run this manually in the Supabase SQL Editor to verify

-- To create the webhook in Supabase Dashboard:
-- 1. Go to Database > Webhooks in your Supabase dashboard
-- 2. Click "Create a new hook"
-- 3. Fill in the following:
--    - Name: order-confirmation
--    - Table: orders
--    - Events: INSERT
--    - Type: HTTP Request
--    - Method: POST
--    - URL: https://your-domain.vercel.app/api/webhooks/order-confirmation
--    - HTTP Headers: 
--      {
--        "Content-Type": "application/json",
--        "x-webhook-signature": "your-webhook-secret-from-env"
--      }
-- 4. Click "Create hook"

-- Verify webhook_logs table has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'webhook_logs'
ORDER BY ordinal_position;

-- Check recent webhook logs to see if any are being recorded
SELECT 
  id,
  event_type,
  table_name,
  record_id,
  status,
  error_message,
  created_at,
  processed_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;

-- Find orders that should have triggered webhooks but might not have
SELECT 
  o.id,
  o.customer_email,
  o.created_at,
  o.total,
  o.status,
  wl.id as webhook_log_id,
  wl.status as webhook_status,
  wl.error_message
FROM orders o
LEFT JOIN webhook_logs wl ON wl.record_id = o.id AND wl.table_name = 'orders'
WHERE o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;
