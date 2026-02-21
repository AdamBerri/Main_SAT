```
Generate an SAT Math question about lines, angles, and their properties.

## MANDATORY CREATION PROCESS

You must follow this exact sequence. Do NOT write the stem first.

### Step 1: Choose a geometric relationship and an error set

Pick ONE core relationship from this list:
- Supplementary angles sum to 180°
- Complementary angles sum to 90°
- Vertical angles are equal
- Alternate interior angles (parallel lines) are equal
- Co-interior / same-side interior angles sum to 180°
- Corresponding angles (parallel lines) are equal
- Triangle angle sum = 180°
- Quadrilateral angle sum = 360°
- Polygon with n sides: interior angle sum = (n−2)·180°
- Exterior angle of a triangle = sum of remote interior angles

Then pick 3 errors from this menu (one per distractor):
- **Wrong relationship**: uses supplementary instead of complementary (or vice versa)
- **Wrong relationship**: uses "equal" instead of "supplementary" for co-interior angles
- **Reports intermediate value**: gives x instead of the requested angle measure
- **Reports wrong part**: gives the smaller angle when asked for the larger (or vice versa)
- **Picks wrong angle**: identifies incorrect angle as the answer in a multi-angle problem
- **Arithmetic slip**: forgets to add/subtract a constant in the final substitution step
- **Wrong formula**: uses 180° instead of 360° for quadrilateral, or (n−1) instead of (n−2)
- **Coefficient error**: forgets to divide by coefficient (gives 2x instead of x)
- **Forgot to substitute**: reports the variable value instead of plugging back in

### Step 2: Choose numbers that make ALL FOUR answers clean integers

Work backward:
1. Pick the correct answer (a clean integer angle value).
2. For each of your 3 chosen errors, determine what value that error would produce.
3. If any error produces a non-integer or a duplicate, adjust your coefficients/constants until all four choices are distinct clean integers between 1° and 360°.

### Step 3: Write the stem

Now write the question. Keep it concise — 1–3 sentences maximum. Use precise geometric language. If the problem references a figure, set requires_figure=true.

### Step 4: Verify everything

- Solve the problem from scratch. Confirm your answer matches choice B (or whichever you designated).
- For each distractor, execute the error and confirm it produces the stated value.
- Check difficulty honestly:
  - Level 1–2: single relationship, one equation
  - Level 3: two steps (equation + substitution)
  - Level 4: two+ relationships or multi-part figure
  - Level 5: 3+ theorems coordinated with real algebra (must take >90 seconds for a prepared student)
- State: "The answer is [value], choice [letter]" and verify it matches correct_answer.

### Step 5: Write distractor rationales

One sentence each. Format: "Student who [specific error]: [arithmetic] = [value]."

No hedging words (perhaps, might, possibly). No multiple error paths. No rationales longer than one sentence.

{DIFFICULTY_DESCRIPTION}
```
