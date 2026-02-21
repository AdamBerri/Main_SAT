#!/usr/bin/env bash
# =============================================================================
# RunPod Model Server — MiniMax-M1-40k via vLLM
# =============================================================================
# Run this ON the RunPod pod after SSH-ing in.
#
# Prerequisites:
#   - 4x H200 SXM (564 GB VRAM)
#   - Volume mounted at /workspace (1200 GB recommended)
#   - HTTP port 8000 exposed in RunPod settings
#
# Usage:
#   bash runpod-serve-minimax.sh            # default: download + serve
#   bash runpod-serve-minimax.sh --dry-run  # check GPU setup only
# =============================================================================

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# ── GPU sanity check ─────────────────────────────────────────────────────────
echo "=== GPU Check ==="
nvidia-smi --query-gpu=index,name,memory.total --format=csv,noheader
GPU_COUNT=$(nvidia-smi --query-gpu=index --format=csv,noheader | wc -l | tr -d ' ')
echo "Detected $GPU_COUNT GPU(s)"

if [ "$GPU_COUNT" -lt 4 ]; then
  echo "ERROR: Need 4 GPUs for TP=4, found $GPU_COUNT"
  exit 1
fi

if $DRY_RUN; then
  echo "Dry run complete — GPUs look good."
  exit 0
fi

# ── Environment ──────────────────────────────────────────────────────────────
export HF_HOME=/workspace/huggingface
export SAFETENSORS_FAST_GPU=1
export VLLM_USE_V1=0

MODEL_ID="MiniMaxAI/MiniMax-M1-40k"
SERVED_NAME="minimax-m1"
TP_SIZE=4
MAX_LEN=4096
PORT=8000

mkdir -p "$HF_HOME"

# ── Install vLLM if missing ─────────────────────────────────────────────────
if ! command -v vllm &>/dev/null; then
  echo "=== Installing vLLM ==="
  pip install --upgrade "vllm>=0.9.2" 2>&1 | tail -5
  echo "vLLM installed: $(vllm --version 2>/dev/null || python3 -c 'import vllm; print(vllm.__version__)')"
fi

# ── Pre-download model (shows progress, resumable) ──────────────────────────
echo "=== Downloading model weights ==="
echo "Model: $MODEL_ID"
echo "Cache: $HF_HOME"
echo "This may take 20-60 min on first run. Cached on the volume for next time."
echo ""

if command -v huggingface-cli &>/dev/null; then
  huggingface-cli download "$MODEL_ID" --cache-dir "$HF_HOME" --quiet
else
  echo "(huggingface-cli not found — vLLM will download on startup)"
fi

# ── Serve ────────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  Starting vLLM server"
echo "  Model:    $MODEL_ID"
echo "  Served as: $SERVED_NAME"
echo "  TP:       $TP_SIZE"
echo "  Port:     $PORT"
echo "  Max ctx:  $MAX_LEN"
echo "============================================"
echo ""
echo "Endpoint will be: http://0.0.0.0:$PORT/v1"
echo "From your Mac, use the RunPod proxy URL:"
echo "  https://<POD_ID>-${PORT}.proxy.runpod.net/v1"
echo ""

exec vllm serve "$MODEL_ID" \
  --tensor-parallel-size "$TP_SIZE" \
  --trust-remote-code \
  --quantization experts_int8 \
  --dtype bfloat16 \
  --max-model-len "$MAX_LEN" \
  --served-model-name "$SERVED_NAME" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --download-dir "$HF_HOME"
