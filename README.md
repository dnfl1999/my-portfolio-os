# My Portfolio OS

개인 투자 포트폴리오를 로컬에서 직접 관리할 수 있는 React + Vite 기반 웹앱입니다.  
첫 버전은 로그인 없이 동작하며, 기본 저장소는 브라우저 `localStorage`입니다.

이 프로젝트는 "엑셀을 대체할 수 있는 개인 투자 대시보드"를 목표로 만들었고, 이후 Supabase로 확장할 수 있도록 저장소 레이어를 분리해 두었습니다.

## 주요 기능

- 대시보드
  - 총 투자원금
  - 총 평가금액
  - 총 손익
  - 총 수익률
  - 현금 비중
  - 자산별 비중
  - 최근 거래내역 5개
- 보유종목 관리
  - 종목명, 티커, 자산유형, 보유수량, 평균단가, 현재가
  - 평가금액, 평가손익, 수익률 자동 계산
  - 목표가, 손절가, 투자 메모 관리
- 거래내역 관리
  - 매수 / 매도 / 입금 / 출금 / 배당
  - 거래 입력 시 보유수량과 평균단가 자동 반영
- 투자노트
  - 왜 샀는지
  - 추가매수 조건
  - 매도 조건
  - 리스크 요인
  - 복기 메모
- 데이터 관리
  - 빈 포트폴리오에서 직접 입력
  - JSON 내보내기 / 가져오기
  - 전체 초기화
- 가격 서비스 분리
  - mock provider / API provider 분리
  - 15초 / 30초 / 60초 자동 갱신
  - 마지막 업데이트 시각 / 오류 / 재시도 표시

## 기술 스택

- React
- Vite
- TypeScript
- localStorage
- Supabase-ready repository layer
- Supabase Realtime sync

## 화면 구성

- 대시보드
- 보유종목
- 거래내역
- 투자노트
- 설정

모바일에서는 하단 탭, 데스크톱에서는 좌측 사이드바로 이동할 수 있습니다.

## 폴더 구조

```text
.
├─ src
│  ├─ components
│  │  ├─ charts
│  │  ├─ common
│  │  ├─ forms
│  │  └─ layout
│  ├─ config
│  ├─ data
│  ├─ hooks
│  ├─ integrations
│  │  └─ supabase
│  ├─ pages
│  ├─ repositories
│  ├─ services
│  ├─ styles
│  ├─ types
│  ├─ utils
│  ├─ App.tsx
│  └─ main.tsx
├─ .env.example
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
└─ vite.config.ts
```

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

PowerShell 정책 때문에 `npm`이 막혀 있으면:

```bash
npm.cmd install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

또는:

```bash
npm.cmd run dev
```

### 3. 프로덕션 빌드

```bash
npm run build
```

### 4. Supabase 저장 왕복 검증

Supabase 모드에서 실제 저장과 재조회, 원복까지 확인하려면:

```bash
npm run verify:supabase
```

## PWA 설치

이 프로젝트는 PWA로 설치할 수 있도록 설정되어 있습니다.

- iPhone
  - Safari에서 앱 주소 접속
  - 공유 버튼 선택
  - `홈 화면에 추가` 선택
- Android
  - Chrome에서 앱 주소 접속
  - `앱 설치` 또는 `홈 화면에 추가` 선택

프로덕션 빌드 후 설치 여부를 확인하려면:

```bash
npm run build
npm run preview
```

## 데이터 저장 구조

앱은 저장소 레이어를 인터페이스 기반으로 분리해 두었습니다.

- 저장소 인터페이스: `src/repositories/portfolioRepository.ts`
- 로컬 구현체: `src/repositories/localPortfolioRepository.ts`
- Supabase 구현체: `src/repositories/supabasePortfolioRepository.ts`
- 저장소 선택 로직: `src/config/dataSource.ts`

기본값은 `localStorage`이며, 환경 변수로 Supabase 저장소를 선택할 수 있습니다.

## 환경 변수

예시는 [`.env.example`](./.env.example) 에 들어 있습니다.

```bash
VITE_APP_DATA_PROVIDER=local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MARKET_DATA_PROVIDER=mock
VITE_MARKET_DATA_API_BASE_URL=
```

### 데이터 소스 선택

- `VITE_APP_DATA_PROVIDER=local`
  - 기본값
  - 브라우저 `localStorage` 사용
- `VITE_APP_DATA_PROVIDER=supabase`
  - Supabase 저장소 사용 시도
  - 환경 변수가 없으면 자동으로 localStorage로 fallback

### 현재가 provider 선택

- `VITE_MARKET_DATA_PROVIDER=mock`
  - 기본값
  - 외부 API 없이 가짜 시세로 자동 갱신 흐름을 검증
- `VITE_MARKET_DATA_PROVIDER=api`
  - 프론트는 `/api/prices`만 호출
  - 실제 비밀키는 서버리스 또는 별도 백엔드에서만 사용
- `VITE_MARKET_DATA_API_BASE_URL=https://your-serverless-host`
  - GitHub Pages처럼 정적 호스팅일 때 API 서버의 베이스 URL 지정
  - 비워두면 same-origin `/api/prices` 호출

예시:

```bash
VITE_MARKET_DATA_PROVIDER=api
VITE_MARKET_DATA_API_BASE_URL=https://my-portfolio-os-prices.vercel.app
```

## Supabase 연결 방법

현재 프로젝트는 Supabase "준비용"이 아니라, 실제 CRUD가 가능한 기본 구현까지 포함하고 있습니다.

### 1. 패키지 설치

```bash
npm install @supabase/supabase-js
```

이미 이 저장소에는 반영되어 있습니다.

### 2. 환경 변수 설정

`.env` 파일을 만들고 아래 값을 입력합니다.

```bash
VITE_APP_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 테이블 생성

[`src/integrations/supabase/schema.sql`](./src/integrations/supabase/schema.sql) 내용을 Supabase SQL Editor에서 실행합니다.

현재 구현은 `portfolio_snapshots` 테이블의 `portfolio_key = 'default'` 행 1개를 사용해 전체 포트폴리오를 `jsonb`로 저장합니다.

Realtime 자동 동기화를 쓰려면 `schema.sql`의 publication 설정까지 함께 적용해야 합니다.

### 4. 동작 방식

- `load()`
  - `portfolio_key = 'default'` 행을 조회
  - 데이터가 없으면 빈 포트폴리오 반환
- `save()`
  - 동일 key에 대해 upsert
- `clear()`
  - 동일 key 행 삭제

## 실시간 동기화

Supabase 모드에서는 `portfolio_snapshots`의 `default` 행 변경을 구독합니다.

- 노트북에서 수정 후 저장
- 모바일에서 같은 포트폴리오를 열고 있는 경우
- 새로고침 없이도 최신 데이터가 자동 반영됩니다

### 관련 파일

- Supabase 클라이언트: [`src/integrations/supabase/client.ts`](./src/integrations/supabase/client.ts)
- Supabase 저장소: [`src/repositories/supabasePortfolioRepository.ts`](./src/repositories/supabasePortfolioRepository.ts)
- 스키마: [`src/integrations/supabase/schema.sql`](./src/integrations/supabase/schema.sql)
- 메모: [`src/integrations/supabase/README.md`](./src/integrations/supabase/README.md)

## 계산 로직

- 평가손익 = `(현재가 - 평균단가) x 보유수량`
- 수익률 자동 계산
- 전체 자산 비중 자동 계산
- 거래 입력 시 평균단가 자동 반영
- 매도 시 보유수량 차감

핵심 계산 파일:

- `src/utils/calculations.ts`

## 실시간 가격 반영

현재가는 `mock` / `api` provider 인터페이스로 분리되어 있습니다.

- 서비스 레이어: `src/services/marketDataService.ts`
- 자동 갱신 훅: `src/hooks/useLivePrices.ts`
- 마지막 업데이트 표시: `src/components/LastUpdatedBadge.tsx`
- 서버리스 예시: `api/prices.ts`

동작 방식:

- 보유 종목에서 `Cash`, `Deposit`을 제외한 티커만 추출
- 기본 30초마다 `/api/prices` 일괄 호출
- 응답 받은 현재가를 holdings에 반영
- 평가금액, 총손익, 수익률, 자산 비중을 즉시 재계산
- 마지막 업데이트 시각과 오류 상태를 UI에 표시

### GitHub Pages에서 실제 가격 API 쓰기

GitHub Pages는 정적 호스팅이므로 비밀키를 안전하게 보관할 서버 코드가 없습니다.
그래서 운영 환경에서는 아래처럼 분리해야 합니다.

1. GitHub Pages에는 프론트만 배포
2. 별도 서버리스 또는 백엔드에 `/api/prices` 구현
3. 서버에서 외부 가격 API 키를 사용
4. 프론트는 `VITE_MARKET_DATA_API_BASE_URL`을 통해 그 서버의 `/api/prices`를 호출

`api/prices.ts`는 Vercel 서버리스 함수 기준으로 정리되어 있고, 실제 upstream API 키는 환경 변수로만 읽습니다.

### Vercel 서버리스 배포 절차

1. 이 저장소를 Vercel에 import
2. 프로젝트 Root는 저장소 루트 그대로 사용
3. `api/prices.ts`를 함수 엔드포인트로 배포
4. 필요하면 프론트 정적 출력은 무시하고 API 용도로만 사용
5. Vercel 프로젝트 Settings -> Environment Variables에 아래 값 입력
6. 배포 완료 후 엔드포인트 URL 확보
7. GitHub Pages 프론트의 `VITE_MARKET_DATA_API_BASE_URL`에 그 URL 입력

이 저장소에는 [`vercel.json`](./vercel.json) 이 포함되어 있고, `api/*.ts` 함수에 `maxDuration` 설정을 적용합니다.

### Vercel 환경 변수

필수:

- `PRICE_UPSTREAM_URL`
  - 외부 시세 공급자 base URL
- `PRICE_API_KEY`
  - 외부 시세 API 키

선택:

- `PRICE_UPSTREAM_PATH`
  - 기본값 `/quotes`
- `PRICE_UPSTREAM_SYMBOLS_PARAM`
  - 기본값 `symbols`
- `PRICE_API_KEY_HEADER`
  - 기본값 `Authorization`
- `PRICE_API_KEY_PREFIX`
  - 기본값 `Bearer`
- `MARKET_DATA_ALLOWED_ORIGIN`
  - 기본값 `*`
  - 운영 시에는 `https://dnfl1999.github.io` 또는 실제 GitHub Pages origin으로 제한 권장
- `PRICE_PROVIDER_MODE`
  - `example`로 두면 외부 API 없이 예시 응답 반환

### Upstream 응답 매핑

Vercel 함수는 [`api/_lib/marketDataMapper.ts`](./api/_lib/marketDataMapper.ts) 에서 외부 공급자 응답을 앱 포맷으로 변환합니다.

현재 자동 매핑 가능한 대표 필드:

- 티커: `ticker`, `symbol`, `code`
- 가격: `price`, `last`, `close`, `regularMarketPrice`, `lastPrice`
- 시각: `updatedAt`, `lastUpdatedAt`, `timestamp`, `time`, `regularMarketTime`
- 통화: `currency`

즉 아래처럼 들어와도 앱 응답으로 바뀝니다.

```json
{
  "quotes": [
    { "symbol": "TLRY", "regularMarketPrice": 1.82, "currency": "USD" },
    { "symbol": "PFE", "regularMarketPrice": 27.46, "currency": "USD" },
    { "symbol": "NVTS", "regularMarketPrice": 3.11, "currency": "USD" }
  ]
}
```

변환 후 앱 응답 예시는 [`docs/EXAMPLE_VERCEL_PRICES_RESPONSE.json`](./docs/EXAMPLE_VERCEL_PRICES_RESPONSE.json) 에 들어 있습니다.

### 테스트 방법

1. Vercel에서 `PRICE_PROVIDER_MODE=example` 설정
2. 배포 후 아래 요청 실행

```bash
curl -X POST "https://your-vercel-project.vercel.app/api/prices" ^
  -H "Content-Type: application/json" ^
  -d "{\"tickers\":[\"TLRY\",\"PFE\",\"NVTS\"]}"
```

3. 응답에 `TLRY`, `PFE`, `NVTS` 가격이 들어오는지 확인
4. 그다음 `PRICE_PROVIDER_MODE`를 제거하고 실제 `PRICE_UPSTREAM_URL`, `PRICE_API_KEY`를 넣어 재배포
5. 프론트 `.env`에서 `VITE_MARKET_DATA_PROVIDER=api` 와 `VITE_MARKET_DATA_API_BASE_URL` 설정
6. 앱 설정 페이지에서 자동 갱신 ON 상태로 확인

### 프론트에서 `api` provider 사용하기

```bash
VITE_MARKET_DATA_PROVIDER=api
VITE_MARKET_DATA_API_BASE_URL=https://your-vercel-project.vercel.app
```

이후 프론트는 `POST https://your-vercel-project.vercel.app/api/prices` 만 호출합니다.

### Supabase 가격 캐시 확장

현재 포트폴리오 payload에는 `marketData` 필드가 포함됩니다.

- `settings`
- `lastUpdatedAt`
- `lastAttemptAt`
- `lastError`
- `priceCache`

이 구조 덕분에 나중에 `persistPriceCache`를 켜거나, Supabase에서 마지막 가격 캐시를 별도 처리하는 방향으로 확장할 수 있습니다.

## 향후 추천 확장

- Supabase Auth 추가
- 포트폴리오별 다중 계정 지원
- 자산/거래/노트 테이블 정규화
- 현재가 자동 동기화
- 달러/원화 환율 반영
- 배당 캘린더 / 리밸런싱 알림

## 참고

- 첫 실행 시 빈 포트폴리오 상태로 시작합니다.
- JSON 내보내기로 전체 백업이 가능합니다.
- JSON 가져오기로 기존 데이터를 복원할 수 있습니다.
