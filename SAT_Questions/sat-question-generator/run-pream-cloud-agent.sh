#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - Cloud PREAM Agent
# =============================================================================
# Runs a deterministic shard of topics for one logical agent ID.
# Designed for distributed runs across many pods without shared locking.
#
# Required env:
#   AGENT_ID       - 0-based agent index
#
# Optional env:
#   AGENT_COUNT        Total logical agents across the whole cluster (default: 50)
#   MAX_ITERATIONS     Max PREAM iterations per topic (default: 5)
#   PREAM_SAMPLES      Samples per PREAM iteration (default: 25)
#   TOPICS_FILE        Topic list file (default: cloud/topics.txt)
#   LOOP_SLEEP_SECONDS Sleep between single-iteration calls (default: 2)
#   MAX_TOPIC_RETRIES  Retries for transient command failures (default: 2)
# =============================================================================

set -euo pipefail

AGENT_ID=${AGENT_ID:-}
AGENT_COUNT=${AGENT_COUNT:-50}
MAX_ITERATIONS=${MAX_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-25}
TOPICS_FILE=${TOPICS_FILE:-cloud/topics.txt}
LOOP_SLEEP_SECONDS=${LOOP_SLEEP_SECONDS:-2}
MAX_TOPIC_RETRIES=${MAX_TOPIC_RETRIES:-2}

if [ -z "$AGENT_ID" ]; then
  echo "ERROR: AGENT_ID is required (0-based)"
  exit 1
fi

if ! [[ "$AGENT_ID" =~ ^[0-9]+$ && "$AGENT_COUNT" =~ ^[0-9]+$ ]]; then
  echo "ERROR: AGENT_ID and AGENT_COUNT must be integers"
  exit 1
fi

if [ "$AGENT_COUNT" -lt 1 ] || [ "$AGENT_ID" -ge "$AGENT_COUNT" ]; then
  echo "ERROR: invalid AGENT_ID=$AGENT_ID for AGENT_COUNT=$AGENT_COUNT"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_DIR="$SCRIPT_DIR/logs/cloud_agents"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAIN_LOG="$LOG_DIR/agent_${AGENT_ID}_$TIMESTAMP.log"
ln -sf "$MAIN_LOG" "$LOG_DIR/agent_${AGENT_ID}_latest.log"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [agent $AGENT_ID] $1"
  echo "$msg" | tee -a "$MAIN_LOG"
}

# Load .env if available
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Normalize alias env vars
if [ -n "${MINIMAX_BASE_URL:-}" ] && [ -z "${LLM_BASE_URL:-}" ]; then
  export LLM_BASE_URL="$MINIMAX_BASE_URL"
fi
if [ -n "${LLM_API_KEY:-}" ] && [ -z "${ZHIPU_API_KEY:-}" ]; then
  export ZHIPU_API_KEY="$LLM_API_KEY"
fi

select_key_for_agent() {
  local keys=()

  if [ -n "${ZHIPU_API_KEY:-}" ]; then
    keys+=("$ZHIPU_API_KEY")
  fi

  # Pick up ZHIPU_API_KEY_2..ZHIPU_API_KEY_99 when provided
  for i in $(seq 2 99); do
    local var="ZHIPU_API_KEY_$i"
    local val="${!var:-}"
    if [ -n "$val" ]; then
      keys+=("$val")
    fi
  done

  if [ "${#keys[@]}" -gt 0 ]; then
    local key_index=$((AGENT_ID % ${#keys[@]}))
    export ZHIPU_API_KEY="${keys[$key_index]}"
    log "Using API key slot $((key_index + 1))/${#keys[@]} for this agent"
  else
    log "No API keys detected; expecting keyless local backend via LLM_BASE_URL"
  fi
}

select_key_for_agent

if [ -z "${ZHIPU_API_KEY:-}" ] && [ -z "${LLM_BASE_URL:-}" ]; then
  log "ERROR: No LLM backend configured. Set ZHIPU_API_KEY or LLM_BASE_URL/MINIMAX_BASE_URL"
  exit 1
fi

if [ ! -f "$TOPICS_FILE" ]; then
  log "ERROR: Topics file not found: $TOPICS_FILE"
  exit 1
fi

mapfile -t RAW_TOPICS < "$TOPICS_FILE"
TOPICS=()
for raw in "${RAW_TOPICS[@]}"; do
  topic="$(echo "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  if [ -n "$topic" ] && [[ ! "$topic" =~ ^# ]]; then
    TOPICS+=("$topic")
  fi
done

if [ "${#TOPICS[@]}" -eq 0 ]; then
  log "ERROR: no topics loaded from $TOPICS_FILE"
  exit 1
fi

TOPIC_COUNT=${#TOPICS[@]}
ACTIVE_AGENTS=$AGENT_COUNT
if [ "$ACTIVE_AGENTS" -gt "$TOPIC_COUNT" ]; then
  ACTIVE_AGENTS=$TOPIC_COUNT
fi

if [ "$AGENT_ID" -ge "$ACTIVE_AGENTS" ]; then
  log "No work assigned (AGENT_ID=$AGENT_ID >= ACTIVE_AGENTS=$ACTIVE_AGENTS for $TOPIC_COUNT topics)"
  exit 0
fi

ASSIGNED_TOPICS=()
for i in "${!TOPICS[@]}"; do
  if [ $((i % ACTIVE_AGENTS)) -eq "$AGENT_ID" ]; then
    ASSIGNED_TOPICS+=("${TOPICS[$i]}")
  fi
done

if [ "${#ASSIGNED_TOPICS[@]}" -eq 0 ]; then
  log "No topics assigned after sharding"
  exit 0
fi

log "Starting cloud agent"
log "Topics in pool: $TOPIC_COUNT, active agents: $ACTIVE_AGENTS, assigned: ${#ASSIGNED_TOPICS[@]}"
log "MAX_ITERATIONS=$MAX_ITERATIONS, PREAM_SAMPLES=$PREAM_SAMPLES"
log "Assigned topics: ${ASSIGNED_TOPICS[*]}"

get_iteration_count() {
  local topic=$1
  local state_file="$SCRIPT_DIR/prompts/$topic/pream_state.json"
  if [ -f "$state_file" ]; then
    grep -o '"iteration":' "$state_file" 2>/dev/null | wc -l | tr -d ' '
  else
    echo "0"
  fi
}

is_converged() {
  local topic=$1
  local state_file="$SCRIPT_DIR/prompts/$topic/pream_state.json"
  if [ -f "$state_file" ]; then
    grep -q '"converged": true' "$state_file" && return 0
  fi
  return 1
}

run_topic() {
  local topic=$1
  local retries=0

  while true; do
    if is_converged "$topic"; then
      log "[$topic] converged"
      return 0
    fi

    local iter_count
    iter_count=$(get_iteration_count "$topic")
    if [ "$iter_count" -ge "$MAX_ITERATIONS" ]; then
      log "[$topic] reached max iterations ($iter_count/$MAX_ITERATIONS)"
      return 0
    fi

    log "[$topic] running single iteration $((iter_count + 1))"
    set +e
    npm run dev -- optimize -t "$topic" -i "$MAX_ITERATIONS" -s "$PREAM_SAMPLES" --single-iteration >> "$MAIN_LOG" 2>&1
    local exit_code=$?
    set -e

    if [ $exit_code -eq 0 ]; then
      log "[$topic] converged during this iteration"
      return 0
    fi

    if [ $exit_code -eq 2 ]; then
      log "[$topic] iteration complete, continuing"
      sleep "$LOOP_SLEEP_SECONDS"
      continue
    fi

    retries=$((retries + 1))
    log "[$topic] iteration failed (exit $exit_code), retry $retries/$MAX_TOPIC_RETRIES"
    if [ "$retries" -gt "$MAX_TOPIC_RETRIES" ]; then
      log "[$topic] giving up after retries"
      return 1
    fi
    sleep "$LOOP_SLEEP_SECONDS"
  done
}

FAILED=0
for topic in "${ASSIGNED_TOPICS[@]}"; do
  if ! run_topic "$topic"; then
    FAILED=$((FAILED + 1))
  fi
done

if [ "$FAILED" -gt 0 ]; then
  log "Completed with $FAILED failed topic(s)"
  exit 1
fi

log "Completed successfully"
