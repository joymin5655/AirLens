-- Migration 00000: 기반 스키마 초기화 (로컬 개발 전용)
--
-- 프로덕션 Supabase에서는 이 테이블들이 Dashboard에서 수동 생성되었음.
-- 로컬 스택에는 초기 스키마가 없으므로 여기서 일괄 생성.
-- 이후 migration(0000~)이 이 테이블들을 참조함.

-- ============================================================
-- profiles 테이블 (Supabase Auth와 연동)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  full_name   text,
  avatar_url  text,
  plan        text NOT NULL DEFAULT 'Free',
  role        text NOT NULL DEFAULT 'user',
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- handle_new_user: auth.users INSERT 시 profiles 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- countries 테이블 (정책 분석용)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.countries (
  code        text PRIMARY KEY,       -- ISO 3166-1 alpha-2 (예: 'KR')
  name        text NOT NULL,
  region      text,
  flag        text,                   -- 이모지 플래그
  coordinates jsonb,                  -- {"lat": 37.5, "lon": 127.0}
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countries readable by authenticated"
  ON public.countries FOR SELECT TO authenticated USING (true);

-- ============================================================
-- policies 테이블 (국가별 대기질 정책)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.policies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code        text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  name                text NOT NULL,
  implementation_date date,
  type                text,
  url                 text,
  description         text,
  target_pollutants   text[],
  measures            text[],
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policies readable by authenticated"
  ON public.policies FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_policies_country_code ON public.policies(country_code);

-- ============================================================
-- captures 테이블 (0002 migration이 DROP POLICY를 참조하므로 미리 생성)
-- 0003 migration에서 CREATE TABLE IF NOT EXISTS로 중복 없이 재사용됨
-- ============================================================
CREATE TABLE IF NOT EXISTS public.captures (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  pm25_est      numeric,
  aqi_class     text,
  confidence    numeric,
  location_lat  numeric,
  location_lon  numeric,
  city_name     text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;
