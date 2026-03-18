-- Migration 0009: captures DELETE policy + webhook_events cleanup index

-- Allow users to delete their own captures
CREATE POLICY "Users can delete own captures"
  ON public.captures FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Index to support efficient TTL cleanup queries on webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON webhook_events(processed_at);

-- Recommended pg_cron job (run separately or via Supabase dashboard):
-- SELECT cron.schedule(
--   'cleanup-webhook-events',
--   '0 3 * * *',  -- daily at 03:00 UTC
--   $$DELETE FROM webhook_events WHERE processed_at < NOW() - INTERVAL '30 days'$$
-- );
