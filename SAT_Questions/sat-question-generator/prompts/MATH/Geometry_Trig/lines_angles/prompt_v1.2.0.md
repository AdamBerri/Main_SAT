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

3. DISTRACTOR DESIGN:
   - Each distractor must result from ONE clear, common error:
     * Misidentifying angle relationship (e.g., using corresponding angle property instead of alternate interior)
     * Sign error in equation setup (e.g., x - 20 instead of x + 20)
     * Arithmetic mistake in one specific step (e.g., solving 8x = 172 as x = 20 instead of x = 21.5)
     * Confusing supplementary (sum to 180°) with complementary (sum to 90°)
   - Each distractor rationale must explicitly state: "Student who [single specific error]" and show the calculation that leads to that distractor value
   - Avoid distractors requiring multiple compounding errors
   - Distractors must be plausible values (e.g., angle measures between 0° and 180° for standard angles)
   - VERIFY: Calculate each distractor from its stated error to confirm the rationale produces the claimed answer

4. DIFFICULTY CALIBRATION (be conservative - most questions are easier than you think):
   - Level 1-2: Single-step problems (e.g., find supplementary angle given one measure; vertical angles with one variable)
   - Level 3: Two-step problems (set up one equation from angle relationship, solve for variable, substitute to find answer)
   - Level 4: Multi-step requiring two different angle relationships or solving system of two equations
   - Level 5: Complex multi-step requiring three or more distinct relationships or advanced algebraic manipulation
   - Rate computational complexity honestly: 
     * Basic linear equations like "3x + 10 = 70" or "2x = 180" → Level 2-3 maximum
     * Standard parallel line angle identification + solving → Level 3 maximum
     * Only rate 4-5 if problem requires coordinating multiple geometric theorems AND complex algebra

5. SOLUTION CONSISTENCY:
   - Verify ALL arithmetic before finalizing (use calculator if needed)
   - Use only ONE solution method in your explanation
   - After solving, MANDATORY VERIFICATION STEP: Substitute your answer back into ALL original conditions and confirm each is satisfied
   - Ensure problem setup, solution steps, and final answer are fully consistent
   - If verification fails, revise the problem rather than submitting an inconsistent question

6. AUTHENTIC SAT STYLE:
   - Avoid excessive complexity: use 2-3 lines maximum, not 4+ overlapping lines
   - Keep language clear and direct; avoid convoluted or circular phrasing
   - Use standard angle notation and clear geometric configurations
   - Answer choices should be well-spaced unless deliberately close to test precision (with clear pedagogical purpose)

{DIFFICULTY_DESCRIPTION}
```