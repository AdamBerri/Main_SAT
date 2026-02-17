#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - PREAM Optimization Only
# =============================================================================
# Skips generation, runs PREAM optimization on existing questions, then images.
# =============================================================================

PREAM_ITERATIONS=${PREAM_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-25}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/pream_only_$TIMESTAMP.log"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

log_section() {
    echo "" | tee -a "$LOG_FILE"
    echo "============================================" | tee -a "$LOG_FILE"
    echo "$1" | tee -a "$LOG_FILE"
    echo "============================================" | tee -a "$LOG_FILE"
}

# Load env
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    log "ERROR: ANTHROPIC_API_KEY not set"
    exit 1
fi

ALL_TOPICS="
READING/Information_and_Ideas/central_ideas
READING/Information_and_Ideas/inferences
READING/Information_and_Ideas/command_of_evidence
READING/Information_and_Ideas/textual_evidence
READING/Craft_and_Structure/words_in_context
READING/Craft_and_Structure/text_structure
READING/Craft_and_Structure/cross_text_connections
READING/Craft_and_Structure/overall_purpose
READING/Expression_of_Ideas/rhetorical_synthesis
READING/Expression_of_Ideas/transitions
READING/Standard_English_Conventions/boundaries
READING/Standard_English_Conventions/form_structure_sense
MATH/Algebra/linear_equations
MATH/Algebra/linear_functions
MATH/Algebra/systems_of_equations
MATH/Algebra/linear_inequalities
MATH/Advanced_Math/equivalent_expressions
MATH/Advanced_Math/nonlinear_equations
MATH/Advanced_Math/nonlinear_functions
MATH/Problem_Solving/ratios_rates
MATH/Problem_Solving/percentages
MATH/Problem_Solving/units
MATH/Problem_Solving/data_distributions
MATH/Problem_Solving/probability
MATH/Problem_Solving/inference
MATH/Problem_Solving/evaluating_claims
MATH/Problem_Solving/two_variable_data
MATH/Geometry_Trig/area_volume
MATH/Geometry_Trig/lines_angles
MATH/Geometry_Trig/triangles
MATH/Geometry_Trig/circles
MATH/Geometry_Trig/right_triangles
"

log_section "PREAM Optimization Only (Sonnet 4.5)"
log "Skipping generation, running PREAM on existing questions"
log "Iterations per topic: $PREAM_ITERATIONS"
log "Samples per iteration: $PREAM_SAMPLES"

count=0
total=32

for topic in $ALL_TOPICS; do
    [ -z "$topic" ] && continue
    count=$((count + 1))

    log ""
    log "[$count/$total] Optimizing: $topic"

    npm run dev -- optimize -t "$topic" -i "$PREAM_ITERATIONS" -s "$PREAM_SAMPLES" 2>&1 | tee -a "$LOG_FILE" || true
done

log_section "Generating Images for All Questions"
npm run dev -- images --all 2>&1 | tee -a "$LOG_FILE" || true

log_section "COMPLETE"
log "PREAM optimization finished"
log "Log file: $LOG_FILE"
