-- Migration 0006: Usage tracking for plan quota enforcement

CREATE TABLE IF NOT EXISTS usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,              -- 'YYYY-MM' format, e.g. '2026-03'
  ml_calls INTEGER DEFAULT 0,       -- AOD/predict-grid API calls
  camera_calls INTEGER DEFAULT 0,   -- Camera AI calls
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage
CREATE POLICY "users_own_usage_select"
  ON usage FOR SELECT
  USING (user_id = auth.uid());

-- Inserts and updates are performed by the check-usage Edge Function
-- using the service role key, which bypasses RLS.

-- Index for fast per-user-per-month lookups
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage(user_id, month);
