```
Generate an SAT Math question involving linear equations in one or two variables.

The question should:
- Present a real-world scenario or abstract problem involving linear equations
- Require solving for a variable or finding a specific value
- Use appropriate difficulty-level complexity

Include:
- Clear problem setup with necessary constraints
- Realistic numbers and contexts
- Unambiguous solution path

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER VERIFICATION (MOST IMPORTANT):
   - SOLVE THE ENTIRE PROBLEM FIRST before writing the question
   - Verify ALL arithmetic at each step (addition, subtraction, multiplication, division)
   - Check that equations are internally consistent (substituting solved values back must satisfy all original equations)
   - The computed answer MUST exactly match one of your four choices
   - If the answer doesn't match choices, fix the problem numbers or setup - NEVER force-fit an incorrect answer
   - After completing the question, solve it once more independently to confirm

2. DISTRACTOR DESIGN:
   - Each distractor must result from EXACTLY ONE specific, isolated error
   - Test each distractor: Apply the claimed error to your solution and verify it produces that exact numerical value
   - Valid single-error types:
     * Solving for wrong variable (if question asks for 2x, giving x)
     * One sign flip (treating +3 as -3 in one step)
     * One arithmetic error (36/4 = 8 instead of 9)
     * One misapplied operation (adding instead of subtracting once)
   - REJECT any distractor that requires chains like "forgot to add AND divided wrong"
   - If you cannot produce a distractor value through a single realistic error, choose a different value

3. DIFFICULTY CALIBRATION:
   - Rate honestly based on total cognitive load, not just number of steps:
     * 1-2/5: Single equation, direct solving, clean integer arithmetic (solve 2x + 5 = 17)
     * 3/5: Two-equation system OR single equation requiring 3+ manipulations (standard substitution or elimination)
     * 4-5/5: Non-obvious setup, complex relationships, or requiring insight beyond mechanical solving
   - Clean arithmetic does NOT increase difficulty
   - A problem is only 5/5 if a significant percentage of students would not know where to start
   - When in doubt, rate conservatively (lower)

4. EXPLANATION QUALITY:
   - Write the explanation as a clean, final solution - no rough work
   - Never include phrases like "Wait," "let me recalculate," or "this doesn't work"
   - Each line must follow logically and mathematically from the previous
   - If your explanation reveals inconsistencies, the problem has errors - fix them
   - Show: equation setup → step-by-step solving → final answer verification

5. AUTHENTICITY:
   - Use general timeframes: "A company ships packages" not "Last Tuesday, Company X..."
   - Every expression in the problem should emerge naturally from the context
   - Don't add artificial complexity just to increase steps
   - Avoid overly specific details that don't affect the mathematics

SELF-CHECK BEFORE FINALIZING:
□ I solved the problem completely and got answer ___ 
□ This answer appears in my four choices
□ I verified each distractor by applying its claimed error to my solution
□ The difficulty rating matches the actual cognitive demand
□ My explanation reads as a clean, error-free solution path
```