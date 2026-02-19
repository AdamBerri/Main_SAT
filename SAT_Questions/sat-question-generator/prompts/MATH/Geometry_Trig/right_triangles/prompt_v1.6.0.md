Generate an SAT Math question about right triangle trigonometry that matches College Board style and conventions.

Topics may include:
- Sine, cosine, tangent ratios (SOH CAH TOA)
- Solving right triangles (find missing sides or angles)
- Pythagorean theorem applications
- Real-world context problems (ladders, ramps, shadows, buildings, distances)
- Special right triangles (30-60-90, 45-45-90)
- Complementary angle relationships (sin θ = cos(90° − θ))
- Multi-step problems combining trig with area, perimeter, or other geometry

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. BATCH PLANNING (DO THIS FIRST — before writing any question):
   Before generating Question 1, plan the full batch of 5:
   - List 5 angles (at least 3 distinct, no angle used more than twice)
   - List 5 problem structures (no two identical structures, no mirror-image pairs)
   - List 5 contexts (all different real-world scenarios)
   Then write the questions according to your plan.

2. REAL-WORLD CONTEXT (REQUIRED FOR DIFFICULTY 1-4):
   - Questions at difficulty 1-4 MUST use a realistic scenario — never present a bare triangle with no context like "In triangle ABC, angle C = 90°, find side a."
   - Use varied contexts: ladders against walls, ramps/inclines, building shadows, kite strings, observation towers, airplane descent paths, road grades, surveying distances, bridge supports, roof pitches, lighthouse sightlines, flagpole heights
   - The triangle should emerge naturally from the scenario
   - Difficulty 5 MAY use abstract geometry if the problem setup is sufficiently complex
   - SCENARIO REALISM: Numbers AND angles must be realistic for the scenario. A wheelchair ramp cannot be 53° — ramps are under 10°. A ladder angle is typically 60-80°. A road grade is under 15°. If the angle doesn't make physical sense for the scenario, choose a different scenario or a different angle.

3. TRIG VALUE HANDLING (IMPORTANT):
   - For D1-D3: PROVIDE ALL THREE trig values (sin, cos, tan) for the angle in the stem, even if only one is needed. This ensures that "used wrong trig function" distractors are always available and produce clean numbers. Example: "Given sin 37° ≈ 3/5, cos 37° ≈ 4/5, and tan 37° ≈ 3/4, ..."
   - For D4-D5: MAY require students to know common values (sin 30° = 0.5, cos 60° = 0.5, tan 45° = 1, sin 45° = √2/2, etc.) or special triangle ratios
   - ALL final answers must be exact integers, clean decimals (one decimal place max), or simple expressions with √ — never long decimals requiring rounding
   - Design problems so the arithmetic works out cleanly: if sin(θ) × hypotenuse must be an integer, choose the hypotenuse accordingly
   - For D4, avoid using tan(45°) = 1 as the primary trig step — this makes the trig component trivial (just multiplying by 1). Choose angles where the trig computation is substantive.

4. ANSWER CHOICES:
   - All four choices must be numerically distinct
   - Design the problem backwards: choose the answer first, then build the triangle dimensions to produce it
   - Verify all arithmetic by solving forward after designing
   - The correct answer MUST be exact — never rounded or approximate

5. DISTRACTOR DESIGN (HIGHEST PRIORITY):

   WORKFLOW — Follow this exact order for each distractor:
   Step 1: Pick a specific student error (e.g., "used cos instead of sin")
   Step 2: Perform the wrong calculation to get a number (e.g., cos 40° × 20 = 0.766 × 20 = 15.32, but we need clean numbers — redesign so it comes out clean)
   Step 3: Use THAT number as the answer choice text
   NEVER pick the distractor value first and then try to reverse-engineer an error path to it.

   SINGLE-POINT-OF-FAILURE RULE (CRITICAL):
   Each distractor MUST result from exactly ONE wrong decision applied directly to the numbers in the problem stem.
   - NEVER create a distractor that requires the student to first compute the correct answer and THEN make an additional mistake on that result.
   - GOOD: "Used cos instead of sin: cos 37° × 25 = 0.8 × 25 = 20" (one wrong choice of trig function)
   - BAD: "Correctly found opposite = 15, then computed hypotenuse using 15" (student already found the answer, then did something extra)

   COMPUTATIONAL DISTRACTOR RULE (CRITICAL):
   Every distractor MUST result from an actual mathematical computation applied to stem numbers using a wrong approach. The following are NOT valid distractors:
   - A number that appears directly in the stem (e.g., if hypotenuse = 80, do NOT use 80 as a distractor)
   - The angle value used as a side length (e.g., if angle = 60°, do NOT use 60 as a distractor)
   - Halving or doubling a stem value with no trig/geometric justification
   - Averaging two given values (e.g., (a+b)/2) — students do not average sides of a right triangle
   - Subtracting two given values (a−b) unless this represents a specific geometric misunderstanding

   VALID distractor types (use ONLY these):
   * Using sin when should use cos (or vice versa) — SOH/CAH confusion
   * Using tan when should use sin or cos
   * Confusing opposite and adjacent sides relative to the angle
   * Setting up the ratio inverted (opp/hyp instead of hyp/opp when solving for hypotenuse)
   * Using the complementary angle (90° − θ instead of θ)
   * Applying Pythagorean theorem as a² + b² = c² but using the hypotenuse as a or b
   * Forgetting to take the square root in the final Pythagorean step (reporting c² instead of c)
   * Confusing angle of elevation with angle of depression
   * Using the wrong leg for the trig ratio in a word problem (horizontal vs vertical)
   * In special triangles: using the wrong ratio (e.g., short leg × √3 for hypotenuse instead of short leg × 2)
   * Adding legs instead of using Pythagorean theorem: a + b instead of √(a² + b²)

   BANNED patterns (DO NOT USE — any of these is an automatic failure):
   - "Results from a proportion error."
   - "Results from a calculation slip."
   - "...then mistakenly chose X."
   - "...made arithmetic error = X."
   - "...rounded incorrectly to X."
   - "...approximated to X."
   - "...or from other arithmetic errors."
   - Any rationale where the described calculation produces a DIFFERENT number than the distractor value.

   ARITHMETIC VERIFICATION (MANDATORY): After writing each distractor rationale, re-do the arithmetic from scratch. The final number MUST exactly equal the distractor value. If it does not, redesign the problem or error path.

   SIMPLICITY CHECK: If a distractor rationale takes more than 2 sentences, the error path is too convoluted. Redesign so each distractor follows from ONE clear mistake.

   Every rationale must end with "= [distractor value]".

   CLEAN NUMBER DESIGN (CRITICAL): Because trig values are often irrational, you MUST design problems so that ALL answer choices (correct AND distractors) come out to clean numbers. Strategies:
   - Use Pythagorean triples: (3,4,5), (5,12,13), (8,15,17), (7,24,25), (20,21,29) and their multiples
   - Use special triangles: 30-60-90 (1, √3, 2) or 45-45-90 (1, 1, √2)
   - Provide trig values that produce integers when multiplied by the given side: if hyp=20 and you provide sin θ = 0.6, then opp = 12 (clean)
   - Ensure the WRONG calculations also produce clean numbers. If sin θ = 0.6, then cos θ = 0.8, so the "used cos instead of sin" distractor also gives a clean integer (0.8 × 20 = 16)

6. DISTRACTOR MAGNITUDE RULE:
   - ALL distractor values must be within the same order of magnitude as the correct answer and physically plausible.
   - If a ladder reaches 12 ft up a wall, distractors should be like 9, 15, 16 — NOT 3.4 or 144.
   - A student should find ALL four choices reasonable at first glance.

7. DISTRACTOR PLAUSIBILITY FLOOR:
   - Every distractor value must be something a student could plausibly compute by making ONE common mistake.
   - NEVER use a value that is trivially derived (e.g., just a bare numerator or denominator from a fraction in the problem, or a number that appears directly in the stem without any computation).
   - If a distractor value is less than half or more than double the correct answer, reconsider — it likely violates the magnitude rule.

8. RATIONALE GROUNDING RULE:
   - Every distractor rationale may ONLY reference numbers that appear in the problem stem or are derived from exactly one wrong step applied to stem numbers.
   - NEVER introduce a number that appears nowhere in the stem and is not the result of a clear calculation.

9. DISTRACTOR RATIONALE FORMAT (ALL 4 KEYS REQUIRED):
   The "distractorRationale" object MUST contain exactly 4 keys: "A", "B", "C", and "D".
   - For each WRONG answer key: describe the specific error and show the calculation chain ending with "= [value]"
   - For the CORRECT answer key: write "Correct: [1-sentence solution summary] = [value]"

   Example (if C is correct, Pythagorean triple problem):
   {
     "A": "Used a² = c² + b² instead of a² + b² = c²: 25² − 7² = 625 − 49 = 576, √576 = 24 — but then reported the other leg: 7.",
     "B": "Forgot to take the square root: 7² + 24² = 49 + 576 = 625, reported 625 instead of √625 = 25.",
     "C": "Correct: Applied Pythagorean theorem a² + b² = c²: 7² + 24² = 49 + 576 = 625, c = √625 = 25.",
     "D": "Added the legs instead of using Pythagorean theorem: 7 + 24 = 31."
   }

10. SAT FORMATTING:
    - Use College Board conventions: clear stem, four labeled choices (A-D)
    - Match concise, precise wording of official SAT questions
    - End stem with a clear question ("how many feet," "what is the length, in meters," etc.)
    - Include units in the stem question and in answer choices

11. RATIONALES:
    - Correct answer: Show complete solution with all arithmetic steps explicit
    - Each distractor: Show the exact wrong approach with full calculations
    - Present ONLY the clean, final solution — NEVER include "Wait," "Actually," "Let me recalculate," or any revision language
    - Each distractor rationale MUST be self-contained: one clear mistake → one calculation → the distractor value

12. hasImage FIELD:
    - Set hasImage: true for any question where understanding the geometric setup significantly helps (angles of elevation/depression, multi-triangle problems, real-world scenarios with non-obvious geometry)
    - Set hasImage: false for straightforward problems where the setup is obvious from the text (simple "find the missing side" with clearly described right triangle)
    - When hasImage: true, write a clear imageDescription describing the diagram needed

13. DIFFICULTY CALIBRATION (READ CAREFULLY — this is the #1 source of errors):

   DIFFICULTY LITMUS TESTS — apply these BEFORE writing each question:

   * Difficulty 1: Direct application — given a right triangle with one angle and one side (trig values provided), find one missing side using a single trig ratio.
     LITMUS: The student is told which values to use and just plugs in.
     Example: "A 20-ft ladder leans against a wall at 60° to the ground. Given sin 60° ≈ 0.866, how high does it reach?"

   * Difficulty 2: Choose-the-ratio OR Pythagorean theorem with context. Student must identify which trig function or which formula to use, but only one step of computation.
     LITMUS: The student makes ONE decision (which ratio?) and does ONE computation. That's it.
     Example: "A ramp rises 5 ft over a horizontal distance of 12 ft. What is the length of the ramp?"

   * Difficulty 3: REQUIRES TWO OR MORE DISTINCT COMPUTATION STEPS.
     LITMUS: Can the student solve it by choosing one trig ratio and applying it once? If YES → it is D2, NOT D3. Send it back.
     D3 requires EITHER:
       (a) Compute an intermediate value with trig, THEN use that value in a second computation (e.g., find height with tan, then add observer offset)
       (b) Use the Pythagorean identity to derive a trig value, THEN apply it
       (c) Complementary angle reasoning requiring a conceptual step before computing
     NOT D3 (these are D2): "Given a 45-ft ramp at 53°, find horizontal distance" — this is one ratio, one multiply.
     NOT D3: "A ladder makes 37° with the ground. Find height on wall." — one ratio, one multiply.
     YES D3: "From 60 ft away, angle of elevation is 37°. Observer's eyes are 5 ft up. Find building height." — compute tan component (step 1), add offset (step 2).
     YES D3: "Given cos θ = 5/13 and the Pythagorean identity, find the opposite side of a 52-ft boom arm." — derive sin from cos (step 1), multiply (step 2).
     Example: "From a point 40 ft from a building, the angle of elevation to the top is 50°. Given tan 50° ≈ 1.19, find the total height if the observer's eyes are 5 ft above the ground."

   * Difficulty 4: Multi-step with 3+ computations, may include extra information that must be identified and ignored. Must combine trig with another concept (area, perimeter, distance). The trig computation itself must be substantive — do NOT use tan(45°) = 1 as the primary trig step since this makes the trig component trivial.
     LITMUS: Count the computation steps. If fewer than 3, it's D3 not D4.
     Example: "A surveyor measures the angle of elevation to a hilltop as 25° from point A and 40° from point B, which is 200 meters closer. Find the height of the hill."

   * Difficulty 5: MUST involve MULTIPLE GEOMETRIC RELATIONSHIPS that connect to each other.
     LITMUS: Does the problem use only ONE triangle and ONE equation? If YES → it is D4 at most, NOT D5.
     D5 requires AT LEAST ONE of:
       (a) Two or more right triangles sharing a side, where you solve one triangle to get information needed for the other
       (b) A system of equations arising from two distinct geometric constraints
       (c) Working backwards through 3+ layers of derived quantities
       (d) A non-routine geometric construction (auxiliary line, hidden relationship)
     BANNED for D5 — these are D3-D4 at most:
       - "45-45-90 triangle with area X, find the hypotenuse" (one triangle, one equation)
       - "30-60-90 triangle with perimeter X, find the area" (one triangle, one equation)
       - "altitude to hypotenuse in a single special triangle" (standard textbook technique)
       - Any problem solvable with ONE triangle and algebraic manipulation alone
     YES D5: "Angle of depression changes from 60° to 45° as a boat moves 50m — find tower height." (two triangles share the tower height, system of two equations)
     YES D5: "In triangle ABD, altitude AC creates two sub-triangles with angles 30° and 45° at B and D. Given AD = 10, find BD." (two interconnected triangles, chain computation through shared side)
     Example: "A lighthouse beam rotates. When the angle of depression to a boat changes from 60° to 45°, the boat has moved 50 meters. How tall is the lighthouse?"

14. POST-COMPLETION VERIFICATION (MANDATORY — DO THIS LAST):
    After writing ALL 5 questions, go back and verify each one against EVERY check below. If ANY check fails, fix the question before outputting.

    ARITHMETIC CHECKS:
    (a) Recompute the correct answer from scratch — confirm the final value matches.
    (b) Recompute each distractor's error path — confirm it produces exactly the stated value.
    (c) Verify geometric constraints — hypotenuse is the longest side, triangle inequality holds, values are physically plausible.

    DIFFICULTY CHECK (CRITICAL — reread section 13 litmus tests):
    (d) For each D3 question: count the computation steps. If a student can solve it with ONE ratio applied once, REJECT it and redesign as a genuine two-step problem.
    (e) For each D5 question: count the triangles/equations. If it uses only ONE triangle and ONE equation, REJECT it and redesign with interconnected triangles or a system of equations.

    BATCH DIVERSITY CHECKS:
    (f) List all 5 angles used. Verify at least 3 are distinct and none appears more than twice. If violated, change an angle.
    (g) Check for mirror-image pairs: if two questions use the same angle and the same trig function but solve for opposite variables (e.g., Q1: hyp × cos = adj, Q2: adj / cos = hyp), REJECT the second and redesign with a different structure.
    (h) Verify all scenarios are physically realistic — a ramp angle must be under 15°, a ladder angle 50-80°, a road grade under 10°.
