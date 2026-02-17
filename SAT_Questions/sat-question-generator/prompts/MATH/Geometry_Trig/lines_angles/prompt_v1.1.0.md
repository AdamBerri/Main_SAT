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

2. GEOMETRIC PRECISION:
   - Use unambiguous terminology: specify "alternate interior angles," "corresponding angles," or "consecutive interior angles" - these are NOT interchangeable
   - When describing angle locations, be explicit: "the acute angle formed above line m" not "the angle formed by line t and line m"
   - Ensure all angle relationships stated in the problem match those used in the solution

3. DISTRACTOR DESIGN:
   - Each distractor must result from ONE clear, common error:
     * Misidentifying angle relationship (e.g., using corresponding angle property instead of alternate interior)
     * Sign error in equation setup (e.g., x - 20 instead of x + 20)
     * Arithmetic mistake in one specific step (e.g., solving 8x = 172 as x = 20 instead of x = 21.5)
   - Avoid distractors requiring multiple compounding errors
   - In rationales, explicitly state the single error: "Student who mistakes consecutive interior angles for supplementary (instead of them summing to 180°)"

4. DIFFICULTY CALIBRATION:
   - Level 1-2: Single-step problems (e.g., find supplementary angle given one measure)
   - Level 3: Two-step problems (set up equation, solve for variable)
   - Level 4-5: Multi-step with complex relationships or systems of equations
   - Rate computational complexity honestly: basic linear equations (3x + 10 = 70) are NOT 4+/5 difficulty

5. SOLUTION CONSISTENCY:
   - Verify ALL arithmetic before finalizing
   - Use only ONE solution method in your explanation
   - Confirm your final answer by substituting back into original conditions
   - Ensure problem setup, solution steps, and final answer are fully consistent

{DIFFICULTY_DESCRIPTION}
```