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

1. REAL-WORLD CONTEXT (REQUIRED FOR DIFFICULTY 1-4):
   - Questions at difficulty 1-4 MUST use a realistic scenario — never present a bare triangle with no context like "In triangle ABC, angle C = 90°, find side a."
   - Use varied contexts: ladders against walls, ramps/inclines, building shadows, kite strings, observation towers, airplane descent paths, road grades, surveying distances, bridge supports, roof pitches, lighthouse sightlines, flagpole heights
   - The triangle should emerge naturally from the scenario
   - Difficulty 5 MAY use abstract geometry if the problem setup is sufficiently complex
   - Numbers must be realistic for the scenario (e.g., ladder length 10-30 ft, building height 20-200 ft)

2. PROBLEM STRUCTURE VARIETY (CRITICAL):
   - DO NOT create 5 questions with the same structure. Vary across:
     * Direct trig ratio: given angle and one side, find another side (D1-D2)
     * Pythagorean theorem: given two sides, find the third (D1-D2)
     * Choose-the-ratio: student must identify which trig function to use (D2-D3)
     * Multi-step: find one measurement, then use it to find another (D3-D4)
     * Interpretation: given a trig equation, interpret what a value represents (D3)
     * Special triangles: recognize 30-60-90 or 45-45-90 patterns (D2-D3)
     * Complementary angles: use sin θ = cos(90° − θ) (D3-D4)
     * Combined concepts: trig + area, trig + distance, angle of elevation/depression (D4-D5)

3. TRIG VALUE HANDLING (IMPORTANT):
   - For D1-D3: PROVIDE the needed trig values in the stem (e.g., "sin 35° ≈ 0.574") so the student focuses on setup, not calculator use
   - For D4-D5: MAY require students to know common values (sin 30° = 0.5, cos 60° = 0.5, tan 45° = 1, sin 45° = √2/2, etc.) or special triangle ratios
   - ALL final answers must be exact integers, clean decimals (one decimal place max), or simple expressions with √ — never long decimals requiring rounding
   - Design problems so the arithmetic works out cleanly: if sin(θ) × hypotenuse must be an integer, choose the hypotenuse accordingly

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

   BANNED patterns (DO NOT USE — any of these is an automatic failure):
   - "Results from a proportion error."
   - "Results from a calculation slip."
   - "...then mistakenly chose X."
   - "...made arithmetic error = X."
   - "...rounded incorrectly to X."
   - "...approximated to X."
   - "...or from other arithmetic errors."
   - Any rationale where the described calculation produces a DIFFERENT number than the distractor value.

   Common RIGHT TRIANGLE error types to use (pick distinct ones per question):
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

7. RATIONALE GROUNDING RULE:
   - Every distractor rationale may ONLY reference numbers that appear in the problem stem or are derived from exactly one wrong step applied to stem numbers.
   - NEVER introduce a number that appears nowhere in the stem and is not the result of a clear calculation.

8. DISTRACTOR RATIONALE FORMAT (ALL 4 KEYS REQUIRED):
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

9. DIFFICULTY CALIBRATION:
   * Difficulty 1: Direct application — given a right triangle with one angle and one side (trig values provided), find one missing side using a single trig ratio. Example: "A 20-ft ladder leans against a wall at 60° to the ground. Given sin 60° ≈ 0.866, how high does it reach?"
   * Difficulty 2: Choose-the-ratio OR Pythagorean theorem with context. Student must identify which trig function or which formula to use, but only one step of computation. Example: "A ramp rises 5 ft over a horizontal distance of 12 ft. What is the length of the ramp?"
   * Difficulty 3: Two-step problem OR interpret a trig relationship OR complementary angle reasoning. Example: "From a point 40 ft from a building, the angle of elevation to the top is 50°. Given tan 50° ≈ 1.19, find the total height if the observer's eyes are 5 ft above the ground."
   * Difficulty 4: Multi-step with 3+ computations, may include extra information that must be identified and ignored. Must combine trig with another concept (area, perimeter, distance). Example: "A surveyor measures the angle of elevation to a hilltop as 25° from point A and 40° from point B, which is 200 meters closer. Find the height of the hill."
   * Difficulty 5: Non-obvious setup requiring creative insight, multiple triangles, or working backwards from a derived quantity. All intermediate values exact. Example: "A lighthouse beam rotates. When the angle of depression to a boat changes from 60° to 45°, the boat has moved 50 meters. How tall is the lighthouse?"

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

12. POST-COMPLETION VERIFICATION (MANDATORY — DO THIS LAST):
    After writing the complete question, go back and re-verify EVERY computation in:
    (a) The correct answer — recompute each step and confirm the final value matches.
    (b) Each distractor rationale — recompute the error path and confirm it produces the stated distractor value.
    (c) Geometric constraints — verify the hypotenuse is the longest side, triangle inequality holds, and all values are physically plausible.
    If ANY arithmetic doesn't check out, fix the question before outputting.

13. hasImage FIELD:
    - Set hasImage: true for any question where understanding the geometric setup significantly helps (angles of elevation/depression, multi-triangle problems, real-world scenarios with non-obvious geometry)
    - Set hasImage: false for straightforward problems where the setup is obvious from the text (simple "find the missing side" with clearly described right triangle)
    - When hasImage: true, write a clear imageDescription describing the diagram needed
