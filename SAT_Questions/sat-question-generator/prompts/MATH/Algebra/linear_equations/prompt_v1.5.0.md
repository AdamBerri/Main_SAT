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

1. DESIGN BACKWARDS FROM CLEAN ANSWERS:
   - START by choosing your correct answer (a clean integer)
   - THEN construct the problem setup that produces this answer
   - For systems of equations: Pick values for all variables first (x=12, y=8), then create equations that work with these values
   - For difficulty 4-5: Use clean numbers throughout - complexity comes from problem structure, NOT messy arithmetic
   - After construction, verify by solving forward: you must get your predetermined answer

2. ANSWER VERIFICATION (MOST IMPORTANT):
   - SOLVE THE ENTIRE PROBLEM FIRST before finalizing the question
   - Verify ALL arithmetic at each step using a calculator if needed (36/4 = 9, not 8)
   - Check that equations are internally consistent: substitute solved values back into ALL original equations
   - The computed answer MUST exactly match one of your four choices
   - If arithmetic produces non-integers (272/19 = 14.3...), you have made an error - REDESIGN the problem
   - After completing the question, solve it once more independently to confirm
   - Verify the problem statement matches your solution (if you say "total is $328", the math must give $328)

3. DISTRACTOR DESIGN WITH PROOF:
   - Each distractor must result from EXACTLY ONE specific, mathematically traceable error
   - For each distractor, SHOW THE MATH proving the error produces that value:
     * WRONG: "Results from incorrectly setting up the system"
     * RIGHT: "If student solves for x instead of 2x: x = 15, so answer is 15 (not 30)"
     * WRONG: "Distractor B (68): Results from calculation error with 43/0.15 - 25" when 43/0.15 - 25 = 261.67
     * RIGHT: "If student calculates 43 - 25 = 18, then 18/0.15 = 120"
   - Valid single-error types:
     * Solving for wrong variable (asks for 2x, giving x; asks for x+y, giving just x)
     * One sign flip in ONE equation (2x + 3 = 11 treated as 2x - 3 = 11)
     * One arithmetic error (36/4 = 8 instead of 9, or 15 - 7 = 4 instead of 8)
     * One misapplied operation in ONE step (adding instead of subtracting once)
   - Test: Apply your claimed error to the correct solution path. Does it produce the distractor value? If not, the rationale is wrong.
   - If you cannot prove a distractor through a single realistic error, choose a different value

4. DIFFICULTY CALIBRATION (HONEST ASSESSMENT):
   - Rate based on total cognitive load, not arithmetic complexity:
     * 1-2/5: Single equation, 2-3 steps, direct solving (2x + 5 = 17, solve for x)
     * 3/5: Two-equation system with standard substitution/elimination OR single equation with 4+ manipulations
     * 4/5: Requires translating complex relationships into equations OR non-obvious variable setup
     * 5/5: Multiple conceptual leaps; significant percentage of students wouldn't know where to start
   - Messy arithmetic does NOT equal higher difficulty - use clean numbers at all difficulty levels
   - When in doubt, rate conservatively lower
   - A broken problem cannot have a meaningful difficulty rating

5. EXPLANATION QUALITY (FINAL DRAFT ONLY):
   - Write as a clean, final solution - this is what students see
   - NEVER include: "Wait," "let me recalculate," "this doesn't work," "hmm," debugging attempts
   - Each line must be mathematically correct and follow logically from the previous line
   - Never write nonsense like "240/11 x 11/11 = 24" or claim incorrect arithmetic
   - If your explanation reveals inconsistencies or requires corrections, the PROBLEM has errors - fix the problem, not the explanation
   - Structure: Setup -> Step-by-step solving -> Answer verification
   - Every equation manipulation must be valid (if you write "15 - 7 = 4", you have failed)

6. AUTHENTICITY:
   - Use general timeframes: "A company ships packages" not "Last Tuesday, Company X..."
   - Every expression should emerge naturally from the context
   - Don't add artificial complexity just to increase steps
   - Avoid overly specific details that don't affect the mathematics

SELF-CHECK BEFORE FINALIZING:
- I designed backwards: chose clean answer values first, then built equations around them
- I solved the problem completely using arithmetic verification and got answer ___
- This answer exactly matches one of my four choices
- ALL arithmetic in my solution produces clean integers (no fractions like 14.3 or 21.8)
- My problem statement numbers match my solution (if I say "$328 total", the math gives $328)
- For EACH distractor, I wrote the mathematical proof showing how the single error produces that exact value
- I tested each distractor: applying the claimed error to my solution gives that number
- My explanation contains zero rough work, corrections, or arithmetic errors (no "Wait," no "15-7=4")
- The difficulty rating matches the actual cognitive demand (not the arithmetic messiness)
