# 003 — 모니터링: Posthog + Sentry 선택

## 결정
Posthog(analytics + 이벤트) + Sentry(오류 추적) 콤보 사용.

## 선택지
- GA4 + Sentry
- Posthog + Sentry ← 선택
- Posthog 단독 (에러 트래킹 포함)
- Umami + Sentry

## 이유
- GA4는 쿠키 배너 의무(GDPR) + 설정 복잡, Posthog은 상대적으로 자유로움
- Posthog 무료 1M 이벤트/월으로 현재 규모에 충분
- Sentry는 에러 추적 분야 최강 — 스택트레이스, 재현 경로, React/Node 통합 지원
- Posthog 단독도 에러 트래킹이 되지만 Sentry만큼 깊지 않음

## 트레이드오프
- Sentry 무료 5K 에러/월 한도 (초과 시 누락, 자동 과금 아님)
- 두 서비스 계정 관리 필요
- 환경변수 3개 추가 (VITE_POSTHOG_KEY, VITE_SENTRY_DSN, SENTRY_DSN)
