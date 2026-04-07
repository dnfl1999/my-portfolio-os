# My Portfolio OS

개인 투자 포트폴리오를 로컬에서 직접 관리할 수 있는 React + Vite 기반 웹앱입니다. 첫 버전은 로그인 없이 동작하고, 데이터는 기본적으로 브라우저 `localStorage`에 저장됩니다.

## 주요 기능

- 대시보드: 총 투자원금, 총 평가금액, 총 손익, 총 수익률, 현금 비중, 자산 비중, 최근 거래내역
- 보유종목 관리: 자산유형별 포지션 관리, 목표가/손절가/메모 기록, 더미 현재가 업데이트
- 거래내역 관리: 매수/매도/입금/출금/배당 입력, 보유수량과 평균단가 자동 반영
- 투자노트: 종목별 매수 이유, 추가매수 조건, 매도 조건, 리스크, 복기 메모 저장
- 자산 비중 관리: 목표 비중 대비 과대/과소 확인
- 데이터 관리: 샘플 데이터 제공, JSON 가져오기/내보내기, 전체 초기화

## 폴더 구조

```text
.
├─ src
│  ├─ components
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

## 실행 방법

1. 의존성 설치

```bash
npm install
```

PowerShell 실행 정책으로 `npm`이 막혀 있다면 아래처럼 실행하면 됩니다.

```bash
npm.cmd install
```

2. 개발 서버 실행

```bash
npm run dev
```

또는

```bash
npm.cmd run dev
```

3. 브라우저에서 Vite가 출력한 로컬 주소를 열어 사용합니다.

## 데이터 저장 구조

- 현재 기본 저장소: `localStorage`
- 저장소 인터페이스: `src/repositories/portfolioRepository.ts`
- 로컬 구현체: `src/repositories/localPortfolioRepository.ts`
- Supabase 준비용 구현체: `src/repositories/supabasePortfolioRepository.ts`
- 데이터 소스 선택: `src/config/dataSource.ts`
- Supabase 환경 설정 확인: `src/integrations/supabase/client.ts`

## Supabase 전환 준비

앱은 이미 저장소 계층이 분리되어 있어 이후 Supabase 연결 시 UI를 거의 건드리지 않고 데이터 계층만 교체하면 됩니다.

1. `.env` 파일 생성 후 아래 값 입력

```bash
VITE_APP_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. 패키지 설치

```bash
npm install @supabase/supabase-js
```

3. `src/integrations/supabase/schema.sql` 기준으로 테이블 생성
4. `src/repositories/supabasePortfolioRepository.ts`에 실제 CRUD 구현

기본 제공 파일:
- `src/integrations/supabase/README.md`
- `src/integrations/supabase/schema.sql`
- `.env.example`

## 참고

- 첫 실행 시 샘플 데이터가 자동으로 표시됩니다.
- JSON 내보내기로 전체 백업이 가능합니다.
- JSON 가져오기로 기존 데이터를 복원할 수 있습니다.
