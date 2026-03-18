# AirLens-web TODO

## 기능 개선
- [ ] GlobeView DQSS overlay 버튼 — 실제 구현 (models의 `/api/data-quality` 연결)
- [ ] Analytics 지역 스코어 — `VITE_REGION_SCORES` env 대신 Supabase 테이블로 관리
- [ ] Polar Pro 플랜 checkout URL 추가 (현재 Plus만 구현)

## AirLens-models 미완성 (Plan 4)
- [ ] `detect_with_uncertainty()` — Anomaly Detection 불확실성 구간 반환
- [ ] `predict_cities_async()` — 도시 배치 비동기 예측
- [ ] 예측 결과 캐싱 (Redis 또는 파일 기반)
- [ ] 추가 테스트 (Plan #042-049)

## 인프라
- [ ] migration 0010 pg_cron 활성화 확인 (Supabase Dashboard → Database → Extensions)
      → SQL Editor: `SELECT extname FROM pg_extension WHERE extname = 'pg_cron';`
- [ ] Polar webhook Secrets 확인 (Dashboard → Edge Functions → polar-webhook → Secrets)
      → POLAR_PRODUCT_ID_PLUS, POLAR_PRODUCT_ID_PRO 설정 여부
- [x] app_settings RLS SELECT 범위 제한 (migration 0011) — is_public=true 행만 노출
- [ ] captures UPDATE 정책 없음 — 의도된 설계 (읽기/업로드/삭제만 허용). 수정 기능 추가 시 정책 필요
