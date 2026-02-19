#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - Parallel PREAM Optimization
# =============================================================================
# Runs multiple PREAM optimizations in parallel (8 at a time by default)
# Skips topics that have already converged
# =============================================================================

PARALLEL=${PARALLEL:-8}
PREAM_ITERATIONS=${PREAM_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-25}
PREAM_CONVERGENCE=${PREAM_CONVERGENCE:-0.02}
PREAM_SUBAGENTS=${PREAM_SUBAGENTS:-1}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

DATA_ROOT="${PREAM_DATA_ROOT:-$SCRIPT_DIR}"
LOG_DIR="$DATA_ROOT/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAIN_LOG="$LOG_DIR/pream_parallel_$TIMESTAMP.log"

# Symlink for easy access
ln -sf "$MAIN_LOG" "$LOG_DIR/pream_parallel_main.log"

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

# Check if topic has already converged
is_converged() {
    local topic=$1
    local state_file="$DATA_ROOT/prompts/$topic/pream_state.json"
    if [ -f "$state_file" ]; then
        grep -q '"converged": true' "$state_file" && return 0
    fi
    return 1
}

# Filter out already-converged topics
PENDING_TOPICS=()
SKIPPED=0
for topic in "${ALL_TOPICS[@]}"; do
    if is_converged "$topic"; then
        SKIPPED=$((SKIPPED + 1))
    else
        PENDING_TOPICS+=("$topic")
    fi
done

log "============================================"
log "Parallel PREAM Optimization (Sonnet 4.5)"
log "============================================"
log "Parallelism: $PARALLEL topics at a time"
log "Iterations per topic: $PREAM_ITERATIONS"
log "Samples per iteration: $PREAM_SAMPLES"
log "Convergence threshold: $PREAM_CONVERGENCE"
log "Subagents per loop: $PREAM_SUBAGENTS"
log "Data root: $DATA_ROOT"
log "Total topics: ${#ALL_TOPICS[@]}"
log "Already converged (skipping): $SKIPPED"
log "Remaining to optimize: ${#PENDING_TOPICS[@]}"
log ""

if [ ${#PENDING_TOPICS[@]} -eq 0 ]; then
    log "All topics already converged! Nothing to do."
    exit 0
fi

# Function to run optimization for a single topic
optimize_topic() {
    local topic=$1
    local topic_log="$LOG_DIR/pream_${topic//\//_}_$TIMESTAMP.log"

    echo "[$(date '+%H:%M:%S')] Starting: $topic" >> "$MAIN_LOG"

    PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- optimize \
        -t "$topic" \
        -i "$PREAM_ITERATIONS" \
        -s "$PREAM_SAMPLES" \
        -c "$PREAM_CONVERGENCE" \
        --subagents "$PREAM_SUBAGENTS" > "$topic_log" 2>&1
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "[$(date '+%H:%M:%S')] DONE: $topic" >> "$MAIN_LOG"
    else
        echo "[$(date '+%H:%M:%S')] FAILED: $topic (exit $exit_code)" >> "$MAIN_LOG"
    fi
}

# Run in batches of $PARALLEL
total=${#PENDING_TOPICS[@]}
completed=0

for ((i=0; i<total; i+=PARALLEL)); do
    batch_pids=()
    batch_topics=()

    # Start batch
    for ((j=0; j<PARALLEL && i+j<total; j++)); do
        topic="${PENDING_TOPICS[$((i+j))]}"
        batch_topics+=("$topic")
        optimize_topic "$topic" &
        batch_pids+=($!)
    done

    log "Started batch: ${batch_topics[*]}"

    # Wait for batch to complete
    for pid in "${batch_pids[@]}"; do
        wait $pid
    done

    completed=$((completed + ${#batch_topics[@]}))
    log "Batch complete. Progress: $completed/$total topics"
    log ""
done

log "============================================"
log "PREAM Optimization Complete!"
log "============================================"

# Generate images
log "Generating images for all questions..."
PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- images --all >> "$MAIN_LOG" 2>&1

log "All done!"
