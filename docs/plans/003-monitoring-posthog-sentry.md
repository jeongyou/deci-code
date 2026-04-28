# 003 — Posthog + Sentry 모니터링 추가

> 상태: 검토 중

## 목적

서비스 방문자 수, 게임 플레이 횟수, 오류 발생을 추적해 운영 현황을 파악한다.

## 범위

- **Posthog**: 클라이언트 전용 (방문자, 이벤트)
- **Sentry**: 클라이언트 + 서버 (오류 추적)

## 사전 준비 (직접 해야 함)

| 서비스 | 할 일 | 얻는 것 |
|--------|-------|---------|
| [posthog.com](https://posthog.com) | 회원가입 → 프로젝트 생성 | `VITE_POSTHOG_KEY` (API Key) |
| [sentry.io](https://sentry.io) | 회원가입 → React 프로젝트 생성 | `VITE_SENTRY_DSN` |
| sentry.io | Node.js 프로젝트 생성 | `SENTRY_DSN` (서버용) |

환경변수 추가 위치:
- **Vercel**: `VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN`
- **Render**: `SENTRY_DSN`
- **로컬**: `client/.env.local`, `server/.env`

## 추적할 이벤트 (Posthog)

| 이벤트명 | 발생 시점 |
|---------|---------|
| `game_started` | 게임 시작 시 |
| `game_ended` | 게임 종료 시 (승자 여부 포함) |
| `guess_correct` | 추리 정답 시 |
| `guess_wrong` | 추리 오답 시 |
| `room_created` | 방 생성 시 |
| `room_joined` | 방 입장 시 |

페이지뷰(로비, 게임)는 Posthog이 자동으로 잡음.

## 작업 목록

### 1. 클라이언트 — Posthog
- `client/`에 `posthog-js` 설치
- `client/src/main.tsx`에 `PostHog.init()` 추가 (`VITE_POSTHOG_KEY` 환경변수 사용)
- `client/src/App.tsx`에 게임 이벤트 `posthog.capture()` 추가

### 2. 클라이언트 — Sentry
- `@sentry/react` 설치
- `client/src/main.tsx`에 `Sentry.init()` 추가 (`VITE_SENTRY_DSN`)
- React ErrorBoundary를 Sentry로 감싸기

### 3. 서버 — Sentry
- `@sentry/node` 설치
- `server/src/index.ts` 상단에 `Sentry.init()` 추가 (`SENTRY_DSN`)
- Express 에러 핸들러에 Sentry 연결

## 파일 변경 범위

- `client/src/main.tsx` — Posthog + Sentry 초기화
- `client/src/App.tsx` — 이벤트 캡처 추가
- `server/src/index.ts` — Sentry 초기화 + 에러 핸들러
- `client/package.json` — 패키지 추가
- `server/package.json` — 패키지 추가

## 환경변수 없을 때 동작

키가 없으면 init을 건너뛰도록 처리 → 로컬 개발 환경에서 오류 없이 동작.
