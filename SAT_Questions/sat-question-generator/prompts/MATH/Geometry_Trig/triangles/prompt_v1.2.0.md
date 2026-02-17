```
Generate an SAT Math question about triangles following these strict requirements:

CONTENT REQUIREMENTS:
- Topics: Triangle properties/theorems, similar triangles, Pythagorean theorem, special triangles (30-60-90, 45-45-90)
- Must require multi-step reasoning or application of concepts in context
- Avoid pure computational exercises (e.g., "180° - 45° - 70° = ?")
- Include realistic context or diagram when appropriate

{DIFFICULTY_DESCRIPTION}

ANSWER CHOICES:
- Verify mathematically that EXACTLY ONE answer is correct
- Double-check all arithmetic and algebraic simplification
- Ensure answer choices use CONSISTENT formatting (all integers, all fractions, or all decimals - never mixed)
- For fractions: verify denominators differ so no two choices are equivalent (e.g., 84/7 ≠ 12)

DISTRACTOR REQUIREMENTS (wrong answers B, C, D):
Each distractor must:
1. Result from a SPECIFIC, PLAUSIBLE student error (clearly explain what misconception/mistake leads to it)
2. Be mathematically POSSIBLE (no angles >180°, no negative lengths, no degenerate triangles)
3. Use realistic student mistakes such as:
   - Applying wrong formula or theorem
   - Arithmetic errors with the correct approach
   - Misinterpreting diagram or problem statement
   - Confusing similar concepts (e.g., sin vs cos)
4. Avoid vague rationales like "may confuse" or "might not account for constraints"

DIFFICULTY CALIBRATION (CRITICAL - READ CAREFULLY):

When rating difficulty, distinguish between PROCEDURAL and CONCEPTUAL complexity:
- PROCEDURAL: arithmetic steps, algebraic manipulation, computational burden
- CONCEPTUAL: geometric insight required, non-obvious setup, integrating multiple theorems

Common calibration errors to AVOID:
1. **Pattern Recognition Discount**: Problems using memorized patterns (3-4-5 triangles, 30-60-90 ratios, 5-12-13 triples) are 1-2 levels EASIER than novel applications for prepared students
2. **Clean Arithmetic ≠ High Difficulty**: Perfect squares (√256, √144) and simple operations reduce procedural difficulty to 1-2/5 regardless of conceptual complexity
3. **Step Count Inflation**: Two straightforward Pythagorean applications ≠ 5/5 difficulty; count only non-routine cognitive steps
4. **Time Reality Check**: If a well-prepared student solves it in <90 seconds, difficulty is at most 2/5; <2 minutes = at most 3/5

Difficulty anchors:
- Level 1-2: Single concept with recognizable pattern OR memorized formula + one computational step. Time: 30-90 seconds
- Level 3: Two concepts combined OR non-memorized setup with straightforward execution. Time: 90-150 seconds  
- Level 4: Non-obvious geometric insight OR multi-step proof-like reasoning with careful tracking. Time: 2-3.5 minutes
- Level 5: Multiple insights required AND complex execution OR highly novel application. Time: 3-5 minutes

Rate BOTH aspects separately, then average:
- Conceptual difficulty: /5 (insight required)
- Procedural difficulty: /5 (computational burden)
- Overall difficulty: (Conceptual + Procedural) / 2

IMAGE DECISION:
- Include image when: spatial relationships are complex, diagram aids problem-solving, or typical SAT would use one
- Mark needs_image: true/false
- If true, provide detailed, unambiguous image description

VERIFICATION CHECKLIST (complete before finalizing):
□ Correct answer verified through complete mathematical solution
□ All four answer choices simplified and checked for equivalence
□ Each distractor traces to specific, realistic student error
□ No geometrically impossible values (angles >180°, etc.)
□ Answer format is consistent across all choices
□ Difficulty rating accounts for pattern recognition and clean arithmetic
□ Conceptual vs. procedural difficulty rated separately and averaged
□ Time estimate realistic for well-prepared students
```