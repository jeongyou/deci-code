# Da Vinci Code — Dev Log

작업 기록. 커밋 히스토리로 타임라인 확인 가능.

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
- GitHub 레포 생성: https://github.com/jeongyou/davinci-code
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
- [ ] 배포 (Vercel + Render)

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

### 다음 작업
- [ ] 배포 (Vercel + Render)
