```
Generate an SAT Math question about area, surface area, or volume.

The question should:
- Involve standard geometric shapes (rectangles, triangles, circles, cylinders, rectangular prisms, spheres, cones, pyramids)
- Potentially combine multiple shapes or require multi-step reasoning
- Require application of area/volume formulas
- Use ONLY formulas provided on the SAT reference sheet (if applicable) or basic geometric formulas students are expected to know

CRITICAL MATHEMATICAL REQUIREMENTS:
1. **ANSWER KEY ACCURACY (HIGHEST PRIORITY ERROR):** After completing all work, perform this verification:
   - Write down your calculated numerical answer
   - Write down which letter (A, B, C, or D) contains that exact value
   - Explicitly state: "Calculated answer: [number]. This corresponds to choice [LETTER]."
   - Common failure: calculation shows 2 but answer marked as C when C actually contains 3
2. Verify arithmetic: Recalculate the correct answer twice independently to confirm accuracy
3. Test answer choice uniqueness: Ensure only ONE choice satisfies all problem conditions
4. Check algebraic steps: Verify each equation manipulation is valid
5. No distractor duplication: Ensure no two choices are mathematically equivalent
6. Integer or clean decimal answers: Avoid requiring rounding; never include explicit rounding instructions

EXPLANATION REQUIREMENTS:
- Write a clean, linear solution path without meta-commentary
- Remove phrases like "Wait, let me recalculate...", "Hmm, this seems...", or "This doesn't match..."
- Show clear step-by-step work that arrives confidently at the correct answer
- **Mandatory final statement:** "Calculated answer: [number]. This corresponds to choice [LETTER]: [number]. Therefore, the answer is [LETTER]."
- If verification reveals an error during generation, restart the question entirely

DISTRACTOR DESIGN (SECOND-MOST COMMON FAILURE POINT):

**STRICT REQUIREMENT: Each distractor must represent EXACTLY ONE specific, plausible error. No vague or compound explanations.**

**CREATION PROCESS (follow this order):**
1. First, solve the problem correctly and identify your answer
2. For each distractor, identify ONE specific student misconception
3. Execute that error completely to calculate the distractor value
4. Verify the calculation produces a reasonable value (not arbitrary)
5. Document with this exact format:
   - **Choice X: [value]**
   - **Single error:** [one-sentence description]
   - **Calculation:** [show complete work]
   - **Verification:** [confirm calculation produces stated value]

**ACCEPTABLE error types:**
- Wrong formula: "Uses circumference formula (2πr) instead of area formula (πr²)" → C = 2π(5) = 31.4
- Missing constant: "Calculates base × height but omits ½ factor for triangle" → A = 8 × 6 = 48 instead of 24
- Arithmetic mistake: "Multiplies 7 × 8 as 54 instead of 56"
- Unit confusion: "Uses diameter (12) instead of radius (6) in πr²" → A = π(12)² = 144π
- Incomplete process: "Finds one face area but forgets to multiply by 6 for cube" → 25 instead of 150
- Operation error: "Adds dimensions instead of multiplying" → 8 + 5 = 13 instead of 8 × 5 = 40

**UNACCEPTABLE (automatic failure):**
- "Student makes a calculation error" without specifying which calculation
- "Student uses an incorrect method" without stating what method
- Explanations that describe multiple different errors for one distractor
- Values that don't actually result from the described error when you work it out
- Distractors targeting identical misconceptions (e.g., two separate "uses perimeter instead of area" choices)
- Post-hoc reverse-engineering (picking a number, then inventing an implausible error to reach it)

**DISTRACTOR VERIFICATION TEST:** After writing each distractor rationale, perform the calculation yourself. If you cannot produce the distractor value using only the stated error, revise completely.

DIFFICULTY CALIBRATION (REVISED FOR ACCURACY):

**Most geometry problems are Level 1-2. Be conservative.**

- **Level 1 (Easy, 20%):** Single formula, direct substitution, simple arithmetic. "Find the area of a rectangle with length 8 cm and width 5 cm."
- **Level 2 (Medium-Easy, 40%):** Single formula with one preliminary step OR slightly complex numbers. "Find the area of a circle with diameter 10 inches" (must find radius first).
- **Level 3 (Medium, 25%):** Two formulas combined, three distinct steps, OR requires finding intermediate value. "A cylinder has volume 300π cm³ and radius 5 cm. Find its height."
- **Level 4 (Medium-Hard, 12%):** Non-obvious decomposition, setting up equations, OR significant algebraic manipulation. "A cone and cylinder share the same base and height. The cylinder's volume is 90π cm³. Find the cone's volume."
- **Level 5 (Hard, 3%):** Advanced spatial reasoning, system of equations, OR requires mathematical insight. Reserve for genuinely challenging problems.

**RATING JUSTIFICATION REQUIRED:** For Level 3+, you must write one sentence explaining the specific complexity factors. If you cannot articulate what makes it complex, rate it Level 2.

**WARNING SIGNS YOU'VE OVERRATED:**
- "Straightforward," "direct," or "simple" appear in your explanation → probably Level 1-2
- Problem solved in ≤3 steps with basic arithmetic → probably Level 1-2
- Only one formula used with no algebraic setup → probably Level 1-2

SAT AUTHENTICITY:

**CONTEXT REQUIREMENT:** Every question must include brief real-world framing:
- ✓ "A rectangular garden has length 12 feet and width 8 feet."
- ✗ "A rectangle has length 12 and width 8."
- ✓ "A cylindrical water tank has radius 3 meters and height 10 meters."
- ✗ "Find the volume of a cylinder with r = 3 and h = 10."

**SAT REALISM STANDARDS:**
- Information should require minimal interpretation (SAT is testing math, not reading comprehension)
- Some problems may require unit conversion or extracting values from context
- Avoid overly complex scenarios that obscure the mathematical task
- Answer choices should be strategically spaced (not randomly scattered across orders of magnitude)
- Use measurement units appropriate to context (metric or customary)
- Questions should feel like actual test items, not textbook exercises

**INFORMATION PRESENTATION:** SAT questions typically provide clear information but may require students to:
- Convert between related measures (diameter ↔ radius, feet ↔ inches)
- Identify which formula to apply
- Recognize shape decomposition opportunities
Balance clarity with requiring mathematical thinking.

IMAGE GUIDANCE:
Include images for: combined shapes, unusual orientations, spatial arrangements, or when visualization aids understanding. Skip images for: standard single shapes with clearly stated dimensions.

{DIFFICULTY_DESCRIPTION}

**MANDATORY PRE-SUBMISSION CHECKLIST:**
□ Solved problem completely and recalculated to verify answer
□ Wrote explicit verification: "Calculated answer: [number]. This corresponds to choice [LETTER]: [number]."
□ Checked that the letter I marked contains the value I calculated (most common error)
□ Each distractor has ONE specific error documented with complete calculation
□ Performed each distractor calculation myself—verified it produces the stated value
□ No two distractors represent the same misconception
□ Difficulty rating justified in writing (if Level 3+)
□ If rated Level 1-2, confirmed I'm not using words like "straightforward" while rating higher
□ Question includes real-world context, not bare geometry notation
□ Explanation ends with: "Calculated answer: X. This corresponds to choice [LETTER]: X. Therefore, the answer is [LETTER]."
```