#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - Round-Robin PREAM Optimization
# =============================================================================
# Runs PREAM optimization with soft sync strategy:
# - All topics progress together (max 1 iteration apart)
# - Topics with lowest iteration count are prioritized
# - 10 parallel agents by default
# - No image generation (skip to avoid Google API rate limits)
# =============================================================================

PARALLEL=${PARALLEL:-10}
MAX_ITERATIONS=${MAX_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-10}
PREAM_CONVERGENCE=${PREAM_CONVERGENCE:-0.02}
PREAM_SUBAGENTS=${PREAM_SUBAGENTS:-1}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

DATA_ROOT="${PREAM_DATA_ROOT:-$SCRIPT_DIR}"
LOG_DIR="$DATA_ROOT/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAIN_LOG="$LOG_DIR/pream_roundrobin_$TIMESTAMP.log"

# Symlink for easy access
ln -sf "$MAIN_LOG" "$LOG_DIR/pream_roundrobin_main.log"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$MAIN_LOG"
}

# Load env
if [ -f "$DATA_ROOT/.env.minimax" ]; then
    set -a
    source "$DATA_ROOT/.env.minimax"
    set +a
fi
if [ -f "$DATA_ROOT/.env" ]; then
    set -a
    source "$DATA_ROOT/.env"
    set +a
fi
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Normalize local backend env aliases
if [ -n "${LLM_API_KEY:-}" ] && [ -z "${ZHIPU_API_KEY:-}" ]; then
    export ZHIPU_API_KEY="$LLM_API_KEY"
fi
if [ -n "${MINIMAX_BASE_URL:-}" ] && [ -z "${LLM_BASE_URL:-}" ]; then
    export LLM_BASE_URL="$MINIMAX_BASE_URL"
fi

# Require either hosted key or local OpenAI-compatible endpoint
if [ -z "${ZHIPU_API_KEY:-}" ] && [ -z "${LLM_BASE_URL:-}" ]; then
    log "ERROR: No LLM backend configured. Set ZHIPU_API_KEY or LLM_BASE_URL/MINIMAX_BASE_URL"
    exit 1
fi

# All 32 topics
ALL_TOPICS=(
    "READING/Information_and_Ideas/central_ideas"
    "READING/Information_and_Ideas/inferences"
    "READING/Information_and_Ideas/command_of_evidence"
    "READING/Information_and_Ideas/textual_evidence"
    "READING/Craft_and_Structure/words_in_context"
    "READING/Craft_and_Structure/text_structure"
    "READING/Craft_and_Structure/cross_text_connections"
    "READING/Craft_and_Structure/overall_purpose"
    "READING/Expression_of_Ideas/rhetorical_synthesis"
    "READING/Expression_of_Ideas/transitions"
    "READING/Standard_English_Conventions/boundaries"
    "READING/Standard_English_Conventions/form_structure_sense"
    "MATH/Algebra/linear_equations"
    "MATH/Algebra/linear_functions"
    "MATH/Algebra/systems_of_equations"
    "MATH/Algebra/linear_inequalities"
    "MATH/Advanced_Math/equivalent_expressions"
    "MATH/Advanced_Math/nonlinear_equations"
    "MATH/Advanced_Math/nonlinear_functions"
    "MATH/Problem_Solving/ratios_rates"
    "MATH/Problem_Solving/percentages"
    "MATH/Problem_Solving/units"
    "MATH/Problem_Solving/data_distributions"
    "MATH/Problem_Solving/probability"
    "MATH/Problem_Solving/inference"
    "MATH/Problem_Solving/evaluating_claims"
    "MATH/Problem_Solving/two_variable_data"
    "MATH/Geometry_Trig/area_volume"
    "MATH/Geometry_Trig/lines_angles"
    "MATH/Geometry_Trig/triangles"
    "MATH/Geometry_Trig/circles"
    "MATH/Geometry_Trig/right_triangles"
)

# Get iteration count for a topic from pream_state.json
get_iteration_count() {
    local topic=$1
    local state_file="$DATA_ROOT/prompts/$topic/pream_state.json"

    if [ -f "$state_file" ]; then
        # Extract iterations array length using grep and wc
        local count=$(grep -o '"iteration":' "$state_file" 2>/dev/null | wc -l | tr -d ' ')
        echo "$count"
    else
        echo "0"
    fi
}

# Check if topic has converged
is_converged() {
    local topic=$1
    local state_file="$DATA_ROOT/prompts/$topic/pream_state.json"

    if [ -f "$state_file" ]; then
        grep -q '"converged": true' "$state_file" && return 0
    fi
    return 1
}

# Run single iteration for a topic
run_single_iteration() {
    local topic=$1
    local topic_log="$LOG_DIR/pream_${topic//\//_}_$TIMESTAMP.log"

    echo "[$(date '+%H:%M:%S')] Starting iteration: $topic" >> "$MAIN_LOG"

    PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- optimize \
        -t "$topic" \
        -s "$PREAM_SAMPLES" \
        -c "$PREAM_CONVERGENCE" \
        --subagents "$PREAM_SUBAGENTS" \
        --single-iteration > "$topic_log" 2>&1
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "[$(date '+%H:%M:%S')] CONVERGED: $topic" >> "$MAIN_LOG"
        return 0
    elif [ $exit_code -eq 2 ]; then
        echo "[$(date '+%H:%M:%S')] ITERATION DONE: $topic" >> "$MAIN_LOG"
        return 2
    else
        echo "[$(date '+%H:%M:%S')] FAILED: $topic (exit $exit_code)" >> "$MAIN_LOG"
        return 1
    fi
}

log "============================================"
log "Round-Robin PREAM Optimization"
log "============================================"
log "Parallelism: $PARALLEL topics at a time"
log "Max iterations per topic: $MAX_ITERATIONS"
log "Samples per iteration: $PREAM_SAMPLES"
log "Convergence threshold: $PREAM_CONVERGENCE"
log "Subagents per loop: $PREAM_SUBAGENTS"
log "Data root: $DATA_ROOT"
log "Total topics: ${#ALL_TOPICS[@]}"
log "Strategy: Soft sync (max 1 iteration apart)"
log "Image generation: DISABLED"
log ""

# Main loop: continue until all topics converged or hit max iterations
round=0
while true; do
    round=$((round + 1))
    log "=== Round $round ==="

    # Build list of topics with their iteration counts
    # Format: "iteration_count:topic_path"
    TOPIC_DATA=()
    CONVERGED_COUNT=0

    for topic in "${ALL_TOPICS[@]}"; do
        if is_converged "$topic"; then
            CONVERGED_COUNT=$((CONVERGED_COUNT + 1))
        else
            iter_count=$(get_iteration_count "$topic")
            if [ "$iter_count" -lt "$MAX_ITERATIONS" ]; then
                TOPIC_DATA+=("${iter_count}:${topic}")
            else
                CONVERGED_COUNT=$((CONVERGED_COUNT + 1))
            fi
        fi
    done

    log "Converged/complete: $CONVERGED_COUNT/${#ALL_TOPICS[@]}"
    log "Pending: ${#TOPIC_DATA[@]}"

    # Check if all done
    if [ ${#TOPIC_DATA[@]} -eq 0 ]; then
        log "All topics converged or reached max iterations!"
        break
    fi

    # Sort by iteration count (lowest first) for soft sync
    IFS=$'\n' SORTED_DATA=($(printf '%s\n' "${TOPIC_DATA[@]}" | sort -t: -k1 -n))
    unset IFS

    # Extract min and max iteration counts
    min_iter=$(echo "${SORTED_DATA[0]}" | cut -d: -f1)
    max_iter=$(echo "${SORTED_DATA[-1]}" | cut -d: -f1)

    log "Iteration range: $min_iter - $max_iter"

    # For soft sync: only run topics at min_iter level if spread > 1
    BATCH_TOPICS=()
    if [ $((max_iter - min_iter)) -gt 1 ]; then
        log "Soft sync: prioritizing topics at iteration $min_iter"
        for item in "${SORTED_DATA[@]}"; do
            iter=$(echo "$item" | cut -d: -f1)
            topic=$(echo "$item" | cut -d: -f2-)
            if [ "$iter" -eq "$min_iter" ]; then
                BATCH_TOPICS+=("$topic")
            fi
        done
    else
        for item in "${SORTED_DATA[@]}"; do
            topic=$(echo "$item" | cut -d: -f2-)
            BATCH_TOPICS+=("$topic")
        done
    fi

    # Run batch of PARALLEL topics
    batch_count=0
    batch_pids=()
    batch_topics=()

    for topic in "${BATCH_TOPICS[@]}"; do
        if [ $batch_count -ge $PARALLEL ]; then
            # Wait for current batch to complete
            log "Waiting for batch: ${batch_topics[*]}"
            for pid in "${batch_pids[@]}"; do
                wait $pid 2>/dev/null
            done
            batch_pids=()
            batch_topics=()
            batch_count=0
        fi

        run_single_iteration "$topic" &
        batch_pids+=($!)
        batch_topics+=("$topic")
        batch_count=$((batch_count + 1))
    done

    # Wait for final batch
    if [ ${#batch_pids[@]} -gt 0 ]; then
        log "Waiting for batch: ${batch_topics[*]}"
        for pid in "${batch_pids[@]}"; do
            wait $pid 2>/dev/null
        done
    fi

    log "Round $round complete"
    log ""

    # Safety check: prevent infinite loop
    if [ $round -gt $((MAX_ITERATIONS * 2)) ]; then
        log "WARNING: Exceeded maximum rounds, exiting"
        break
    fi
done

log "============================================"
log "PREAM Round-Robin Optimization Complete!"
log "============================================"

# Summary
FINAL_CONVERGED=0
for topic in "${ALL_TOPICS[@]}"; do
    if is_converged "$topic"; then
        FINAL_CONVERGED=$((FINAL_CONVERGED + 1))
    fi
done

log "Final converged: $FINAL_CONVERGED/${#ALL_TOPICS[@]}"
log ""
log "NOTE: Image generation skipped. Run separately if needed:"
log "  npm run dev -- images --all"
log ""
log "All done!"
