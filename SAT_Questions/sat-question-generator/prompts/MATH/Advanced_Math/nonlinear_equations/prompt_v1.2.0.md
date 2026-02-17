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
   - MANDATORY: After generating all answer choices, substitute EACH choice into the original equation
   - Show your verification work explicitly: "Testing A: [substitution] = [result]"
   - The correct answer MUST make both sides of the equation exactly equal
   - For radical equations: verify the answer works in the ORIGINAL equation before any algebraic manipulation
   - For equations with multiple valid solutions: the question must ask for sum, product, number of solutions, or specify "positive solution"
   - If your designated answer doesn't verify, STOP and regenerate the entire question
   - Common verification failures to avoid:
     * Arithmetic errors in substitution
     * Forgetting to check original equation (before isolating radicals)
     * Confusing which form of the equation to verify against

2. DIFFICULTY CALIBRATION:
   - Be conservative and honest about difficulty ratings
   - Level 2: One or two straightforward steps (x² = 49, basic factoring like (x-3)(x+2)=0)
   - Level 3: Standard multi-step process with clean arithmetic (quadratic formula yielding integer roots, simple extraneous solution check)
   - Level 4: Requires careful manipulation OR combining multiple concepts (completing square with fractions, systems with substitution, multiple extraneous solutions)
   - Level 5: Reserved for genuinely sophisticated problems requiring insight beyond mechanical application
   - RED FLAGS for over-rating: clean integer arithmetic, direct formula application, single standard technique = likely Level 2-3, not 4-5

3. DISTRACTOR DESIGN:
   - Each wrong answer must result from ONE specific, identified error
   - Explicitly state the error: "Choice B: Student factors as (x-3)(x-2) instead of (x-3)(x+2) [sign error]"
   - Test that your described error actually produces the distractor value
   - Common valid error types:
     * Sign errors in factoring (wrong sign in a factor)
     * Quadratic formula mistakes (forgetting negative, wrong discriminant)
     * Extraneous solutions (failing to check radical equations)
     * Partial solutions (solving but not finishing, like forgetting ±)
     * Arithmetic slips in standard procedures (2×3 = 5, etc.)
   - AVOID: random numbers, uncheckable vague errors like "general confusion"

4. SAT FORMAT AUTHENTICITY:
   - Answer choices are ALWAYS single numerical values
   - NEVER use "both A and B", "1 and 4", "no solution", or multiple values in one choice
   - If an equation has solutions x=2 and x=5, ask for: "What is the sum of all solutions?" → Answer: 7
   - Use realistic SAT numbers: mostly integers from -20 to 20, simple fractions like 3/2, occasional decimals like 2.5
   - Avoid overly simple questions that belong in middle school (x² = 64 with no context is too basic)

5. INTERNAL CONSISTENCY:
   - The value you designate as correct must be the exact value your explanation derives
   - Don't shift what's being asked (if question asks for x, don't solve for x²)
   - Your explanation's final answer must match the designated correct choice letter
   - Verify: question asks for X → explanation solves for X → correct choice equals that X value

GENERATION WORKFLOW:
1. Create the equation and solve it completely yourself first
2. Generate answer choices based on specific errors
3. VERIFY each choice by substitution into the original equation
4. Write the explanation matching your verified correct answer
5. Double-check difficulty rating against the actual solution complexity
```