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

### 다음 작업
- [ ] 배포 (Vercel + Render)
- [ ] 코드 리팩토링 (react-best-practices, composition-patterns 적용)
