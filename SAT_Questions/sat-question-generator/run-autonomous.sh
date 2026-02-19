#!/usr/bin/env bash
# =============================================================================
# SAT Question Generator - Fully Autonomous Runner
# =============================================================================
# This script runs generation + PREAM optimization for ALL topics continuously.
# You can start this and go play basketball - it handles everything.
#
# Usage:
#   ./run-autonomous.sh                    # Run with defaults
#   ./run-autonomous.sh --rounds 3         # Run 3 full optimization rounds
#   ./run-autonomous.sh --questions 20     # Generate 20 questions per topic
#   ./run-autonomous.sh --iterations 10    # Max 10 PREAM iterations per topic
#
# =============================================================================

# =============================================================================
# Configuration (override with command line args)
# =============================================================================

QUESTIONS_PER_TOPIC=${QUESTIONS_PER_TOPIC:-10}
PREAM_ITERATIONS=${PREAM_ITERATIONS:-5}
PREAM_SAMPLES=${PREAM_SAMPLES:-20}
PREAM_CONVERGENCE=${PREAM_CONVERGENCE:-0.02}
PREAM_SUBAGENTS=${PREAM_SUBAGENTS:-1}
OPTIMIZATION_ROUNDS=${OPTIMIZATION_ROUNDS:-2}
CONTINUE_ON_ERROR=${CONTINUE_ON_ERROR:-true}

# Directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR"
DATA_ROOT="${PREAM_DATA_ROOT:-$SCRIPT_DIR}"

# Logging
LOG_DIR="$DATA_ROOT/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/autonomous_run_$TIMESTAMP.log"
SUMMARY_FILE="$LOG_DIR/summary_$TIMESTAMP.txt"

# Error tracking
ERROR_COUNT=0
ERROR_LOG="$LOG_DIR/errors_$TIMESTAMP.txt"
touch "$ERROR_LOG"

# =============================================================================
# Parse Command Line Arguments
# =============================================================================

while [ $# -gt 0 ]; do
    case $1 in
        --rounds)
            OPTIMIZATION_ROUNDS="$2"
            shift 2
            ;;
        --questions)
            QUESTIONS_PER_TOPIC="$2"
            shift 2
            ;;
        --iterations)
            PREAM_ITERATIONS="$2"
            shift 2
            ;;
        --samples)
            PREAM_SAMPLES="$2"
            shift 2
            ;;
        --stop-on-error)
            CONTINUE_ON_ERROR=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rounds N       Number of full optimization rounds (default: 2)"
            echo "  --questions N    Questions to generate per topic (default: 10)"
            echo "  --iterations N   Max PREAM iterations per topic (default: 5)"
            echo "  --samples N      Samples per PREAM iteration (default: 20)"
            echo "  --stop-on-error  Stop on first error (default: continue)"
            echo "  --help           Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# All 32 SAT Topics
# =============================================================================

READING_TOPICS="
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
"

MATH_TOPICS="
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

ALL_TOPICS="$READING_TOPICS $MATH_TOPICS"

# =============================================================================
# Helper Functions
# =============================================================================

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

check_env() {
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

    if [ -z "${ZHIPU_API_KEY:-}" ] && [ -z "${LLM_BASE_URL:-}" ]; then
        log "ERROR: No LLM backend configured. Set ZHIPU_API_KEY or LLM_BASE_URL/MINIMAX_BASE_URL."
        exit 1
    fi

    if [ -n "${LLM_BASE_URL:-}" ]; then
        log "Environment check passed - local backend configured at $LLM_BASE_URL"
    else
        log "Environment check passed - hosted API key loaded"
    fi
}

# =============================================================================
# Main Functions
# =============================================================================

generate_all() {
    log_section "PHASE 1: Generating Questions for All Topics"
    log "Generating $QUESTIONS_PER_TOPIC questions per topic..."

    if PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- generate --all -c "$QUESTIONS_PER_TOPIC" 2>&1 | tee -a "$LOG_FILE"; then
        log "Batch generation complete!"
        return 0
    else
        log "Batch generation had errors (continuing...)"
        echo "generate --all" >> "$ERROR_LOG"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        return 1
    fi
}

optimize_topic() {
    local topic="$1"
    log "Optimizing: $topic"

    if PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- optimize \
        -t "$topic" \
        -i "$PREAM_ITERATIONS" \
        -s "$PREAM_SAMPLES" \
        -c "$PREAM_CONVERGENCE" \
        --subagents "$PREAM_SUBAGENTS" 2>&1 | tee -a "$LOG_FILE"; then
        log "Successfully optimized: $topic"
        return 0
    else
        log "Failed to optimize: $topic"
        echo "optimize: $topic" >> "$ERROR_LOG"
        ERROR_COUNT=$((ERROR_COUNT + 1))

        if [ "$CONTINUE_ON_ERROR" = "false" ]; then
            return 1
        fi
        return 0
    fi
}

optimize_all_topics() {
    log_section "PHASE 2: Running PREAM Optimization on All Topics"

    local count=0
    local total=32

    for topic in $ALL_TOPICS; do
        # Skip empty lines
        [ -z "$topic" ] && continue

        count=$((count + 1))
        log ""
        log "[$count/$total] Processing: $topic"
        optimize_topic "$topic"
    done

    log ""
    log "Optimization phase complete"
}

generate_images_for_all() {
    log_section "PHASE 3: Generating Images for All Questions"
    log "Generating images for questions that need them (both Reading and Math)..."

    # Use the --all flag to process all topics at once
    PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- images --all 2>&1 | tee -a "$LOG_FILE" || true

    log "Image generation complete"
}

show_stats() {
    log_section "STATISTICS"
    PREAM_DATA_ROOT="$DATA_ROOT" npm run dev -- stats 2>&1 | tee -a "$LOG_FILE" || true
}

write_summary() {
    log_section "FINAL SUMMARY"

    {
        echo "SAT Question Generator - Autonomous Run Summary"
        echo "================================================"
        echo ""
        echo "Run started: $TIMESTAMP"
        echo "Run completed: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "Configuration:"
        echo "  Questions per topic: $QUESTIONS_PER_TOPIC"
        echo "  PREAM iterations: $PREAM_ITERATIONS"
        echo "  PREAM samples: $PREAM_SAMPLES"
        echo "  PREAM convergence: $PREAM_CONVERGENCE"
        echo "  PREAM subagents: $PREAM_SUBAGENTS"
        echo "  Optimization rounds: $OPTIMIZATION_ROUNDS"
        echo ""
        echo "Topics processed: 32"
        echo "Errors encountered: $ERROR_COUNT"

        if [ -s "$ERROR_LOG" ]; then
            echo ""
            echo "Errors:"
            while read -r line; do
                echo "  - $line"
            done < "$ERROR_LOG"
        fi

        echo ""
        echo "Full log: $LOG_FILE"
    } | tee "$SUMMARY_FILE"

    log "Summary written to: $SUMMARY_FILE"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    log_section "SAT Question Generator - Autonomous Run"
    log "Starting at: $(date)"
    log ""
    log "Configuration:"
    log "  Questions per topic: $QUESTIONS_PER_TOPIC"
    log "  PREAM iterations: $PREAM_ITERATIONS"
    log "  PREAM samples: $PREAM_SAMPLES"
    log "  PREAM convergence: $PREAM_CONVERGENCE"
    log "  PREAM subagents: $PREAM_SUBAGENTS"
    log "  Optimization rounds: $OPTIMIZATION_ROUNDS"
    log "  Continue on error: $CONTINUE_ON_ERROR"
    log "  Data root: $DATA_ROOT"
    log "  Log file: $LOG_FILE"
    log ""

    # Check environment
    check_env

    # Run optimization rounds
    for round in $(seq 1 $OPTIMIZATION_ROUNDS); do
        log_section "OPTIMIZATION ROUND $round of $OPTIMIZATION_ROUNDS"

        # Phase 1: Generate
        generate_all

        # Phase 2: Optimize each topic
        optimize_all_topics

        # Phase 3: Generate images for all questions that need them
        generate_images_for_all

        # Show current stats
        show_stats

        log ""
        log "Round $round complete!"
        log ""
    done

    # Final summary
    write_summary

    log ""
    log "All done! Go check the results."
    log "Generated questions are in: $SCRIPT_DIR/generated/"
    log ""
}

# Run main
main "$@"
