-- Migration 0010: webhook_events automatic TTL cleanup via pg_cron
--
-- Requires the pg_cron extension (available on Supabase Pro and above).
-- Enable via: Supabase Dashboard → Database → Extensions → pg_cron
--
-- The cron job deletes webhook_events rows older than 30 days, running
-- daily at 03:00 UTC to keep the table from growing without bound.
-- The index created in migration 0009 makes this deletion efficient.

-- Enable pg_cron (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant cron schema usage to postgres role (required by Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Remove existing job if it exists (idempotent re-run)
SELECT cron.unschedule('cleanup-webhook-events')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-webhook-events'
);

-- Schedule daily cleanup at 03:00 UTC
-- Deletes events processed more than 30 days ago
SELECT cron.schedule(
  'cleanup-webhook-events',
  '0 3 * * *',
  $$DELETE FROM webhook_events WHERE processed_at < NOW() - INTERVAL '30 days'$$
);
