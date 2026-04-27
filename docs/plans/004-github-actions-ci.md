# 004 — GitHub Actions CI 추가

> 상태: 완료 | 관련 이슈: #22 | PR: #23

## 목적
PR 올릴 때 테스트/빌드를 GitHub에서 자동 실행해 결과를 PR 페이지에 표시한다.

## 범위
`.github/workflows/ci.yml` 신규 추가. 코드 변경 없음.

## 작업 내용
- PR → main 트리거
- pnpm 10 + Node 20 환경
- 서버 vitest → 서버 tsc 빌드 → 클라이언트 tsc + vite 빌드 순서 실행
- 의존성 캐시 적용

## 트레이드오프
- CD는 Vercel/Render 네이티브 연동으로 이미 처리 중 → GitHub Actions 불필요
- CI만 추가하면 충분
