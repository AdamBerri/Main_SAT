#!/bin/bash
# Generate 5 questions per topic for testing
# Usage: ./run-batch-5.sh

set -e

TOPICS=(
  # READING - Information_and_Ideas (4)
  "READING/Information_and_Ideas/central_ideas"
  "READING/Information_and_Ideas/inferences"
  "READING/Information_and_Ideas/command_of_evidence"
  "READING/Information_and_Ideas/textual_evidence"

  # READING - Craft_and_Structure (4)
  "READING/Craft_and_Structure/words_in_context"
  "READING/Craft_and_Structure/text_structure"
  "READING/Craft_and_Structure/cross_text_connections"
  "READING/Craft_and_Structure/overall_purpose"

  # READING - Expression_of_Ideas (2)
  "READING/Expression_of_Ideas/rhetorical_synthesis"
  "READING/Expression_of_Ideas/transitions"

  # READING - Standard_English_Conventions (2)
  "READING/Standard_English_Conventions/boundaries"
  "READING/Standard_English_Conventions/form_structure_sense"

  # MATH - Algebra (4)
  "MATH/Algebra/linear_equations"
  "MATH/Algebra/linear_functions"
  "MATH/Algebra/systems_of_equations"
  "MATH/Algebra/linear_inequalities"

  # MATH - Advanced_Math (3)
  "MATH/Advanced_Math/equivalent_expressions"
  "MATH/Advanced_Math/nonlinear_equations"
  "MATH/Advanced_Math/nonlinear_functions"

  # MATH - Problem_Solving (8)
  "MATH/Problem_Solving/ratios_rates"
  "MATH/Problem_Solving/percentages"
  "MATH/Problem_Solving/units"
  "MATH/Problem_Solving/data_distributions"
  "MATH/Problem_Solving/probability"
  "MATH/Problem_Solving/inference"
  "MATH/Problem_Solving/evaluating_claims"
  "MATH/Problem_Solving/two_variable_data"

  # MATH - Geometry_Trig (5)
  "MATH/Geometry_Trig/area_volume"
  "MATH/Geometry_Trig/lines_angles"
  "MATH/Geometry_Trig/triangles"
  "MATH/Geometry_Trig/circles"
  "MATH/Geometry_Trig/right_triangles"
)

COUNT=5
TOTAL=${#TOPICS[@]}
CURRENT=0

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Batch Generation: $COUNT questions per topic              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Topics: $TOTAL"
echo "Total questions to generate: $((TOTAL * COUNT))"
echo ""

for topic in "${TOPICS[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo "[$CURRENT/$TOTAL] Generating $COUNT questions for: $topic"
  npm run dev -- generate -t "$topic" -c "$COUNT" 2>&1 | tail -3
  echo ""
done

echo "═══════════════════════════════════════════════════════════════"
echo "                     BATCH COMPLETE                            "
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Generated $((TOTAL * COUNT)) questions across $TOTAL topics."
echo ""
echo "Next steps:"
echo "  1. cd /Users/berri/Desktop/initial_claude_work/sat-prep-app"
echo "  2. node scripts/transform-generator-questions.mjs --passing-only"
echo "  3. npm run import:questions generator-import.json"
