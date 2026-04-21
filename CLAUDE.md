# Da Vinci Code — Claude 가이드

## 프로젝트 구조

```
davinci-code/
  client/   ← Vite + React + TypeScript + Tailwind + socket.io-client (pnpm)
  server/   ← Node.js + Express + Socket.io + TypeScript (pnpm)
```

## 서버 실행

```bash
cd server && pnpm dev   # port 3001
cd client && pnpm dev   # port 5173
```

## 기능 추가 사이클

기능 하나를 붙일 때마다 이 순서로 진행한다.

### 1. PLAN
뭘 만들지 한 문장으로 정의한다.
> "어떤 문제를 풀기 위해 무엇을 만드는가"

### 2. SCOPE
건드릴 파일을 미리 나열한다.
- 서버 / 클라이언트 / 양쪽?
- 새 파일 필요? 기존 파일 수정?
- 소켓 이벤트 추가되면 `server/src/types.ts`와 `client/src/types/index.ts` 양쪽 확인

### 3. BUILD
서버 → 클라이언트 순서로 구현한다. 소켓 이벤트 인터페이스를 먼저 확정한 뒤 양쪽 맞춘다.

### 4. TEST
브라우저에서 직접 확인한다.
- Golden path (정상 흐름)
- Edge case (빠른 클릭, 연속 액션, 혼자 접속 등)
- 빌드 에러 없는지: `cd client && pnpm build`

### 5. COMMIT
의미 있는 단위로 커밋한다. `feat` / `fix` / `chore` 접두사 + 한 줄 요약.
커밋 전 민감 파일(`.env`, `settings.local.json`) 포함 여부 반드시 확인.

### 6. LOG
DEVLOG.md에 작업 내용 추가 후 커밋한다.

## 규칙

- 소켓 이벤트명은 `snake_case` (예: `game_started`, `tile_drawn`)
- 타입은 반드시 `import type`으로 임포트
- 커밋 전 `pnpm build` 통과 확인
- `.claude/settings.local.json` 은 절대 커밋하지 않는다
