# 002 — 상대방 패 크기 개선

> 상태: 작성 중 | 관련 이슈: (생성 예정)

## 목적

상대방 타일이 너무 작아 게임 중 식별이 어렵고, 패가 늘어나도 크기가 고정되어 화면을 넘치는 문제 해결.

## 현재 상태

| 컴포넌트 | size | 픽셀 |
|---------|------|------|
| MySeat | `lg` 고정 | 58×76 |
| TopSeat | `sm` 고정 | 40×52 |
| SideSeat | `xs` 고정 | 32×42 |

## 작업 내용

### TopSeat — 타일 수에 따라 동적 size

```
≤5장  → md (50×64)
6~8장 → sm (40×52)
9장+  → xs (32×42)
```

`tiles.length`로 size 계산하는 헬퍼 추가.

### SideSeat — size 키우기 + 컨테이너 너비 조정

```
≤6장  → sm (40×52), 컨테이너 width 72 → 88px
7장+  → xs (32×42), 컨테이너 width 72px 유지
```

## 작업 파일

- `client/src/pages/game/TopSeat.tsx`
- `client/src/pages/game/SideSeat.tsx`

## 완료 조건

- [ ] TopSeat 타일이 MySeat과 비슷한 크기로 보임
- [ ] 패가 늘어나도 한 줄(TopSeat) / 세로(SideSeat) 안에서 표시됨
- [ ] Playwright MCP로 실제 게임에서 확인
