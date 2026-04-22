# Da Vinci Code — 아키텍처 문서

> **자동 유지**: 파일 구조나 소켓 이벤트가 바뀔 때마다 이 문서도 함께 업데이트된다.

---

## 전체 구조

```
davinci-code/
├── check.sh         개발 하네스 (test → build server → build client)
├── client/          Vite + React + TypeScript (포트 5173)
└── server/          Node.js + Express + Socket.io (포트 3001)
```

통신은 **Socket.io**만 사용한다. REST API 없음. 클라이언트가 이벤트를 emit하면 서버가 처리 후 방 전체 또는 개인에게 이벤트를 emit한다.

---

## 소켓 이벤트 흐름

### Client → Server

| 이벤트 | 인자 | 설명 |
|---|---|---|
| `join_room` | `roomId, nickname, turnDurationSec?` | 방 코드로 입장 (없으면 생성). 방 생성 시 30초/60초 추리 제한시간 설정 |
| `join_random` | `nickname` | 랜덤 매칭 대기열 등록 |
| `set_ready` | — | 준비 완료 선언 |
| `draw_tile` | — | 덱에서 타일 뽑기 |
| `place_joker` | `position: number` | 조커 삽입 위치 선택 (insert 페이즈) |
| `guess_tile` | `targetPlayerId, tileId, guessedColor, guessedNumber\|null` | 상대 타일 추리. 클라이언트는 선택한 타일 색상을 자동 적용하고 숫자/조커만 받음 |
| `skip_guess` | — | 추리 패스 후 턴 종료 |
| `reveal_own_tile` | `tileId` | 내 타일 직접 공개 (덱 비어있을 때 오답 패널티) |
| `restart_game` | — | finished 상태의 같은 방을 waiting 상태로 초기화 |

### Server → Client

| 이벤트 | 수신자 | 인자 | 설명 |
|---|---|---|---|
| `room_joined` | 개인 | `room, playerId` | 입장 성공. 내 socket ID 전달 |
| `room_updated` | 방 전체 | `room` | 방 상태 변경 (준비, 턴 변경, 타일 공개 등) |
| `game_started` | 방 전체 | `room` | 모두 준비 → 게임 시작, 타일 배분 완료 |
| `tile_drawn` | 개인 | `tile` | 뽑은 타일 (본인만 볼 수 있음) |
| `must_place_joker` | 개인 | — | 조커 뽑음 → 배치 위치 선택 요청 |
| `guess_result` | 방 전체 | `correct, tile, guessedColor, guessedNumber, guesserNickname, targetNickname` | 추리 결과와 선언값. 오답 시 실제 정답 값은 숨김 |
| `must_reveal_tile` | 개인 | — | 덱 비어있을 때 오답 → 내 타일 선택 요청 |
| `game_over` | 방 전체 | `winnerId, winnerNickname` | 게임 종료 |
| `waiting_for_match` | 개인 | — | 랜덤 매칭 대기 중 |
| `error` | 개인 | `message` | 입장 불가 등 오류 |

---

## 서버 내부 구조

```
server/src/
├── index.ts                  Socket.io 이벤트 핸들러, 방 관리 (rooms Map, waitingQueue)
├── gameLogic.ts              순수 게임 로직 함수 (상태 변환, 검증)
├── types.ts                  GameRoom, Player, Tile, 소켓 이벤트 타입 정의
└── __tests__/
    └── gameLogic.test.ts     게임 로직 단위 테스트 (vitest, 41개)
```

### 서버 상태

- `rooms: Map<string, GameRoom>` — 활성 방 전체
- `waitingQueue: { socketId, nickname }[]` — 랜덤 매칭 대기열
- `roomForPlayer(room, viewerId)` — 플레이어별로 방 상태를 마스킹한다. 비공개 조커는 상대에게 조커로 보이지 않는다.

### gameLogic.ts 주요 함수

| 함수 | 역할 |
|---|---|
| `createRoom(id)` | 빈 방 생성 |
| `addPlayer(room, id, nickname)` | 플레이어 추가 |
| `dealInitialTiles(room)` | 게임 시작 시 타일 배분 (2~3인→4장, 4인→3장) |
| `drawTile(room)` | 덱 맨 위 타일 뽑기, drawnTile + drawnTileId 설정 |
| `insertJokerAtPosition(room, playerId, position)` | 조커를 지정 위치에 삽입, phase='guess'로 전환 |
| `guessPlayerTile(room, targetId, tileId, color, num)` | 추리 검증 (색상+숫자 모두 확인) |
| `addDrawnTileToPlayer(room, playerId)` | 뽑은 숫자 타일을 즉시 정렬 위치에 삽입 |
| `revealDrawnTileAsPlaced(room, playerId)` | 이번 턴에 패에 들어간 타일(drawnTileId)을 공개 |
| `nextTurn(room)` | 탈락자 건너뛰며 다음 턴, phase='draw' 리셋 |
| `checkWinner(room)` | 승자 판정 (비탈락자 1명) |
| `isPlayerEliminated(player)` | 타일 모두 공개 여부 |
| `revealOwnTile(room, playerId, tileId)` | 패널티 타일 공개 |
| `resetRoomForReplay(room)` | 같은 플레이어로 방을 waiting 상태로 초기화 |
| `sortTiles(tiles)` | 숫자 오름차순, 동점 시 흑 먼저 (조커는 맨 뒤) |
| `findInsertIndex(tiles, newTile)` | 정렬 순서를 유지하는 삽입 인덱스 반환 |

---

## 클라이언트 내부 구조

```
client/src/
├── main.tsx                진입점
├── App.tsx                 소켓 연결, 전역 상태, 페이지 라우팅
├── hooks/
│   └── useSocket.ts        Socket.io 연결 + 이벤트 바인딩 훅
├── types/
│   └── index.ts            GameRoom, Player, Tile, TileColor 타입
├── components/             재사용 가능한 UI 컴포넌트
│   ├── TileCard.tsx        타일 카드 (앞면/뒷면, 크기, 애니메이션, 조커 스타일)
│   ├── TileRow.tsx         타일 목록 + OrderGap 조합
│   ├── OrderGap.tsx        타일 사이 ≤ / < / = 표시
│   ├── Avatar.tsx          플레이어 이니셜 아바타
│   └── Toasts.tsx          토스트 알림 오버레이
└── pages/
    ├── LobbyPage.tsx       방 만들기 / 코드 입장 / 랜덤 매칭 선택
    ├── WaitingRoom.tsx     대기실 (준비 버튼, 플레이어 목록)
    ├── GamePage.tsx        게임 화면 — 상태 관리 + 컴포넌트 조합
    └── game/               GamePage 전용 서브컴포넌트
        ├── types.ts        Phase, SelTarget 타입
        ├── TopSeat.tsx     상단 상대방 시트 (가로 타일 배열)
        ├── SideSeat.tsx    좌/우 상대방 시트 (세로 타일 배열)
        ├── MySeat.tsx      하단 내 패
        ├── CenterZone.tsx  덱 + 액션 버튼 (뽑기/조커배치/추리/패스)
        ├── GameSidebar.tsx 우측 사이드바 (플레이어 목록, 페이즈, 로그)
        ├── GuessModal.tsx  색상+숫자 선택 모달 (2단계: 색상→숫자)
        ├── JokerInsertModal.tsx 조커 배치 위치 선택 모달
        └── PenaltyModal.tsx 패널티 타일 선택 모달
```

---

## App.tsx — 전역 상태 흐름

App.tsx가 소켓과 전역 상태를 모두 관리하고, 각 페이지에 props로 전달한다.

```
소켓 이벤트 수신
    │
    ▼
App.tsx (전역 상태)
    ├── page: 'lobby' | 'waiting' | 'game' | 'finished'
    ├── room: GameRoom | null
    ├── myId: string  (myIdRef로 클로저 안정화)
    ├── drawnTile: Tile | null         ← tile_drawn에서 세팅
    ├── hasDrawnThisTurn: boolean      ← 턴 관리
    ├── mustPlaceJoker: boolean        ← must_place_joker에서 세팅
    ├── mustRevealTile: boolean        ← must_reveal_tile에서 세팅
    ├── lastGuessResult: GuessResult | null
    ├── gameOver: { winnerId, winnerNickname } | null
    ├── room.turnDurationSec: 30 | 60
    └── room.turnStartedAt: number | null
    │
    ▼
페이지 컴포넌트에 props 전달
    ├── LobbyPage    → onJoinRoom, onJoinRandom
    ├── WaitingRoom  → room, myId, onReady
    └── GamePage     → room, myId, drawnTile, hasDrawnThisTurn,
                       mustPlaceJoker, mustRevealTile, lastGuessResult,
                       onDrawTile, onPlaceJoker, onGuessTile(color+num),
                       onSkipGuess, onRevealOwnTile
```

---

## GamePage — 페이즈(Phase) 흐름

`phase`는 서버 상태가 아닌 클라이언트에서 파생 계산한다.

```
isMyTurn? ──No──► wait      (상대방 차례 대기)
    │
   Yes
    │
mustRevealTile? ──Yes──► penalty   (덱 비어있을 때 오답 → 내 타일 선택)
    │
   No
    │
mustPlaceJoker? ──Yes──► insert    (조커 뽑음 → 배치 위치 선택)
    │
   No
    │
hasDrawnThisTurn? ──No──► draw     (타일 뽑기)
    │
   Yes
    │
guessedCorrectly? ──Yes──► correct (정답 → 계속/종료 선택)
    │
   No
    └──────────────────────► select  (타일 선택 후 추리)
```

---

## 서버 페이즈(GamePhase) 흐름

서버 `room.phase`는 소켓 이벤트 처리 시 유효성 검증에 사용된다.

```
draw ──draw_tile──► insert (조커)  ──place_joker──► guess
     │                                              │
     └──────── guess (비조커) ───────────────────────┘
                    │
                    ├─ guess_tile (정답) → guess 유지 or 다음턴 draw
                    ├─ guess_tile (오답) → 다음턴 draw
                    └─ skip_guess       → 다음턴 draw
```

---

## 게임 턴 시퀀스

### 비조커 뽑기 + 추리

```
클라이언트(내 차례)          서버
      │
      ├─ draw_tile ──────────► tile_drawn (나에게만)
      │                        뽑은 타일 즉시 내 패에 정렬 삽입
      │                        room_updated (전체, phase=guess)
      │
      ├─ guess_tile ─────────► guess_result (전체)
      │    정답                room_updated (전체)
      │    └─ 계속 추리 가능
      │    오답 + 이번 턴에 뽑은 타일 있음
      │    └─ 이미 내 패에 들어간 타일 공개 + room_updated + 턴 종료
      │    오답 + 덱 비어있음
      │    └─ must_reveal_tile (나에게만)
      │         │
      │         └─ reveal_own_tile ► room_updated (전체)
      │
      └─ skip_guess ─────────► room_updated (전체, 턴 종료)
```

### 조커 뽑기

```
클라이언트(내 차례)          서버
      │
      ├─ draw_tile ──────────► tile_drawn (나에게만)
      │                        must_place_joker (나에게만)
      │                        room_updated (전체, phase=insert)
      │                        상대 화면에는 조커 여부 대신 "타일 정리 중" 표시
      │
      ├─ place_joker ────────► room_updated (전체, 조커 배치됨, phase=guess)
      │
      └─ (이후 비조커와 동일한 추리 흐름)
           오답 시: 배치된 조커 공개 (drawnTileId 추적)
```

---

## 타일 데이터 구조

```
TileColor = 'black' | 'white' | 'joker'

Tile = {
  id: string
  color: TileColor
  number: number | null   // joker는 null
  isRevealed: boolean
}
```

- 조커 2장: `{ color: 'joker', number: null }`
- 숫자 타일: 흑 0~11 (12장) + 백 0~11 (12장) = 24장
- 총 26장
- 상대에게 보내는 비공개 조커는 조커 정체가 드러나지 않도록 마스킹된다.

```
GameRoom 추가 상태:
  turnDurationSec: 30 | 60
  turnStartedAt: number | null
```

---

## 초기 타일 배분 규칙

| 인원 | 1인당 장수 | 덱 남은 장수 |
|---|---|---|
| 2인 | 4장 | 18장 |
| 3인 | 4장 | 14장 |
| 4인 | 3장 | 14장 |

---

## 개발 하네스 (check.sh)

```bash
./check.sh           # test → build (server + client) 전체 검증
./check.sh --watch   # vitest watch 모드
```

단계: 서버 테스트(vitest) → 서버 빌드(tsc) → 클라이언트 빌드(tsc+vite)

---

## 디자인 시스템

| 항목 | 값 |
|---|---|
| 배경색 | `#131c2b` |
| 서피스 | `#1b2536` |
| 골드 (강조) | `#c8a84b` |
| 텍스트 기본 | `#8898b0` |
| 텍스트 밝음 | `#dde3ee` |
| 성공 (초록) | `#6fcf97` |
| 오류 (빨강) | `#eb5757` |
| 조커 (보라) | `#b080ff` |
| 경계선 | `#2a3a54` |
| 제목 폰트 | Playfair Display |
| 본문 폰트 | Inter |
