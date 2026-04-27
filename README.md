# DeciCode — 타일 추리 게임

다빈치 코드 보드게임에서 영감을 받은 실시간 멀티플레이어 타일 추리 게임.

**[플레이하기 →](https://deci-code.vercel.app)**

---

## 게임 소개

숫자와 색상이 적힌 타일을 배치해두고 상대방의 숨겨진 패를 추리하는 2~4인 전략 게임.
상대방 타일을 모두 공개시키면 승리한다.

- 덱: 검정 0~11, 흰색 0~11, 조커 2장 — 총 26장
- 매 턴 덱에서 타일을 뽑고, 상대방 타일을 추리한다
- 정답이면 계속 추리할 수 있고, 오답이면 뽑은 타일이 공개된 채로 턴이 넘어간다
- 추리 제한시간: 30초 또는 60초 선택

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS + Vite |
| 백엔드 | Node.js + Express + Socket.io + TypeScript |
| 실시간 통신 | Socket.io (REST API 없음, 소켓 이벤트만 사용) |
| 패키지 매니저 | pnpm |
| 테스트 | Vitest (서버 게임 로직 단위 테스트) |
| 배포 | Vercel (클라이언트) + Render (서버) |

단일 저장소에 `client/`, `server/` 분리 구성.

---

## 배포

| | URL |
|--|-----|
| 클라이언트 | https://deci-code.vercel.app |
| 서버 | https://davinci-code-9kcw.onrender.com |

> Render 무료 플랜을 사용해 첫 요청 시 콜드 스타트(~30초)가 있을 수 있다.

---

## 로컬 실행

```bash
# 서버
cd server
pnpm install
pnpm dev        # localhost:3001

# 클라이언트 (새 터미널)
cd client
pnpm install
pnpm dev        # localhost:5173
```

---

## 검증

```bash
./check.sh          # 테스트 → 서버 빌드 → 클라이언트 빌드
./check.sh --watch  # vitest watch 모드
```

---

## AI 개발 방식

이 프로젝트는 [Claude Code](https://claude.ai/code) CLI를 활용해 개발했다.

- **CLAUDE.md / AGENTS.md**: AI 에이전트가 어떤 도구를 사용해도 같은 맥락으로 작업을 이어갈 수 있도록 컨텍스트를 관리하는 공통 가이드
- **ARCHITECTURE.md**: 파일 구조, 소켓 이벤트, 상태 흐름을 AI와 함께 실시간으로 유지
- **DEVLOG.md**: 작업 이력 기록
- **Playwright MCP**: 브라우저 자동화로 UI 테스트
- **GitHub Flow**: 이슈 → 브랜치 → PR → 머지 사이클을 AI가 `gh` CLI로 수행

---

## 프로젝트 구조

```
deci-code/
├── client/          Vite + React + TypeScript (포트 5173)
├── server/          Node.js + Express + Socket.io (포트 3001)
├── check.sh         통합 검증 스크립트
├── CLAUDE.md        AI 에이전트 공통 가이드
├── ARCHITECTURE.md  아키텍처 문서
└── DEVLOG.md        작업 기록
```
