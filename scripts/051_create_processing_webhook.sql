-- Create webhook for order status changes to "processing"
-- This webhook triggers when an order's status changes from "pending" to "processing"

-- Note: You need to manually create this webhook in the Supabase dashboard:
-- 1. Go to Database > Webhooks
-- 2. Click "Create a new hook"
-- 3. Name: order_processing_notification
-- 4. Table: orders
-- 5. Events: UPDATE
-- 6. HTTP Request:
--    - Method: POST
--    - URL: https://your-domain.com/api/webhooks/order-processing
--    - HTTP Headers: x-webhook-signature: your-webhook-secret-key
-- 7. Save the webhook

-- The webhook will be triggered when:
-- - An order's status changes from "pending" to "processing"
-- - The webhook route will verify the status change and send the email

-- Example payload structure:
-- {
--   "type": "UPDATE",
--   "table": "orders",
--   "record": { "id": "...", "status": "processing", ... },
--   "old_record": { "id": "...", "status": "pending", ... }
-- }
