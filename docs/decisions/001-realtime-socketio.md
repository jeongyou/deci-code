# 001 — 실시간 통신: Socket.io 선택

## 결정
REST API 없이 Socket.io 단독으로 실시간 통신 처리.

## 선택지
- REST API + Polling
- WebSocket 직접 구현
- Socket.io ← 선택

## 이유
- 보드게임 특성상 모든 상태 변화가 실시간으로 전파되어야 함
- Socket.io는 재연결, 룸 관리, 이벤트 네임스페이스를 기본 제공
- WebSocket 직접 구현 대비 개발 속도 우위

## 트레이드오프
- Socket.io 라이브러리 의존성 추가
- HTTP polling fallback이 있어 순수 WebSocket보다 약간 무거움
- REST API가 없어 HTTP 클라이언트로는 서버 상태를 조회할 수 없음
