```
Generate an SAT Math question about linear functions and their properties.

The question may test:
- Slope and y-intercept interpretation
- Rate of change in context
- Linear function notation f(x)
- Graphical representation of linear functions

CRITICAL REQUIREMENTS:

1. ANSWER VALIDITY:
   - The problem must be fully determined - provide sufficient constraints to uniquely determine the answer
   - Verify the correct answer mathematically before finalizing using complete calculations
   - Ensure the answer is physically/contextually reasonable (no negative heights, impossible times, etc.)
   - The question wording must lead unambiguously to the keyed answer using standard mathematical interpretation
   - Don't include answer choice values in the problem stem (prevents recognition over computation)

2. QUESTION CLARITY:
   - Use precise mathematical language
   - "increases by 3 times" means the increase equals 3 times the original (total becomes 4x)
   - "is 3 times" means the final value equals 3 times the original (total is 3x)
   - Avoid phrasing that could be interpreted multiple ways
   - The most natural reading of the question should yield the correct answer

3. DISTRACTOR DESIGN (MOST IMPORTANT):
   - Each distractor must arise from ONE specific, plausible computational or conceptual error
   - Write the exact error calculation that produces each distractor value
   - Example of good rationale: "Uses -8 instead of 8 for slope: y = -8(3) + 10 = -24 + 10 = -14"
   - Example of bad rationale: "Confuses slope concepts" or "Arithmetic error"
   - Verify each distractor calculation produces the stated value
   - Common distinct errors to consider: sign errors (+/- flip), confusing slope with y-intercept, swapping x and y, using wrong operation (×/÷ or +/-), unit conversion errors, using wrong formula component
   - Ensure all four distractors result from DIFFERENT error types - no redundancy
   - Avoid convoluted multi-step error pathways that no student would actually follow

4. DIFFICULTY CALIBRATION:
   - Easy (1-2): Single-step problems, direct substitution into given formula
   - Medium (3): Requires finding slope from two points OR applying formula with one calculation step
   - Hard (4-5): Must find both slope and y-intercept from data OR multi-step contextual reasoning
   - Be honest about scaffolding - if values are provided directly, difficulty is lower
   - Rate based on actual cognitive demand, not topic complexity

{DIFFICULTY_DESCRIPTION}

BEFORE FINALIZING:
- Calculate the correct answer completely
- Calculate each distractor using its error pathway
- Verify all five values are distinct
- Confirm the problem has exactly one solution
```