#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_DIR="/Users/berri/Desktop/initial_claude_work/SAT_Questions/sat-question-generator"

if [ -f "$SCRIPT_DIR/.env.minimax" ]; then
  set -a
  source "$SCRIPT_DIR/.env.minimax"
  set +a
fi

PREAM_DATA_ROOT="$SCRIPT_DIR" \
PREAM_SUBAGENTS="${PREAM_SUBAGENTS:-5}" \
PREAM_CONVERGENCE="${PREAM_CONVERGENCE:-0.005}" \
MAX_ITERATIONS="${MAX_ITERATIONS:-12}" \
PREAM_SAMPLES="${PREAM_SAMPLES:-25}" \
PARALLEL="${PARALLEL:-32}" \
"$PROJECT_DIR/run-pream-roundrobin.sh"
