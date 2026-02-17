#!/bin/bash
# Generate 5 questions per topic - ALL TOPICS IN PARALLEL
# Usage: ./run-batch-5-parallel.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Parallel Batch Generation: 5 questions per topic        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Starting 32 topics in parallel..."
echo ""

# Run all topics in parallel
npm run dev -- generate -t "READING/Information_and_Ideas/central_ideas" -c 5 &
npm run dev -- generate -t "READING/Information_and_Ideas/inferences" -c 5 &
npm run dev -- generate -t "READING/Information_and_Ideas/command_of_evidence" -c 5 &
npm run dev -- generate -t "READING/Information_and_Ideas/textual_evidence" -c 5 &
npm run dev -- generate -t "READING/Craft_and_Structure/words_in_context" -c 5 &
npm run dev -- generate -t "READING/Craft_and_Structure/text_structure" -c 5 &
npm run dev -- generate -t "READING/Craft_and_Structure/cross_text_connections" -c 5 &
npm run dev -- generate -t "READING/Craft_and_Structure/overall_purpose" -c 5 &
npm run dev -- generate -t "READING/Expression_of_Ideas/rhetorical_synthesis" -c 5 &
npm run dev -- generate -t "READING/Expression_of_Ideas/transitions" -c 5 &
npm run dev -- generate -t "READING/Standard_English_Conventions/boundaries" -c 5 &
npm run dev -- generate -t "READING/Standard_English_Conventions/form_structure_sense" -c 5 &
npm run dev -- generate -t "MATH/Algebra/linear_equations" -c 5 &
npm run dev -- generate -t "MATH/Algebra/linear_functions" -c 5 &
npm run dev -- generate -t "MATH/Algebra/systems_of_equations" -c 5 &
npm run dev -- generate -t "MATH/Algebra/linear_inequalities" -c 5 &
npm run dev -- generate -t "MATH/Advanced_Math/equivalent_expressions" -c 5 &
npm run dev -- generate -t "MATH/Advanced_Math/nonlinear_equations" -c 5 &
npm run dev -- generate -t "MATH/Advanced_Math/nonlinear_functions" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/ratios_rates" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/percentages" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/units" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/data_distributions" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/probability" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/inference" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/evaluating_claims" -c 5 &
npm run dev -- generate -t "MATH/Problem_Solving/two_variable_data" -c 5 &
npm run dev -- generate -t "MATH/Geometry_Trig/area_volume" -c 5 &
npm run dev -- generate -t "MATH/Geometry_Trig/lines_angles" -c 5 &
npm run dev -- generate -t "MATH/Geometry_Trig/triangles" -c 5 &
npm run dev -- generate -t "MATH/Geometry_Trig/circles" -c 5 &
npm run dev -- generate -t "MATH/Geometry_Trig/right_triangles" -c 5 &

echo "All 32 topics started. Waiting for completion..."
wait

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                     BATCH COMPLETE                            "
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Check generated/ directory for results."
