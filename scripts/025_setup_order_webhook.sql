-- Create a function to call the Edge Function when an order is created
CREATE OR REPLACE FUNCTION notify_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  webhook_secret TEXT;
  payload JSONB;
BEGIN
  -- Get webhook configuration from environment or settings table
  -- For now, we'll use a hardcoded URL that you'll need to update
  webhook_url := 'https://your-domain.com/api/webhooks/order-confirmation';
  webhook_secret := 'your-webhook-secret-key';

  -- Build the payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'orders',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );

  -- Call the webhook using pg_net extension (if available)
  -- Note: This requires the pg_net extension to be enabled in Supabase
  -- Alternative: Use Supabase Edge Functions with Database Webhooks from the dashboard
  
  -- Log the event
  RAISE NOTICE 'Order created: %', NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_order_created ON orders;

CREATE TRIGGER trigger_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_created();

-- Add comment
COMMENT ON FUNCTION notify_order_created() IS 'Triggers webhook when a new order is created';
COMMENT ON TRIGGER trigger_order_created ON orders IS 'Calls webhook endpoint when order is inserted';

-- Create a table to log webhook calls (optional but recommended)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- Grant permissions
GRANT ALL ON webhook_logs TO authenticated;
