-- 1. 중복된 RLS 정책 정리 및 성능 최적화 (InitPlan 활용)

-- captures 테이블 정리
DROP POLICY IF EXISTS "Captures are viewable by owner." ON public.captures;
DROP POLICY IF EXISTS "Users can view own captures" ON public.captures;
CREATE POLICY "Users can view own captures" ON public.captures
  FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own captures" ON public.captures;
DROP POLICY IF EXISTS "Users can insert own captures." ON public.captures;
CREATE POLICY "Users can insert own captures" ON public.captures
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- profiles 테이블 정리 (보안상 본인 프로필만 조회 가능하도록 통일)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = (select auth.uid())) 
  WITH CHECK (id = (select auth.uid()));

-- 2. 보안 취약점 수정 (Search Path 고정)
-- handle_new_user 함수에 search_path를 명시하여 보안 강화
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3. 성능 최적화 (외래 키 인덱스 추가)
CREATE INDEX IF NOT EXISTS idx_captures_user_id ON public.captures(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_country_code ON public.policies(country_code);
