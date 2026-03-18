-- Create captures table if it does not already exist
CREATE TABLE IF NOT EXISTS public.captures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  pm25_est    numeric,
  aqi_class   text,
  confidence  numeric,
  location_lat  numeric,
  location_lon  numeric,
  city_name   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;

-- Create app_settings table if it does not already exist
CREATE TABLE IF NOT EXISTS public.app_settings (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- app_settings is read-only for authenticated users; only service role can write
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings readable by authenticated"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);
