#!/usr/bin/env bash
# Da Vinci Code — 개발 하네스
# 사용: ./check.sh [--watch]
# 순서: server test → server typecheck → client typecheck → client build

set -euo pipefail
WATCH=${1:-}
ROOT="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo -e "${YELLOW}━━━  Da Vinci Code — Dev Check  ━━━${NC}"

# ── 1. 서버 테스트 ──────────────────────────────────────────────
step "Server tests (vitest)"
if [[ "$WATCH" == "--watch" ]]; then
  cd "$ROOT/server" && pnpm test:watch
  exit 0
fi
cd "$ROOT/server" && pnpm test || fail "서버 테스트 실패"
ok "서버 테스트 통과"

# ── 2. 서버 타입체크 + 빌드 ─────────────────────────────────────
step "Server typecheck + build (tsc)"
cd "$ROOT/server" && pnpm build || fail "서버 빌드 실패"
ok "서버 빌드 통과"

# ── 3. 클라이언트 타입체크 + 빌드 ──────────────────────────────
step "Client typecheck + build (tsc + vite)"
cd "$ROOT/client" && pnpm build || fail "클라이언트 빌드 실패"
ok "클라이언트 빌드 통과"

echo -e "\n${GREEN}━━━  ALL CHECKS PASSED  ━━━${NC}\n"
