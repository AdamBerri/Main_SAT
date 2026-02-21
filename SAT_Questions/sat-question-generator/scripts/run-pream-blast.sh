#!/usr/bin/env bash
# =============================================================================
# PREAM Blast Runner — Local Mac → Remote RunPod
# =============================================================================
# Runs ALL 32 topics in parallel from your Mac, pointing at a remote
# vLLM endpoint on RunPod.
#
# Usage:
#   ./scripts/run-pream-blast.sh <RUNPOD_ENDPOINT_URL>
#
# Example:
#   ./scripts/run-pream-blast.sh https://abc123def-8000.proxy.runpod.net/v1
#
# What this does:
#   - 32 agents (one per topic), each with 5 internal subagents
#   - All hitting the remote MiniMax-M1 endpoint in parallel
#   - 12 max iterations, 25 samples/iteration, 0.005 convergence
#   - All data stays in experiments/minimax_pream_loops_v1/
# =============================================================================

set -euo pipefail

ENDPOINT="${1:-}"

if [ -z "$ENDPOINT" ]; then
  echo "Usage: $0 <RUNPOD_ENDPOINT_URL>"
  echo ""
  echo "Example:"
  echo "  $0 https://abc123def-8000.proxy.runpod.net/v1"
  echo ""
  echo "Get the URL from RunPod → your pod → Connect → HTTP Port 8000"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
EXPERIMENT_DIR="$PROJECT_DIR/experiments/minimax_pream_loops_v1"

cd "$PROJECT_DIR"

# ── Verify endpoint is reachable ─────────────────────────────────────────────
echo "=== Checking endpoint ==="
echo "URL: $ENDPOINT"

HEALTH_URL="${ENDPOINT%/v1}/health"
if curl -sf --connect-timeout 10 "$HEALTH_URL" > /dev/null 2>&1; then
  echo "Endpoint is healthy!"
elif curl -sf --connect-timeout 10 "${ENDPOINT}/models" > /dev/null 2>&1; then
  echo "Endpoint is responding!"
else
  echo "WARNING: Endpoint not reachable yet. The model may still be loading."
  echo "You can wait, or press Ctrl+C and retry once the model is ready."
  echo ""
  read -p "Continue anyway? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy] ]]; then
    exit 1
  fi
fi

# ── Build ────────────────────────────────────────────────────────────────────
echo ""
echo "=== Building project ==="
npm run build

# ── Verify experiment data exists ────────────────────────────────────────────
if [ ! -d "$EXPERIMENT_DIR/prompts" ]; then
  echo "ERROR: Experiment directory not found: $EXPERIMENT_DIR/prompts"
  echo "Run: npm run setup:minimax-experiment"
  exit 1
fi

# ── Configure environment ────────────────────────────────────────────────────
export LLM_BASE_URL="$ENDPOINT"
export LLM_API_KEY="not-needed"
export LLM_MODEL="minimax-m1"
export GENERATION_MODEL="minimax-m1"
export EVALUATION_MODEL="minimax-m1"
export PREAM_DATA_ROOT="$EXPERIMENT_DIR"
export PREAM_SUBAGENTS=5
export PREAM_CONVERGENCE=0.005
export PREAM_SAMPLES=25
export MAX_ITERATIONS=12

# ── Launch ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  PREAM Blast Mode"
echo "============================================"
echo "  Endpoint:      $ENDPOINT"
echo "  Topics:        32"
echo "  Agents:        32 (one per topic)"
echo "  Subagents:     $PREAM_SUBAGENTS per agent"
echo "  Samples:       $PREAM_SAMPLES per iteration"
echo "  Max iters:     $MAX_ITERATIONS"
echo "  Convergence:   $PREAM_CONVERGENCE"
echo "  Data root:     $EXPERIMENT_DIR"
echo "============================================"
echo ""
echo "Starting in 3 seconds... (Ctrl+C to cancel)"
sleep 3

# Single node, 32 agents = one agent per topic, max parallelism
NODE_INDEX=0 \
NODE_COUNT=1 \
AGENT_COUNT=32 \
  ./run-pream-cloud-node.sh 2>&1 | tee "$EXPERIMENT_DIR/logs/blast_$(date +%Y%m%d_%H%M%S).log"
