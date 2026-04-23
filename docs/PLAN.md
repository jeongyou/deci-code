# 작업 플랜

> 이 파일은 작업 전 플랜을 기록하고 승인을 받는 용도다.
> 작업 완료 후에는 DEVLOG.md에 결과를 기록한다.
> Codex 등 다른 AI가 이어받을 때는 이 파일과 ISSUES.md, DEVLOG.md를 먼저 읽는다.

---

## 현재 플랜: 2026-04-23

### 전체 작업 목록

| # | 작업 | 범위 | 난이도 | 상태 |
|---|------|------|--------|------|
| A | README 정리 | `client/README.md` or 루트 `README.md` | 쉬움 | 대기 |
| 1 | Disconnect UX 개선 | `server/src/index.ts`, `client/src/App.tsx` | 보통 | 대기 |
| 2 | 조커 위치 선택 수정 + 마스킹 | `server/src/index.ts`, `client/src/pages/game/JokerInsertModal.tsx`, `client/src/App.tsx` | 어려움 | 대기 |
| 3 | 공개 타일 상단 클리핑 수정 | `client/src/pages/game/MySeat.tsx`, `client/src/components/TileCard.tsx` | 쉬움 | 대기 |
| 4 | 상대방 패 reveal 애니메이션 제거 | `client/src/components/TileCard.tsx`, `TopSeat.tsx`, `SideSeat.tsx` | 쉬움 | 대기 |
| 5 | 상대방 패 크기 확대 + 반응형 축소 | `TopSeat.tsx`, `SideSeat.tsx`, `TileCard.tsx` | 보통 | 대기 |
| 6 | 정답/오답 피드백 강화 + 버튼 개선 | `GuessModal.tsx` or `CenterZone.tsx`, `Toasts.tsx` | 보통 | 대기 |
| 7 | 벡터 이미지 리소스 생성 | `client/src/assets/` | TBD (find-skills 결과에 따라) | 대기 |

---

## A. README 정리

**목적**: 이력서/포트폴리오에 링크할 수 있는 실제 프로젝트 설명으로 교체

**작업 파일**: `client/README.md` → 루트 `README.md` 로 이동하거나 루트에 새로 작성

**내용 구성**:
- 프로젝트 소개 (다빈치 코드 보드게임 웹 구현)
- 배포 링크 (Vercel client, Render server)
- 로컬 실행 방법 (`pnpm dev`)
- 기술 스택
- 게임 규칙 요약
- AI 개발 방식 소개 (Claude Code + Playwright MCP)

---

## 1. Disconnect UX 개선

**목적**: 상대방이 연결을 끊을 때 남은 플레이어에게 즉시 알림

**현재 상태**: `server/src/index.ts`에 `socket.on('disconnect')` 핸들러가 있지만 room_updated를 emit하지 않거나 클라이언트 처리가 누락된 것으로 추정

**작업 내용**:
1. `server/src/index.ts` — disconnect 시 남은 플레이어에게 `room_updated` 또는 신규 이벤트 emit
2. `client/src/App.tsx` — 상대방 disconnect 감지 시 토스트 알림 + 대기실/게임 상태 갱신
3. 게임 중 disconnect: 게임 중단 처리 또는 재연결 대기 안내

**주의**: 재연결 기능은 현재 scope 밖. 단순 알림/상태 갱신만 구현

---

## 2. 조커 위치 선택 수정 + 마스킹

**목적**: 조커를 뽑으면 원하는 위치에 삽입할 수 있도록 수정

**현재 상태**: `must_place_joker` 이벤트와 `JokerInsertModal`은 구현되어 있으나 동작 안 함

**중요 마스킹 주의사항**:
- 조커를 늦게 배치하면 상대방 눈에 패 수가 갑자기 증가 → 조커임이 노출됨
- 해결책: 타일을 뽑는 순간 상대방에게는 패 수 +1로 표시 (내용은 뒷면), 조커 배치 후 실제 위치 확정
- `roomForPlayer()` 마스킹 함수에서 insert phase 중 drawnTile을 임시 플레이스홀더로 처리하는지 확인

**작업 내용**:
1. `server/src/index.ts` — `draw_tile` → `must_place_joker` 흐름 디버깅
2. `server/src/gameLogic.ts` — insert phase에서 상대방에게 패 수만 +1 되고 내용은 마스킹되는지 확인
3. `client/src/App.tsx` — `must_place_joker` 수신 시 `mustPlaceJoker` 상태 세팅 확인
4. `client/src/pages/GamePage.tsx` — phase 계산 로직에서 insert phase로 전환되는지 확인
5. `client/src/pages/game/JokerInsertModal.tsx` — 모달 렌더링 및 `place_joker` emit 확인

---

## 3. 공개 타일 상단 클리핑 수정

**목적**: 타일 공개 시 위로 올라가는 애니메이션이 부모 컨테이너에 가려지지 않도록

**추정 원인**: MySeat 또는 TileRow의 컨테이너에 `overflow: hidden` 설정

**작업 내용**:
1. `client/src/pages/game/MySeat.tsx` — 컨테이너 overflow 확인
2. `client/src/components/TileRow.tsx` — overflow 확인
3. `client/src/components/TileCard.tsx` — reveal 애니메이션 transform 범위 확인
4. 필요시 `overflow: visible` 또는 padding 추가

---

## 4. 상대방 패 reveal 애니메이션 제거

**목적**: 위로 올라가는 공개 애니메이션은 내 패만, 상대방은 단순 뒤집기만

**작업 내용**:
1. `TileCard.tsx` — `isRevealed` 애니메이션에 `isMine` prop 분기 추가
2. `TopSeat.tsx`, `SideSeat.tsx` — TileCard에 `isMine={false}` 전달

---

## 5. 상대방 패 크기 확대 + 반응형 축소

**목적**: 상대방 패를 더 잘 보이도록 키우고, 패 수 증가 시 자동 축소

**작업 내용**:
1. `TopSeat.tsx`, `SideSeat.tsx` — TileCard size prop 증가
2. 패 수(tiles.length)에 따라 size를 동적으로 결정하는 로직 추가
   - 예: 4장 이하 → `lg`, 5-8장 → `md`, 9장 이상 → `sm`
3. `TileCard.tsx` — size별 스타일 확인

---

## 6. 정답/오답 피드백 강화 + 버튼 개선

**목적**: 추리 결과를 더 직관적으로 전달, 계속/종료 버튼 가시성 향상

**작업 내용**:
1. `CenterZone.tsx` 또는 `GamePage.tsx` — guess_result 시 전체화면 오버레이 또는 강조 UI 추가
2. 정답: 초록색 강조 + "정답!" 크게 표시
3. 오답: 빨간색 강조 + "오답" + 공개된 타일 표시
4. 계속/종료 버튼을 더 크고 중앙에 배치
5. `Toasts.tsx` 활용 또는 별도 ResultBanner 컴포넌트 검토

---

## 7. 벡터 이미지 리소스

**목적**: 타일, 로고 등 SVG 리소스 생성

**상태**: find-skills 결과 대기 중. 결과에 따라 방향 결정

---

## 작업 순서

```
A (README) → 3 (클리핑) → 4 (애니메이션) → 5 (크기) → 1 (disconnect) → 2 (조커) → 6 (피드백) → 7 (이미지)
```

- A, 3, 4, 5는 빠르고 독립적 → 먼저 처리
- 1은 서버+클라이언트 양쪽, 2는 복잡도 높음 → 나중
- 7은 `moai-tool-svg` 스킬 설치 완료, 직접 SVG 생성으로 진행

---

## 브랜치 네이밍 규칙

```
feature/{설명}-{이슈번호}   # 기능 추가
fix/{설명}-{이슈번호}        # 버그 수정
docs/{설명}                  # 문서만
```

예시:
- `fix/disconnect-ux-1`
- `fix/joker-placement-2`
- `fix/tile-clip-3`
- `feature/guess-feedback-6`

PR 본문에 `Closes #이슈번호` 작성 → 머지 시 이슈 자동 닫힘

---

## 핸드오프 노트 (Codex 등 인계 시)

- 이 파일과 ISSUES.md, DEVLOG.md, ARCHITECTURE.md, CLAUDE.md를 먼저 읽는다
- 작업 전 `./check.sh`로 현재 상태 확인
- 서버: `server/src/index.ts` (이벤트 핸들러), `server/src/gameLogic.ts` (순수 로직)
- 클라이언트: `client/src/App.tsx` (전역 상태), `client/src/pages/GamePage.tsx` (페이즈 계산)
- 소켓 이벤트 추가/변경 시 `server/src/types.ts`와 `client/src/types/index.ts` 양쪽 수정
- 커밋 전 `./check.sh` 통과 필수 (hook으로 자동 검증됨)
- 브랜치 전략: `fix/{설명}-{이슈번호}` → PR (`Closes #N`) → main 머지 (직접)
