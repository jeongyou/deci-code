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
