-- Migration 0011: app_settings RLS — SELECT 범위를 is_public=true 행으로 제한
--
-- 문제: 기존 정책 USING (true) 는 모든 인증 사용자가 app_settings 전체를 읽을 수 있음.
-- 현재는 공개 설정값만 있지만, 향후 관리자/비공개 설정 추가 시 자동 노출되는 위험.
-- 수정: is_public 컬럼 기반 행 필터링으로 범위 제한.

ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "app_settings readable by authenticated" ON public.app_settings;

CREATE POLICY "app_settings readable by authenticated"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- 검증:
-- INSERT INTO app_settings (key, value, is_public) VALUES ('test_secret', '{"x":1}', false);
-- SELECT * FROM app_settings WHERE key = 'test_secret';
-- → 인증 사용자로 실행 시 0 rows 반환되어야 함
