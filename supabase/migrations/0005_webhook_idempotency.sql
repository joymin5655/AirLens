-- Migration 0005: Webhook idempotency table
-- Prevents duplicate processing of Polar webhook events (replay attack mitigation)

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,              -- Polar webhook-id header (unique per delivery)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can access this table; no user-level RLS needed
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT policy for authenticated users — service role bypasses RLS
-- This table is only accessed from polar-webhook Edge Function (service role key)
