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
   - Write out your complete solution with all steps in scratch work
   - Verify ALL arithmetic at each step (addition, subtraction, multiplication, division)
   - For systems of equations: substitute your solved values back into BOTH/ALL original equations to verify they satisfy the system
   - Check that the system is properly constrained (not underdetermined - must have exactly one solution)
   - The computed answer MUST exactly match one of your four choices
   - If the answer doesn't match choices, redesign the problem numbers - NEVER adjust the answer to fit
   - After completing the question, solve it once more independently using a different method if possible

2. DISTRACTOR DESIGN:
   - Each distractor must result from EXACTLY ONE specific, isolated error applied to YOUR actual solution
   - Manually apply each error to your solution and verify it produces the exact distractor value
   - Valid single-error types:
     * Solving for wrong variable (if question asks for 2x, giving x instead)
     * One sign flip in one location (treating +3 as -3 in a single step)
     * One arithmetic error (36/4 = 8 instead of 9)
     * One misapplied operation (adding instead of subtracting in one step)
   - REJECT any distractor requiring multiple errors like "sign flip AND arithmetic mistake"
   - Each distractor rationale must clearly trace: "If student does [specific error] in [specific step], they get [this value]"
   - If you cannot produce a distractor through one realistic error, choose different problem numbers
   - Order answer choices in ascending or descending numerical order (SAT standard)

3. DIFFICULTY CALIBRATION:
   - Rate based on total cognitive load and problem-solving insight required:
     * 1-2/5: Single equation, 1-2 operations, direct solving (2x + 5 = 17 → x = 6)
     * 3/5: Standard two-equation system with straightforward elimination/substitution OR single equation with 3-4 steps
     * 4/5: Requires problem translation, non-obvious setup, or strategic insight beyond mechanical solving
     * 5/5: Multiple layers of reasoning, non-standard approach needed, or significant translation from words to math
   - Number of arithmetic steps alone does NOT increase difficulty if the path is obvious
   - Clean integer arithmetic is appropriate for ALL difficulty levels
   - Rate conservatively: if uncertain between two levels, choose the lower one

4. EXPLANATION QUALITY:
   - Write as a polished, final solution suitable for publication
   - NEVER include: "Wait," "let me recalculate," "hmm," "this doesn't work," or any debugging language
   - Structure: Setup → Step-by-step solution → Verification → Final answer
   - Each line must be mathematically correct and follow logically from the previous
   - If writing the explanation reveals errors or inconsistencies, STOP and fix the problem
   - End with explicit verification: "Checking: [substitute back into original equation(s)]"

5. AUTHENTICITY:
   - Use general, timeless contexts: "A store sells," "A rectangle has," "Two numbers satisfy"
   - Avoid unnecessary specifics: dates, company names, overly detailed scenarios
   - Every mathematical relationship must emerge naturally from the story
   - Don't artificially complicate; complexity should serve the mathematical objective

MANDATORY SELF-CHECK BEFORE FINALIZING:
□ I solved the problem completely in scratch work and got answer: ___
□ This exact answer appears in my four choices
□ I substituted my answer back into all original equations and verified it works
□ For systems: I confirmed the system has exactly one solution (properly constrained)
□ I manually tested each distractor by applying its specific error to my solution
□ Each distractor rationale clearly maps one realistic error → that distractor value
□ Answer choices are in ascending or descending order
□ The difficulty rating matches actual cognitive demand (not just step count)
□ My explanation contains no debugging language or false starts
□ My explanation is mathematically correct from start to finish
```