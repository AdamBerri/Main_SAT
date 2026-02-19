#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - Cloud PREAM Node Launcher
# =============================================================================
# Launches this node's share of global agents.
# Run this once per pod with a unique NODE_INDEX.
#
# Required env:
#   NODE_INDEX    0-based index of this pod
#
# Optional env:
#   NODE_COUNT       Number of pods participating (default: 6)
#   AGENT_COUNT      Total logical agents cluster-wide (default: 50)
#   MAX_ITERATIONS   Passed through to per-agent script (default: 5)
#   PREAM_SAMPLES    Passed through to per-agent script (default: 25)
#   TOPICS_FILE      Topic list file (default: cloud/topics.txt)
#
# Advanced override:
#   AGENT_OFFSET     Explicit first global agent ID for this node
#   AGENTS_ON_NODE   Explicit number of agents to run on this node
# =============================================================================

set -euo pipefail

NODE_INDEX=${NODE_INDEX:-}
NODE_COUNT=${NODE_COUNT:-6}
AGENT_COUNT=${AGENT_COUNT:-50}
MAX_ITERATIONS=${MAX_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-25}
TOPICS_FILE=${TOPICS_FILE:-cloud/topics.txt}

if [ -z "$NODE_INDEX" ]; then
  echo "ERROR: NODE_INDEX is required"
  exit 1
fi

if ! [[ "$NODE_INDEX" =~ ^[0-9]+$ && "$NODE_COUNT" =~ ^[0-9]+$ && "$AGENT_COUNT" =~ ^[0-9]+$ ]]; then
  echo "ERROR: NODE_INDEX, NODE_COUNT, and AGENT_COUNT must be integers"
  exit 1
fi

if [ "$NODE_COUNT" -lt 1 ] || [ "$NODE_INDEX" -ge "$NODE_COUNT" ]; then
  echo "ERROR: invalid NODE_INDEX=$NODE_INDEX for NODE_COUNT=$NODE_COUNT"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -x "$SCRIPT_DIR/run-pream-cloud-agent.sh" ]; then
  echo "ERROR: run-pream-cloud-agent.sh is missing or not executable"
  exit 1
fi

# Compute this node's [offset, count] unless explicitly provided
if [ -n "${AGENT_OFFSET:-}" ] && [ -n "${AGENTS_ON_NODE:-}" ]; then
  AGENT_OFFSET=${AGENT_OFFSET}
  AGENTS_ON_NODE=${AGENTS_ON_NODE}
else
  base=$((AGENT_COUNT / NODE_COUNT))
  extra=$((AGENT_COUNT % NODE_COUNT))

  if [ "$NODE_INDEX" -lt "$extra" ]; then
    AGENTS_ON_NODE=$((base + 1))
    AGENT_OFFSET=$((NODE_INDEX * (base + 1)))
  else
    AGENTS_ON_NODE=$base
    AGENT_OFFSET=$((extra * (base + 1) + (NODE_INDEX - extra) * base))
  fi
fi

echo "Node $NODE_INDEX/$NODE_COUNT launching $AGENTS_ON_NODE agent(s)"
echo "Global agent range: [$AGENT_OFFSET, $((AGENT_OFFSET + AGENTS_ON_NODE - 1))]"
echo "AGENT_COUNT=$AGENT_COUNT, MAX_ITERATIONS=$MAX_ITERATIONS, PREAM_SAMPLES=$PREAM_SAMPLES"

if [ "$AGENTS_ON_NODE" -le 0 ]; then
  echo "Nothing to launch on this node."
  exit 0
fi

pids=()
for ((local_idx = 0; local_idx < AGENTS_ON_NODE; local_idx++)); do
  global_agent_id=$((AGENT_OFFSET + local_idx))
  echo "Starting AGENT_ID=$global_agent_id"
  AGENT_ID=$global_agent_id \
  AGENT_COUNT=$AGENT_COUNT \
  MAX_ITERATIONS=$MAX_ITERATIONS \
  PREAM_SAMPLES=$PREAM_SAMPLES \
  TOPICS_FILE=$TOPICS_FILE \
  "$SCRIPT_DIR/run-pream-cloud-agent.sh" &
  pids+=($!)
done

failed=0
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    failed=$((failed + 1))
  fi
done

if [ "$failed" -gt 0 ]; then
  echo "Node launcher completed with $failed failed agent(s)"
  exit 1
fi

echo "Node launcher completed successfully"
