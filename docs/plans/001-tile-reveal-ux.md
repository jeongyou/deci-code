# 001 — 타일 reveal UX 수정

> 상태: 완료 | 관련 이슈: #3, #4 | PR: #5

## 목적

내 패 타일 공개 시 클리핑 버그와 상대방 화면 애니메이션 버그 수정

## 작업 범위

- `client/src/pages/game/MySeat.tsx`
- `client/src/components/TileRow.tsx`
- `client/src/components/TileCard.tsx`

## 작업 내용

### 이슈 #3 — 공개 타일 상단 클리핑
- 원인: `overflowX: auto` 컨테이너가 수직 오버플로우도 클리핑
- 수정: `MySeat` overflow 컨테이너에 `paddingTop: 12` 추가

### 이슈 #4 — 상대방 패에 reveal 애니메이션 적용되던 버그
- 원인: `TileCard`의 reveal offset(translateY -9px)이 `isMine` 조건 없이 모든 타일에 적용
- 수정: `TileCard` / `TileRow`에 `isMine` prop 추가, `MySeat`에서만 `isMine={true}` 전달

## 결과

- Playwright MCP로 두 탭에서 실제 게임 진행해 두 이슈 모두 확인 ✓
- `./check.sh` 42 테스트 통과
