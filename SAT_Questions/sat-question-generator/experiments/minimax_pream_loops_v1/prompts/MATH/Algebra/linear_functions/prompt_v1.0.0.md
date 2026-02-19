Generate an SAT Math question about linear equations that matches College Board style and conventions.

Topics may include:
- Solving linear equations in one variable
- Setting up equations from word problems
- Systems of linear equations (substitution/elimination)
- Interpreting solutions in context

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. REAL-WORLD CONTEXT (REQUIRED FOR ALL DIFFICULTY LEVELS):
   - Every question MUST use a realistic word problem scenario — never present a bare equation like "If 3x + 7 = 22"
   - Use varied contexts: retail pricing, travel distances, mixture problems, work rates, budgeting, ticket sales, construction, manufacturing, sports statistics, fundraising, rental fees, subscriptions, utility billing
   - The equation should emerge naturally from the scenario, not be stated directly in the stem
   - Numbers must fit the scenario (no fractional people, seats, or discrete objects)

2. PROBLEM STRUCTURE VARIETY (CRITICAL):
   - DO NOT create 5 questions with the same structure. Vary the equation type across questions:
     * One-step: "total ÷ rate" (use at most once per batch)
     * Two-step: flat fee + per-unit rate (e.g., "A service charges $50 plus $8 per hour")
     * Setup from narrative: student must translate a word problem into an equation
     * Systems of equations: two unknowns, two constraints
     * Interpretation: given a model equation, interpret what a value means in context
   - For difficulty 1-2: Mix one-step, two-step, and simple setup problems — do NOT make all questions the same "divide total by price" pattern
   - For difficulty 3-5: Use systems, multi-step setups, and interpretation problems

3. ANSWER CHOICES:
   - All four choices must be numerically distinct
   - Use clean integers or simple fractions that arise naturally from the problem
   - Design the problem backwards: choose the answer first, then build constraints that produce it
   - Verify all arithmetic by solving forward after designing
   - The correct answer MUST be an exact integer or simple fraction — never rounded or approximate

4. DISTRACTOR DESIGN (HIGHEST PRIORITY):

   WORKFLOW — Follow this exact order for each distractor:
   Step 1: Pick a specific student error (e.g., "forgot to subtract the flat fee")
   Step 2: Perform the wrong calculation to get a number (e.g., 82.50 ÷ 0.25 = 330)
   Step 3: Use THAT number as the answer choice text
   NEVER pick the distractor value first and then try to reverse-engineer an error path to it.

   GOOD distractor rationale:
   "Divided total cost by per-mile rate without subtracting flat fee: 82.50 ÷ 0.25 = 330."

   BANNED patterns (DO NOT USE — any of these are an automatic failure):
   - "Results from a proportion error."
   - "Results from a calculation slip."
   - "...then mistakenly chose X."
   - "...made arithmetic error = X."
   - "...rounded incorrectly to X."
   - "...approximated to X."
   - Any rationale where the described calculation produces a DIFFERENT number than the distractor value.

   - Common error types to use (pick distinct ones for each question):
     * Forgetting to subtract a fixed cost/fee before dividing
     * Sign error when moving terms across the equals sign
     * Distributing incorrectly (e.g., 3(x + 4) = 3x + 4 instead of 3x + 12)
     * Dividing by the wrong coefficient in the final step
     * Swapping which quantity maps to which variable in a word problem
     * Adding equations instead of subtracting when eliminating (or vice versa)
     * Solving for the wrong variable in a system and reporting it
     * Confusing "increased by 20%" with "is 20% of"
     * Applying a percentage change to the wrong quantity
     * Forgetting to combine like terms from both sides of the equation

   - ARITHMETIC VERIFICATION (MANDATORY): After writing each distractor rationale, re-do the arithmetic in the rationale from scratch. The final number MUST exactly equal the distractor value. If it does not, you MUST redesign the problem or the error path until every rationale's math produces its exact distractor value with zero rounding.
   - SIMPLICITY CHECK: If a distractor rationale takes more than 2 sentences to explain, the error path is too convoluted. Redesign the problem so each distractor follows from ONE clear mistake.
   - Every rationale must end with "= [distractor value]".

5. DISTRACTOR MAGNITUDE RULE (CRITICAL — NEW):
   - ALL distractor values must be within the same order of magnitude as the correct answer and plausible in context.
   - If the correct answer is 5 days, distractors should be numbers like 3, 4, 6, 7 — NOT 72 or 120.
   - If the correct answer is 18 tickets, distractors should be numbers like 15, 17, 20, 22 — NOT 136 or 152.
   - A student choosing among answer options should find ALL four choices reasonable at first glance.
   - Distractors that are absurdly large or small relative to the context (e.g., 240 hours of driving) will never attract a real test-taker and are unacceptable.

6. RATIONALE GROUNDING RULE (CRITICAL — NEW):
   - Every distractor rationale may ONLY reference numbers that appear in the problem stem or that are derived from exactly one wrong step applied to stem numbers.
   - NEVER introduce a number in a distractor rationale that appears nowhere in the stem and is not the result of a clear calculation using stem values.
   - Example violation: Stem says "$30 registration + $20/month, total $150" but rationale says "subtracted $10" — where did $10 come from? This is forbidden.

7. DISTRACTOR RATIONALE FORMAT (ALL 4 KEYS REQUIRED):
   The "distractorRationale" object MUST contain exactly 4 keys: "A", "B", "C", and "D".
   - For each WRONG answer key: describe the specific error and show the calculation chain ending with "= [value]"
   - For the CORRECT answer key: write "Correct: [1-sentence solution summary] = [value]"

   Example (if B is correct):
   {
     "A": "Divided total by rate without subtracting the base fee: 150 ÷ 6 = 25.",
     "B": "Correct: subtracted $30 base fee then divided by $6/hour: (150 - 30) ÷ 6 = 20.",
     "C": "Added the base fee instead of subtracting: (150 + 30) ÷ 6 = 30.",
     "D": "Used the base fee as the rate: (150 - 30) ÷ 30 = 4, then multiplied by 10 = 40."
   }

8. DIFFICULTY CALIBRATION:
   - Match difficulty to actual cognitive demands, not superficial complexity:
     * Difficulty 1: One-step or two-step equation embedded in a simple word problem (e.g., flat fee + rate, or simple division). Must include at least one problem that is NOT just "total ÷ price".
     * Difficulty 2: MUST be structurally harder than difficulty 1. At minimum TWO distinct algebraic operations (e.g., subtract THEN divide, or set up a simple system). A "flat fee + rate" problem is D2 ONLY if the setup requires genuine translation from a narrative — NOT if it's just "charges $X plus $Y per unit, total was $Z, how many units?" (that's D1 two-step).
       - D2 example that qualifies: "A farmer has 30 animals (chickens and cows) with 82 legs total. How many cows?" (requires system setup + substitution)
       - D2 example that does NOT qualify: "A tutor charges $40 plus $35/session, total $285, how many sessions?" (this is D1 two-step)
     * Difficulty 3: Word problem requiring equation setup with multiple constraints, or standard two-equation system with real-world interpretation
     * Difficulty 4: Multi-step problem where the answer CANNOT be found without performing at least 3 algebraic steps. Must include extra information that is NOT needed and must be identified and ignored. The problem must REQUIRE the student to use most/all of the given numeric information — if the answer can be found by a single subtraction (e.g., "46 - 40 = 6"), it is NOT D4.
     * Difficulty 5: Non-obvious equation setup, multiple layers of abstraction (e.g., percentage changes on top of a system, or interpreting what a derived quantity means, or tiered structures requiring piecewise computation and working backwards). All intermediate and final values must be exact — design the numbers so no rounding is needed at any step.
   - Count the number of reasoning steps and concepts required
   - Clean arithmetic never increases difficulty

9. SAT FORMATTING:
   - Use College Board conventions: clear stem, four labeled choices (A-D)
   - Match the concise, precise wording style of official SAT questions
   - End the stem with a clear question (e.g., "how many X" or "what is the value of Y, in dollars")

10. RATIONALES:
   - Correct answer: Show complete solution with all arithmetic steps explicit (write "15 × 80 = 1,200" not "multiply to get 1,200")
   - Each distractor: Demonstrate the exact wrong approach with full calculations showing how the student arrives at that specific value
   - Present only the clean, final solution path — NEVER include "Wait," "Actually," "Let me recalculate," or any revision language
   - NEVER leave a rationale as just "Correct answer" or "Results from an error" — always specify which error and show the math
   - Each distractor rationale MUST be self-contained: one clear mistake → one calculation → the distractor value

11. POST-COMPLETION VERIFICATION (MANDATORY — DO THIS LAST):
   After writing the complete question, go back and re-verify EVERY addition, subtraction, multiplication, and division in:
   (a) The correct answer explanation — recompute each step and confirm the final value matches the marked correct answer.
   (b) Each distractor rationale — recompute the error path and confirm it produces the stated distractor value.
   (c) The FINAL STEP specifically — addition errors like "170 + 935 = 1070" (actual: 1105) or "40 + 42 = 76" (actual: 82) are common. Catch them here.
   If ANY arithmetic doesn't check out, fix the question before outputting.
