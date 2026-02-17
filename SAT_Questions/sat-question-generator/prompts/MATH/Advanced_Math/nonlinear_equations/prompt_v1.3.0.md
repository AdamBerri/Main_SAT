```
Generate an SAT Math question involving nonlinear equations.

This may include:
- Quadratic equations (factoring, quadratic formula, completing the square)
- Radical equations
- Rational equations
- Absolute value equations

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER VERIFICATION (MOST IMPORTANT):
   - MANDATORY VERIFICATION PROTOCOL:
     a) After solving, substitute your answer back into the ORIGINAL EQUATION (not simplified forms)
     b) Calculate BOTH sides completely - show "LHS = [value], RHS = [value]"
     c) Verify they are EXACTLY equal (not approximately, not "close enough")
     d) For each of the 4 answer choices, perform explicit substitution showing your work
     e) ONLY the correct answer should make both sides exactly equal
   
   - VERIFICATION EXAMPLES:
     * Original equation: √(x+3) = x-3
     * Testing x=6: √(6+3) = 6-3 → √9 = 3 → 3 = 3 ✓ VALID
     * Testing x=1: √(1+3) = 1-3 → √4 = -2 → 2 = -2 ✗ INVALID (extraneous)
   
   - SPECIAL CASES:
     * Radical equations: verify in ORIGINAL (before isolating/squaring)
     * Multiple solutions: question MUST ask for "sum of solutions", "product of solutions", "positive solution", or "number of solutions"
     * Irrational solutions: If solving yields √2, 3±2√5, etc., STOP - SAT answers are integers, simple fractions, or terminating decimals only
   
   - IF VERIFICATION FAILS: Completely regenerate the question. Do NOT adjust answer choices to match wrong values.

2. DIFFICULTY CALIBRATION (BE CONSERVATIVE):
   - Level 1 (Elementary): Single-step, no algebra (√x = 4, x² = 25)
   - Level 2 (Basic): 1-2 straightforward steps, clean results
     * Example: x² - 5x + 6 = 0, factor to (x-2)(x-3)=0
     * Example: √(x+5) = 4, square both sides, x = 11
   
   - Level 3 (Standard): Standard multi-step procedures, may involve one complication
     * Example: Quadratic formula with discriminant calculation
     * Example: Radical equation requiring extraneous solution check
     * Example: Simple rational equation clearing denominators
   
   - Level 4 (Advanced): Multiple techniques OR careful algebraic manipulation required
     * Example: Completing square with fractional coefficients
     * Example: System requiring substitution creating quadratic
     * Example: Multiple extraneous solutions to identify
   
   - Level 5 (Exceptional): Requires genuine insight, non-standard approach, or sophisticated reasoning beyond mechanics
   
   - REALITY CHECK: If solution path is "apply standard formula → simplify → done" with integer arithmetic, it's likely Level 2-3, NOT 4-5
   - Ask yourself: "Would this challenge a strong algebra student?" If no, cap difficulty at 3

3. DISTRACTOR DESIGN (MUST BE TESTABLE):
   - Each wrong answer MUST result from ONE specific, reproducible algebraic error
   - You must VERIFY your error produces the distractor: perform the wrong method and confirm it yields that value
   
   - VALID ERROR PATTERNS WITH EXAMPLES:
     * Sign error in factoring: x² + x - 6 = (x-2)(x+3) instead of (x+3)(x-2) → wrong root
     * Quadratic formula: Using -b±√(b²-4ac) / 2a but forgetting the negative on b
     * Extraneous solution: Not checking radical equations, including invalid solution
     * Incomplete solution: Solving x² = 16 but giving only x = 4, forgetting x = -4
     * Arithmetic error: √(25) calculated as 4 instead of 5
     * Wrong operation: Squaring (x+2) as x²+4 instead of x²+4x+4
   
   - FOR EACH DISTRACTOR, WRITE:
     "Choice X = [value]: Results from [specific error]. Verification: [show the wrong method] → [confirm it gives that value]"
   
   - FORBIDDEN: Unexplained values, "if student is confused", random numbers near the answer

4. SAT FORMAT AUTHENTICITY:
   - Answer choices are ALWAYS single numerical values (integers, simple fractions like 5/2, or decimals like 1.5)
   - NEVER EVER use: "both A and B", "2 and 5", "no solution", "all real numbers", or compound answers
   - NO IRRATIONAL NUMBERS: No √2, √3, 1+√5, etc. in answer choices
   
   - MULTIPLE SOLUTIONS HANDLING:
     * If equation has solutions 3 and 7, ask: "What is the sum of all solutions to the equation?" → Answer: 10
     * Or ask: "What is the positive solution?" → Answer: 7 (if one is negative)
     * Or ask: "How many real solutions does the equation have?" → Answer: 2
   
   - NUMBER REALISM: Use integers from -20 to 20, fractions with denominators ≤ 6, avoid contrived values like 847

5. INTERNAL CONSISTENCY CHECKLIST:
   - [ ] Question asks for quantity Q
   - [ ] Explanation solves for and concludes with quantity Q
   - [ ] Designated correct answer choice equals that Q value
   - [ ] All four answer choices verified by substitution (or error analysis for distractors)
   - [ ] Difficulty rating matches actual solution complexity (counted steps, techniques required)
   - [ ] If multiple solutions exist, question asks for derivative quantity (sum/product) or specifies which

MANDATORY GENERATION WORKFLOW:
1. Create equation and SOLVE IT COMPLETELY on scratch paper
2. Check: Are solutions rational numbers? If not, redesign equation
3. Check: Multiple solutions? Adjust question to ask for sum/product/count
4. Generate 3 distractors based on specific errors - PERFORM each error to verify it yields that value
5. SUBSTITUTE all 4 choices into ORIGINAL equation, show work
6. Write explanation that derives the VERIFIED correct value
7. Count actual solution steps and techniques → assign honest difficulty rating
8. Read question, explanation, and answer key together - do they tell one consistent story?

BEFORE SUBMITTING: If any verification fails or any inconsistency exists, regenerate from step 1.
```