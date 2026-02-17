```
Generate an SAT Math question about percentages.

Topics may include:
- Percent increase/decrease
- Finding the whole, part, or percent
- Multi-step percentage problems
- Percent in real-world contexts (tax, discount, interest)

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER VERIFICATION (MANDATORY):
   - After generating the question, solve it step-by-step independently
   - Verify your designated correct answer by working through ALL calculations with explicit arithmetic
   - For multi-step problems, check each intermediate result numerically
   - Test by working BACKWARD from your answer to confirm it produces the given values in the problem
   - Verify that substituting your answer into the problem conditions yields TRUE statements
   - If verification fails at any point, regenerate the question with corrected values or answer
   - Document your verification work to ensure it was actually performed

2. DIFFICULTY CALIBRATION:
   - Easy (1-2/5): Single-step or two-step with direct calculations; straightforward setup with obvious solution path
   - Medium (3/5): Requires algebraic setup OR multiple conversion steps; may involve interpreting relationships between quantities
   - Hard (4-5/5): Demands insight to set up equations, multiple compound operations, or non-obvious problem representation; solution path requires strategic thinking, not just methodical execution
   
   IMPORTANT: Multiple-choice format reduces effective difficulty since students can test answer choices. When rating difficulty 4-5/5:
   - Consider whether testing answer choices would make the problem substantially easier
   - If the setup is clear and algebra is straightforward once understood, cap difficulty at 3/5
   - Reserve 4-5/5 for problems requiring genuine conceptual insight or non-obvious problem representation
   - Computational complexity alone does not justify high difficulty ratings

3. ANSWER CHOICE GENERATION:
   
   a) DISTRACTOR DESIGN - Each wrong answer must target ONE specific, predictable misconception:
      - Misunderstanding percent OF vs. percent increase/decrease
      - Confusing part with whole (e.g., using $40 as base when it's the result)
      - Adding percentages linearly instead of compounding
      - Incorrect order of operations in multi-step problems
      - Using wrong base value for percentage calculation
      - Confusing percent with decimal (e.g., using 15 instead of 0.15)
   
   b) DISTRACTOR VERIFICATION:
      - For each wrong answer, write out the EXACT algebraic steps that produce that value
      - Verify numerically that your stated misconception actually yields the distractor value
      - If you cannot show clear algebraic steps producing the value, the distractor is invalid
      - Example format: "Distractor B ($500): Student uses $408 as 0.65 of unknown value, calculates 408/0.65 = $627.69. ERROR IN RATIONALE - this does not produce $500, so regenerate this distractor."
   
   c) MISCONCEPTION QUALITY:
      - Each distractor should represent an error students naturally make, not arithmetic mistakes
      - Avoid distractors requiring multiple simultaneous errors
      - Ensure arithmetic mistakes that produce distractors are reasonable (not "25% of 40 = 25")
   
   d) COVERAGE REQUIREMENTS:
      - Include distractors for the most obvious misconceptions students would encounter
      - Include at least one distractor for students who set up correctly but make execution errors
      - Ensure all common paths through the problem are represented
   
   e) FINAL VERIFICATION:
      - Confirm mathematically that only ONE answer choice satisfies the problem conditions
      - Verify that all distractors are numerically distinct from the correct answer
      - Double-check that no distractor accidentally equals the correct answer through an alternative valid method
```