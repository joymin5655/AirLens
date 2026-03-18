-- image_url nullable (기존 레코드 유지, 신규 INSERT는 NULL 가능)
ALTER TABLE public.captures ALTER COLUMN image_url DROP NOT NULL;

-- 중복 방지용 해시 컬럼 추가
ALTER TABLE public.captures ADD COLUMN IF NOT EXISTS image_hash TEXT;

-- 같은 사용자가 같은 이미지를 두 번 저장하지 못하도록
CREATE UNIQUE INDEX IF NOT EXISTS idx_captures_user_image_hash
  ON public.captures(user_id, image_hash)
  WHERE image_hash IS NOT NULL;
