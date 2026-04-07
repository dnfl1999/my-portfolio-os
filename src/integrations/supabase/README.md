# Supabase 준비 메모

현재 앱은 `localStorage` 저장소를 사용합니다. 이후 Supabase로 전환할 때는 아래 순서로 연결하면 됩니다.

1. `npm install @supabase/supabase-js`
2. `.env`에 `VITE_APP_DATA_PROVIDER=supabase` 설정
3. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 입력
4. `schema.sql`을 기준으로 테이블 생성
5. `src/repositories/supabasePortfolioRepository.ts`에 실제 CRUD 구현

권장 방식:
- 첫 단계는 포트폴리오 전체를 `payload jsonb` 한 건으로 저장
- 이후 필요하면 holdings / transactions / notes 테이블로 분리
