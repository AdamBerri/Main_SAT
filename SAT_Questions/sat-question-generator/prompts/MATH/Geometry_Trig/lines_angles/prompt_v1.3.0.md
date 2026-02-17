```
Generate an SAT Math question about lines, angles, and their properties.

Topics may include:
- Parallel lines cut by transversals
- Angle relationships (complementary, supplementary, vertical)
- Angle measures in geometric figures

CRITICAL REQUIREMENTS:

1. FIGURE SPECIFICATION:
   - If your question references "the figure," "the diagram," "shown above," or any specific geometric configuration, you MUST set requires_figure=true
   - Only set requires_figure=false for purely abstract questions (e.g., "Two supplementary angles have measures in the ratio 2:3")
   - If requires_figure=true, provide a detailed figure_description specifying exact angle positions, measurements, and relationships

2. GEOMETRIC PRECISION AND CONSISTENCY:
   - Use unambiguous terminology: specify "alternate interior angles," "corresponding angles," or "consecutive interior angles" - these are NOT interchangeable
   - VERIFY angle classifications match their positions: 
     * Interior angles: between the two parallel lines
     * Exterior angles: outside the two parallel lines
     * Alternate: on opposite sides of transversal
     * Consecutive/Same-side: on same side of transversal
   - When describing angle locations, be explicit: "the acute angle formed above line m on the left side of transversal t" not "the angle formed by line t and line m"
   - MANDATORY: After writing your solution, verify by substitution that your answer satisfies ALL stated conditions (parallel line properties, complementary/supplementary relationships, etc.)
   - If multiple constraints exist, solve for the variable using each constraint independently to confirm consistency before finalizing

3. ANSWER VALIDITY - MOST CRITICAL:
   - BEFORE finalizing answer choices, work through the complete solution independently
   - The correct_answer field MUST match the answer derived in your step-by-step solution
   - Common errors to check:
     * Arithmetic mistakes in final calculation
     * Copying wrong value from work to answer key
     * Confusion between variable value and final answer (e.g., finding x = 26 when question asks for 3x + 10)
   - MANDATORY FINAL CHECK: State "The answer to the question is [value] which corresponds to choice [letter]" and verify this matches your correct_answer field
   - If your solution yields a non-integer or implausible value, RESTART the problem with adjusted parameters to ensure a clean integer answer

4. DISTRACTOR DESIGN:
   - Each distractor must result from ONE clear, common error that you can execute:
     * Misidentifying angle relationship (e.g., using corresponding angle property instead of alternate interior)
     * Sign error in equation setup (e.g., x - 20 instead of x + 20)
     * Arithmetic mistake in one specific step (e.g., solving 8x = 172 as x = 20 instead of x = 21.5)
     * Confusing supplementary (sum to 180°) with complementary (sum to 90°)
   - MANDATORY: For each distractor, physically perform the error calculation to derive the value
   - Rationale format: "Student who [single specific error]: [show calculation] = [distractor value]"
   - Example: "Student who uses corresponding angles instead of alternate interior: (3x + 15) = (2x + 40), so x = 25, and 2(25) + 40 = 90"
   - Distractors must be plausible values (e.g., angle measures between 0° and 180° for standard angles)
   - Each answer choice should appear exactly once in your work (once as correct answer, three times as calculated distractors)

5. DIFFICULTY CALIBRATION (be conservative - most questions are easier than you think):
   - Level 1-2: Single-step problems (e.g., find supplementary angle given one measure; vertical angles with one variable)
   - Level 3: Two-step problems (set up one equation from angle relationship, solve for variable, substitute to find answer)
   - Level 4: Multi-step requiring two different angle relationships or solving system of two equations
   - Level 5: Complex multi-step requiring three or more distinct relationships or advanced algebraic manipulation
   - Rate computational complexity honestly: 
     * Basic linear equations like "3x + 10 = 70" or "2x = 180" → Level 2-3 maximum
     * Standard parallel line angle identification + solving → Level 3 maximum
     * Only rate 4-5 if problem requires coordinating multiple geometric theorems AND complex algebra
   - When in doubt, rate 0.5 levels lower than your first instinct

6. SOLUTION CONSISTENCY:
   - Verify ALL arithmetic before finalizing (use calculator if needed)
   - Use only ONE solution method in your explanation
   - After solving, MANDATORY VERIFICATION STEP: Substitute your answer back into ALL original conditions and confirm each is satisfied
   - Ensure problem setup, solution steps, and final answer are fully consistent
   - If verification fails, revise the problem rather than submitting an inconsistent question
   - Check that your correct_answer letter matches the choice containing your calculated answer value

7. AUTHENTIC SAT STYLE:
   - Avoid excessive complexity: use 2-3 lines maximum, not 4+ overlapping lines
   - Keep language clear and direct; avoid convoluted or circular phrasing
   - Use standard angle notation and clear geometric configurations
   - Answer choices should be well-spaced unless deliberately close to test precision (with clear pedagogical purpose)
   - Design problems with integer solutions; if your work yields decimals, adjust the problem parameters

{DIFFICULTY_DESCRIPTION}
```