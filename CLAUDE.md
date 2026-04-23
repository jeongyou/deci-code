# Da Vinci Code — AI Agent Guide

이 문서는 어떤 AI 도구를 사용해도 같은 맥락으로 작업을 이어갈 수 있게 만든 공통 가이드다.
`AGENTS.md`와 `CLAUDE.md`는 항상 같은 내용으로 유지한다. 한쪽을 수정하면 다른 한쪽도 같은 변경을 반영한다.

상세 구조는 `ARCHITECTURE.md`, 작업 기록은 `DEVLOG.md`를 함께 참고한다.

## Project Snapshot

- 보드게임 "다빈치 코드" 실시간 웹 구현체.
- `client/`: Vite + React + TypeScript + Tailwind CSS + socket.io-client.
- `server/`: Express + Socket.io + TypeScript. REST API 없음.
- 패키지 매니저는 client/server 모두 `pnpm`.
- 서버 포트는 기본 `3001`, 클라이언트 dev 서버는 기본 `5173`.
- 배포는 완료된 상태다: client는 Vercel, server는 Render.
- Client: https://davinci-code-beta.vercel.app
- Server: https://davinci-code-9kcw.onrender.com

## Commands

```bash
./check.sh
```

전체 검증: 서버 vitest → 서버 빌드 → 클라이언트 빌드.

```bash
./check.sh --watch
```

서버 vitest watch 모드.

```bash
cd server && pnpm dev
cd client && pnpm dev
```

로컬 개발 서버 실행. 현재 `client/package.json`의 `dev`는 `vite --host`로 바뀌어 있다.

## Deployment

- Server: Render. `render.yaml`은 서버 서비스 설정을 담고 있다.
- Client: Vercel.
- 클라이언트는 `VITE_SERVER_URL`이 있으면 그 URL로 Socket.io 연결하고, 없으면 `http://localhost:3001`을 사용한다.
- Vercel의 `VITE_SERVER_URL`은 Render 서버 URL이어야 한다.
- 배포 관련 설정이나 URL이 바뀌면 `AGENTS.md`, `CLAUDE.md`, `DEVLOG.md`를 같이 갱신한다.
- Vercel 환경 변수: `VITE_SERVER_URL=https://davinci-code-9kcw.onrender.com`

## Current State

- 핵심 게임 로직은 구현되어 있고 `server/src/__tests__/gameLogic.test.ts`에 42개 테스트가 있다.
- 2026-04-22 기준 규칙 문서 기반으로 게임 룰이 크게 정리되었다.
- 조커는 `isJoker` 플래그가 아니라 `color: 'joker'`, `number: null`로 표현한다.
- 서버에는 `room.phase: 'draw' | 'insert' | 'guess' | 'end'`가 있고, 소켓 핸들러에서 phase를 검증한다.
- 클라이언트 GamePage의 화면 phase는 서버 상태와 로컬 플래그를 조합해 파생한다.
- 랜덤 매칭은 현재 2명 단위 매칭이다.
- 방 생성 시 추리 제한시간은 30초 또는 60초로 설정한다.
- 뽑은 숫자 타일은 즉시 내 패에 삽입되고, 조커/숫자 구분은 상대에게 노출되지 않도록 마스킹한다.
- finished 상태에서는 `restart_game`으로 같은 방을 waiting 상태로 초기화해 연속 플레이할 수 있다.
- 서버 방 상태는 메모리 기반이다. Render 재시작/슬립/스케일링 시 방 상태가 유지되지 않는다.
- `client/README.md`는 아직 Vite 기본 템플릿 문서다.
- 서버 턴 타임아웃은 구현 완료 (`scheduleTurnTimer` / `clearTurnTimer`).

## Next Work

1. 프로젝트 README 정리.
   - 루트 README 또는 `client/README.md`를 실제 프로젝트 설명으로 교체한다.
   - 로컬 실행, 테스트, 배포 주소, 주요 규칙을 추가한다.
2. 운영 보강.
   - 방/플레이어 disconnect 처리 UX 개선.
   - 랜덤 매칭 취소 기능.
   - 서버 메모리 기반 방 상태의 한계를 명시하거나 persistence 도입 여부를 결정한다.

## Important Files

- `server/src/index.ts`: Socket.io 이벤트 핸들러, 방 Map, 랜덤 대기열.
- `server/src/gameLogic.ts`: 순수 게임 로직.
- `server/src/types.ts`: 서버 타입과 소켓 이벤트 타입.
- `server/src/__tests__/gameLogic.test.ts`: 게임 로직 테스트.
- `client/src/App.tsx`: 전역 상태, 소켓 이벤트 수신, page 라우팅.
- `client/src/hooks/useSocket.ts`: Socket.io 연결 및 emit wrapper.
- `client/src/types/index.ts`: 클라이언트 타입.
- `client/src/pages/GamePage.tsx`: 게임 화면 조합과 phase 계산.
- `client/src/pages/game/*`: 게임 화면 서브컴포넌트.
- `ARCHITECTURE.md`: 파일 구조, 이벤트, phase 흐름, 디자인 시스템.
- `DEVLOG.md`: 작업 기록과 다음 작업.
- `check.sh`: 검증 하네스.

## Socket Events

이벤트명은 `snake_case`를 유지한다.

Client → Server:

- `join_room(roomId, nickname)`
- `join_random(nickname)`
- `set_ready()`
- `draw_tile()`
- `place_joker(position)`
- `guess_tile(targetPlayerId, tileId, guessedColor, guessedNumber | null)`
- `skip_guess()`
- `reveal_own_tile(tileId)`

Server → Client:

- `room_joined(room, playerId)`
- `room_updated(room)`
- `game_started(room)`
- `tile_drawn(tile)`
- `must_place_joker()`
- `guess_result(correct, tile)`
- `must_reveal_tile()`
- `game_over(winnerId, winnerNickname)`
- `waiting_for_match()`
- `error(message)`

소켓 이벤트를 추가/변경하면 server/client 타입 양쪽과 `ARCHITECTURE.md`를 함께 업데이트한다.

## Game Rules Notes

- 덱: 검정 0~11, 흰색 0~11, 조커 2장 총 26장.
- 초기 배분: 2~3명은 4장, 4명은 3장.
- 숫자 타일 정렬: 숫자 오름차순, 같은 숫자는 검정이 흰색보다 앞.
- 조커는 자유 위치 삽입이다.
- 추리는 색상과 숫자를 모두 맞혀야 한다. 조커 추리는 숫자 없이 `color === 'joker'`.
- 정답이면 대상 타일이 공개되고 계속 추리할 수 있다.
- 오답이면 이번 턴에 뽑은 타일이 공개되어 내 패에 들어가고 턴이 넘어간다.
- 덱이 비어 오답 패널티용 뽑은 타일이 없으면, 자신의 미공개 타일 하나를 직접 공개한다.

## Work Cycle

기능 하나를 붙일 때마다 이 순서로 진행한다.

1. PLAN: 무엇을 왜 만드는지 한 문장으로 정의한다.
2. SCOPE: 건드릴 파일을 미리 나열한다.
3. BUILD: 서버 → 클라이언트 순서로 구현한다. 소켓 이벤트 인터페이스를 먼저 확정한다.
4. TEST: `./check.sh`와 브라우저 수동 확인을 수행한다.
5. ARCHITECTURE: 구조/소켓/App 전역 상태/phase가 바뀌면 `ARCHITECTURE.md`를 업데이트한다.
6. LOG: 의미 있는 변경 후 `DEVLOG.md`에 작업 내용을 추가한다.
7. COMMIT: 민감 파일 포함 여부를 확인하고 의미 있는 단위로 나눠 커밋한다.

## Coding Rules

- 타입 전용 import는 `import type`을 사용한다.
- 기능 변경 전 건드릴 파일 범위를 먼저 좁힌다.
- 서버 소켓 이벤트 인터페이스를 먼저 확정한 뒤 클라이언트를 맞춘다.
- 파일/디렉터리 구조, 소켓 이벤트, App 전역 상태, phase 흐름이 바뀌면 `ARCHITECTURE.md`를 업데이트한다.
- 의미 있는 변경 후 `DEVLOG.md`에 작업 내용을 추가한다.
- 커밋 전 `./check.sh`를 통과시킨다.
- 커밋 메시지는 Angular/Conventional Commits 형식을 따른다. 타입은 영어(`feat`, `fix`, `docs`, `chore`, `refactor`, `test` 등)로 쓰고, 설명은 한국어로 작성한다. 예: `docs: 커밋 작성 규칙 추가`
- 서로 독립적인 변경은 의미 있는 단위로 나눠 커밋한다. 예: 문서 정리, 기능 구현, 버그 수정, 포맷 변경은 가능하면 별도 커밋으로 분리한다.
- `.claude/settings.local.json`, `.env`류 파일은 커밋하지 않는다.

## Sync Rule

- `AGENTS.md`와 `CLAUDE.md`는 공통 가이드다.
- 한 파일을 수정하면 같은 턴에서 다른 파일도 동일한 내용으로 맞춘다.
- 두 파일의 내용이 달라져 있으면 새 작업을 시작하기 전에 먼저 동기화한다.

## Known Handoff Notes

- 현재 git 상태에서 `client/package.json`이 수정되어 있을 수 있다. 확인된 변경 내용은 `dev` script가 `vite`에서 `vite --host`로 바뀐 것과 파일 끝 newline 차이다.
- `client/README.md`는 아직 Vite 기본 템플릿 문서라서 프로젝트 README로 교체하는 것이 좋다.
- 배포는 완료됐지만 실제 Vercel/Render URL은 저장소 문서에 아직 기록되어 있지 않다.
