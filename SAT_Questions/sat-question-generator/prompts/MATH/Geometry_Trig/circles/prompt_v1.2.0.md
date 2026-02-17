```
Generate an SAT Math question about circles.

Topics may include:
- Circle equations in coordinate plane
- Arc length and sector area
- Central and inscribed angles
- Circle properties

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER UNIQUENESS: Verify mathematically that EXACTLY ONE answer choice is correct.
   - For "point on circle" questions: Calculate distance from center for ALL choices using √[(x-h)²+(y-k)²] and compare to radius
   - For equation problems: Substitute ALL choices into the equation and verify only one satisfies it
   - For algebraic solutions: Solve completely to find actual numerical values, then verify which answer choice matches
   - RED FLAG: If multiple choices seem correct, the problem is broken—redesign it

2. ANSWER KEY ACCURACY: 
   - Solve the problem completely BEFORE writing answer choices
   - Write down the exact numerical answer from your solution
   - Verify this exact value appears in your intended correct choice
   - For problems with constraints (e.g., "k > 0", "positive x-coordinate"), verify the answer satisfies ALL stated constraints
   - Check: Does the problem geometry make sense? (e.g., can a point with y=6 actually lie on a circle of radius 5 centered at origin?)

3. DISTRACTOR VALIDATION: Each wrong answer must be:
   - Definitively incorrect when checked against the problem (calculate the exact value each distractor produces)
   - Based on a specific, plausible error:
     * Calculation: sign error, arithmetic mistake, dropped term
     * Conceptual: wrong formula (diameter vs radius, area vs circumference)
     * Procedural: stopping mid-solution, using wrong value from problem
   - Include exact calculations in rationales (e.g., "Distance = √[(3-0)²+(4-0)²] = 5" not "approximately 3.6")
   - Numerically distinct from correct answer AND from each other
   - For coordinate problems: Distractors should yield distances/values noticeably different from the target (avoid all four points being equidistant)

4. DIFFICULTY CALIBRATION:
   - Difficulty 1-2: Direct formula application, 1-2 computational steps, standard setups
   - Difficulty 3: Multi-step solution OR one non-obvious insight; moderate computation
   - Difficulty 4-5: Combines multiple concepts, requires strategic setup, complex algebra, or non-standard approach
   - Self-check: Could an average student complete this in 1-2 minutes (diff 1-2), 2-3 minutes (diff 3), or 3+ minutes (diff 4-5)?
   - Be conservative: procedural problems with clean arithmetic are usually difficulty 2-3, not 4-5

5. EXPLANATION CLARITY:
   - Present ONE direct solution path from start to finish
   - Show all algebraic steps with specific numbers
   - For each distractor, state: "Choice X: [calculate what this gives] ≠ [required value], incorrect because [specific error]"
   - No self-corrections, no "alternatively", no uncertainty phrases
   - Verify your explanation's final answer matches your designated correct choice

6. IMAGE NECESSITY: Include "consider_image: true" only if:
   - Problem involves multiple geometric elements whose spatial relationships are complex to describe
   - Visualization would prevent ambiguity about configuration
   - Simple cases (single circle equation, one point to test, standard position) usually DON'T need images

MANDATORY PRE-SUBMISSION CHECKLIST:
☑ I solved the problem algebraically and obtained a specific numerical answer
☑ This numerical answer appears in exactly ONE answer choice
☑ I verified all four choices by substitution/calculation—only one works
☑ Each distractor's rationale includes the exact wrong value it produces
☑ The problem constraints are geometrically/algebraically possible
☑ Difficulty rating matches actual solution complexity (be conservative)
☑ My explanation contains no contradictions or corrections
```