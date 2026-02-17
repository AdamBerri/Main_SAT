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
   - Work with EXACT values throughout - no rounding until the final answer
   - Verify ALL arithmetic at each step (addition, subtraction, multiplication, division)
   - Check that equations are internally consistent (substituting solved values back must satisfy all original equations)
   - The computed answer MUST exactly match one of your four choices
   - If the answer doesn't match choices, fix the problem numbers or setup - NEVER force-fit an incorrect answer
   - After completing the question, solve it once more independently to confirm
   - For inequality problems: verify the answer satisfies the inequality; if asking for "minimum integer," test that your answer works but one less doesn't

2. CLEAN ARITHMETIC REQUIREMENT:
   - Choose problem parameters so ALL intermediate steps yield clean integers or terminating decimals
   - Test your setup: if solving produces fractions like 23/3500, revise the numbers
   - Avoid non-terminating decimals that require rounding mid-solution
   - The path from setup to answer should involve only clean division or simple fractions that cancel
   - Examples of clean setups: rates that divide evenly, coefficients that eliminate nicely, totals that are multiples of key values

3. DISTRACTOR DESIGN:
   - Each distractor must result from EXACTLY ONE specific, isolated error
   - VERIFY each distractor by hand: Apply the claimed error to your solution step-by-step and confirm it produces that exact numerical value
   - If your error path produces 494 but you write 194, the rationale is wrong - fix it
   - If rationale says "subtracting 12 from 7 gives -5" but distractor is 5, you have a sign error - fix it
   - Valid single-error types:
     * Solving for wrong variable (if question asks for 2x, giving x)
     * One sign flip (treating +3 as -3 in one step)
     * One arithmetic error (36/4 = 8 instead of 9)
     * One misapplied operation (adding instead of subtracting once)
   - REJECT any distractor requiring chains like "forgot to add AND divided wrong"
   - Each distractor rationale must be a complete, accurate micro-solution showing how that specific error leads to that exact value

4. DIFFICULTY CALIBRATION:
   - Difficulty 1-2: These should still be SAT-worthy (require algebraic setup or interpretation), not elementary arithmetic
   - A question that reduces to 45/3=15 with no equation-building is too simple even for difficulty 1
   - Minimum bar: student must translate words into an equation or manipulate an algebraic expression
   - Rate honestly based on total cognitive load:
     * 1-2/5: Single equation, direct solving, clean integer arithmetic, obvious setup (solve 2x + 5 = 17)
     * 3/5: Two-equation system OR single equation requiring 3+ manipulations (standard substitution or elimination)
     * 4-5/5: Non-obvious setup, complex relationships, or requiring insight beyond mechanical solving
   - Clean arithmetic does NOT increase difficulty
   - A problem is only 5/5 if a significant percentage of students would not know where to start
   - When in doubt, rate conservatively (lower)

5. EXPLANATION QUALITY:
   - Write the explanation as a clean, final solution with no errors or contradictions
   - Never include phrases like "Wait," "let me recalculate," "this doesn't work," or "approximately"
   - Each line must follow logically and mathematically from the previous
   - Use EXACT arithmetic matching your verification work
   - If explanation says "m > 19.2 so m = 20" but then claims answer is 15, you have contradicted yourself - fix it
   - If explanation shows $48.86 but states answer is $48.75, you have contradicted yourself - fix the problem setup to avoid rounding
   - Show: equation setup -> step-by-step solving with exact values -> final answer verification
   - The explanation's final numerical answer must exactly match the letter choice you designate as correct

6. AUTHENTICITY:
   - Use general timeframes: "A company ships packages" not "Last Tuesday, Company X..."
   - Every expression in the problem should emerge naturally from the context
   - Don't add artificial complexity just to increase steps
   - Avoid overly specific details that don't affect the mathematics

SELF-CHECK BEFORE FINALIZING:
- I solved the problem completely with exact arithmetic and got answer ___
- This exact answer appears in my four choices
- All intermediate calculations produced clean values (no messy fractions or rounding)
- I verified each distractor by manually applying its error and confirming it produces the stated value
- Each distractor rationale's arithmetic is correct and produces its claimed value
- The difficulty rating matches actual cognitive demand and meets SAT minimum complexity
- My explanation uses exact values throughout and its final answer matches the correct choice exactly
- I re-solved the problem independently and got the same answer
