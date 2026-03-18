-- Migration 0008: Atomic quota check-and-increment RPC function
-- Replaces the non-atomic SELECT → check → UPSERT pattern in check-usage Edge Function.
-- Uses INSERT ... ON CONFLICT DO UPDATE WHERE to atomically increment only when under quota.

CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id    UUID,
  p_month      TEXT,
  p_action_type TEXT,  -- 'ml_calls' | 'camera_calls'
  p_limit      INTEGER -- -1 = unlimited
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_action_type = 'ml_calls' THEN
    IF p_limit = -1 THEN
      INSERT INTO usage (user_id, month, ml_calls, camera_calls, updated_at)
        VALUES (p_user_id, p_month, 1, 0, NOW())
        ON CONFLICT (user_id, month) DO UPDATE
          SET ml_calls = usage.ml_calls + 1, updated_at = NOW()
        RETURNING ml_calls INTO v_count;
    ELSE
      INSERT INTO usage (user_id, month, ml_calls, camera_calls, updated_at)
        VALUES (p_user_id, p_month, 1, 0, NOW())
        ON CONFLICT (user_id, month) DO UPDATE
          SET ml_calls = usage.ml_calls + 1, updated_at = NOW()
          WHERE usage.ml_calls < p_limit
        RETURNING ml_calls INTO v_count;
    END IF;
  ELSE
    IF p_limit = -1 THEN
      INSERT INTO usage (user_id, month, ml_calls, camera_calls, updated_at)
        VALUES (p_user_id, p_month, 0, 1, NOW())
        ON CONFLICT (user_id, month) DO UPDATE
          SET camera_calls = usage.camera_calls + 1, updated_at = NOW()
        RETURNING camera_calls INTO v_count;
    ELSE
      INSERT INTO usage (user_id, month, ml_calls, camera_calls, updated_at)
        VALUES (p_user_id, p_month, 0, 1, NOW())
        ON CONFLICT (user_id, month) DO UPDATE
          SET camera_calls = usage.camera_calls + 1, updated_at = NOW()
          WHERE usage.camera_calls < p_limit
        RETURNING camera_calls INTO v_count;
    END IF;
  END IF;

  -- INSERT or ON CONFLICT UPDATE succeeded → quota not exceeded
  IF v_count IS NOT NULL THEN
    RETURN jsonb_build_object('allowed', true, 'current', v_count);
  END IF;

  -- ON CONFLICT WHERE was false (quota exceeded) → fetch current count without incrementing
  SELECT (CASE WHEN p_action_type = 'ml_calls' THEN ml_calls ELSE camera_calls END)
    INTO v_count
    FROM usage
    WHERE user_id = p_user_id AND month = p_month;

  RETURN jsonb_build_object('allowed', false, 'current', COALESCE(v_count, p_limit));
END;
$$;
