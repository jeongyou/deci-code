# DeciCode — Dev Log

작업 기록. 커밋 히스토리로 타임라인 확인 가능.

---

## 2026-04-27

### 리브랜딩 및 URL 정리
- 프로젝트명 Da Vinci Code → **DeciCode** 완료
- GitHub 레포 `davinci-code` → `deci-code` rename
- Vercel URL `davinci-code-beta.vercel.app` → `deci-code.vercel.app`
- 문서 전체 URL 일괄 업데이트 (README, CLAUDE.md, AGENTS.md, ARCHITECTURE.md, DEVLOG.md)
- `client/index.html` 타이틀/메타 설명 업데이트
- LobbyPage 서브타이틀, GamePage 헤더 DeciCode로 변경

### ADR(Architecture Decision Records) 도입
- `docs/decisions/` 폴더 신설
- 001: Socket.io 선택, 002: pnpm 모노레포, 003: Posthog+Sentry 선택 기록

### Posthog + Sentry 모니터링 연동 (PR #17)
- Posthog: 방문자, 유입 경로, 게임 이벤트 추적 (`game_started`, `game_ended`, `guess_correct`, `guess_wrong`)
- Sentry: 클라이언트 React 오류 + 서버 Express 오류 추적
- 환경변수 없으면 초기화 skip (로컬 개발 무관)
- Vercel: `VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN` 추가 완료
- Posthog Session Replay 활성화

---

## 2026-04-23

### 개발 환경 및 워크플로우 정비
- `.claude/settings.json`: pre-commit hook (`git commit` 전 `./check.sh` 자동 실행), 위험 명령어 deny 규칙 추가
- `ISSUES.md`: 수동 테스트 이슈 추적 파일 생성
- `docs/PLAN.md`: 작업 플랜 기록 파일 생성
- `.github/ISSUE_TEMPLATE/`: 버그/기능 이슈 템플릿 추가
- `.github/pull_request_template.md`: PR 템플릿 추가 (`Closes #N` 포함)
- `CLAUDE.md` / `AGENTS.md`: Work Cycle에 Issue→Branch→PR→Merge 단계 추가, Branch Naming 규칙 추가
- SVG 스킬(`moai-tool-svg`) 글로벌 설치

### README 작성 (이슈 #1)
- 루트 `README.md` 신규 작성: 프로젝트 소개, 배포 링크, 기술 스택, 로컬 실행, AI 개발 방식

---

## 2026-04-21

### 초기 구현 완성
- 서버: Express + Socket.io, 방 생성/입장/랜덤 매칭, 게임 로직 전체 (덱, 타일 분배, 추리, 턴, 승패)
- 클라이언트: Vite + React + Tailwind, LobbyPage / WaitingRoom / GamePage / TileCard
- App.tsx 상태 라우팅 완성 (lobby → waiting → game → finished)

### 버그 수정
- `import type` 누락으로 인한 흰 화면 수정 (verbatimModuleSyntax)
- 정답 후 연속 추리 불가 버그 수정 (`hasDrawnThisTurn` 상태 추가)
- 랜덤 매칭 대기 중 에러 토스트 뜨던 문제 수정

### 환경
- GitHub 레포 생성: https://github.com/jeongyou/deci-code
- 스킬 설치: react-best-practices, composition-patterns, deploy-to-vercel

### 테스트 자동화
- vitest 설치, gameLogic.ts 유닛 테스트 16개 추가 (전 함수 커버)
- `cd server && pnpm test` 로 실행

### 룰 수정 및 리팩토링
- 추리 실패 시 뽑은 타일 공개 룰 추가
- 덱 빈 상태 추리 실패 → 내 타일 직접 선택 공개 (must_reveal_tile 이벤트)
- 정렬 버그 수정: 같은 숫자는 검정이 흰색보다 앞
- 상대/내 패 흑·백 분리 표시
- TileCard boolean props → variant/size 명시적 타입으로 교체
- GamePage → TurnBanner, OpponentArea, GuessPanel, MyHand 서브컴포넌트 분리
- 전체 UI 리디자인 (#0d1117 배경, 물리 타일 느낌)

### 다음 작업
- [x] 배포 (Vercel + Render)

---

## 2026-04-22

### 게임 규칙 전면 구현 (규칙 문서 기반 재작성)

#### 버그 수정
- **초기 배분 버그**: `playerCount <= 2` → `<= 3` (2~3인=4장, 4인=3장으로 수정)
- **추리 색상 누락**: `guessPlayerTile`이 숫자만 비교하던 것을 색상+숫자 모두 검증하도록 수정

#### 조커 자유배치 구현
- 서버: 조커 뽑으면 `must_place_joker` emit → `insert` 페이즈로 전환
- 클라이언트: `JokerInsertModal.tsx` 신규 — 현재 패를 보여주며 금색 슬롯 클릭으로 삽입 위치 선택
- `place_joker` 소켓 이벤트 추가 (Client→Server)
- 오답 시 배치된 조커 공개: `drawnTileId` 필드로 추적, `revealDrawnTileAsPlaced` 함수 추가

#### 타일 구조 변경
- `isJoker: boolean` 플래그 제거 → `color: 'black' | 'white' | 'joker'` 통합 (규칙 데이터 구조 준수)
- 조커 전용 비주얼: 보라색 배경(`#1e0f33`), `★` 기호, 경계선 `#6a3db0`

#### GuessModal 2단계 UI
- 기존: 숫자만 선택 → 신규: 흑/백/조커 색상 먼저 선택 → 숫자 선택
- 조커 선택 시 숫자 단계 스킵하고 바로 확인 가능

#### 서버 페이즈 관리
- `GameRoom.phase: 'draw' | 'insert' | 'guess' | 'end'` 필드 추가
- 각 소켓 핸들러에서 phase 유효성 검증 (잘못된 순서의 이벤트 무시)

#### 컴포넌트/타입 업데이트
- `client/src/types/index.ts`: `GamePhase` 타입 추가, `isJoker` 제거
- `client/src/pages/game/types.ts`: Phase에 `'insert'` 추가
- `CenterZone`: insert 페이즈 안내 문구 추가
- `OrderGap`, `PenaltyModal`, `LobbyPage`: `isJoker` → `color === 'joker'` 전환

#### 테스트 (vitest)
- 기존 구버전 테스트 파일 삭제 (`src/gameLogic.test.ts`)
- 새 테스트 `src/__tests__/gameLogic.test.ts` — 41개 테스트, 전 함수 커버
  - createRoom, addPlayer, dealInitialTiles, sortTiles, findInsertIndex
  - drawTile, insertJokerAtPosition, guessPlayerTile (색상 케이스 포함)
  - addDrawnTileToPlayer, revealDrawnTileAsPlaced, nextTurn
  - isPlayerEliminated, checkWinner, revealOwnTile
- `tsconfig.json` 에 테스트 파일 제외 (`exclude`) → dist 오염 방지

#### Dev Harness
- `check.sh` 신규: `./check.sh` 한 번으로 서버 테스트 → 서버 빌드 → 클라이언트 빌드 전체 검증
- `./check.sh --watch`: vitest watch 모드 (TDD)

### 배포
- Vercel(client) + Render(server) 배포 완료
- 실제 배포 URL은 저장소 문서에 아직 미기록

### 다음 작업
- [x] 배포 URL 및 환경 변수 문서화
- [x] README 정리

---

## 2026-04-22 (속행)

### 배포 URL 확정
- Client (Vercel): https://deci-code.vercel.app
- Server (Render): https://davinci-code-9kcw.onrender.com
- Vercel 환경 변수 `VITE_SERVER_URL=https://davinci-code-9kcw.onrender.com` 설정 완료

### 서버 턴 타임아웃 자동 처리 구현
- `server/src/index.ts`에 `turnTimers: Map<string, Timeout>` 추가
- `scheduleTurnTimer(room)` / `clearTurnTimer(roomId)` 헬퍼 추가
- 턴 시작(game start, nextTurn) 시 서버 타이머 예약
- 시간 초과 시 처리 규칙:
  - 조커 미배치(insert 페이즈)면 패 맨 뒤에 자동 삽입
  - 이번 턴 뽑은 타일이 패에 있으면 공개(패널티)
  - 이후 nextTurn 호출
- 게임 종료(game_over), 방 삭제(disconnect), 재시작(restart_game) 시 타이머 정리
- check.sh 42개 테스트 + 전체 빌드 통과

### 게임 플레이 UX 개선
- 뽑은 숫자 타일이 즉시 내 패에 정렬 삽입되도록 서버 턴 흐름 수정
- 오답 시 이번 턴에 뽑아 이미 패에 들어간 타일을 `drawnTileId`로 찾아 공개
- 상대 화면에서 비공개 조커가 보라색 조커 타일로 노출되지 않도록 플레이어별 room 마스킹 추가
- 상대가 타일을 뽑은 뒤에는 숫자 타일/조커 여부를 구분할 수 없도록 "타일 정리 중" 안내 표시
- 추리 모달을 숫자/조커 선택 방식으로 단순화하고, 색상은 선택한 타일에서 자동 적용
- 추리 로그에 추리자, 대상, 선언값, 정답/오답을 표시하고 글씨 크기 조정
- 공개된 타일이 위로 밀려나고 빨간 마커가 표시되도록 TileCard 시각 상태 개선
- 게임 종료 화면을 기존 게임 UI 톤으로 재디자인
- finished 상태에서 같은 방을 waiting 상태로 초기화하는 `restart_game` 이벤트 추가
- 대기실 초대 복사를 방 코드에서 `?room=ROOMID` 초대 링크 복사로 변경
- 방 만들 때 추리 제한시간 30초/1분 선택 UI와 방 상태 필드 추가
