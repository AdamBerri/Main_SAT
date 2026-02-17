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
   - Show ALL arithmetic explicitly with numbers: write "100 × 0.15 = 15" not "multiply by the rate"
   - For multi-step problems, verify each intermediate result before using it in the next step
   - Test by working BACKWARD: substitute your answer into the original problem and verify all conditions are satisfied with explicit calculations
   - Check that your answer is actually among the choices you generated
   - If any verification step produces a contradiction or incorrect value, STOP and regenerate the entire question
   - Document verification: "Verification: [answer] → [calculation] → [original value] ✓"

2. DIFFICULTY CALIBRATION:
   - Easy (1-2/5): Single-step or two-step with direct calculations; straightforward setup (e.g., "Find 20% of 50")
   - Medium (3/5): Requires algebraic setup OR multiple conversion steps; one non-obvious relationship (e.g., "After 30% decrease, price is $35; find original")
   - Hard (4-5/5): ONLY if the problem requires conceptual insight that isn't obvious even with answer choices available to test
   
   DIFFICULTY CAPS:
   - If students can test answer choices to find the solution without deep understanding, MAX difficulty is 3/5
   - If the problem is "apply formula(s) in sequence with clear steps," MAX difficulty is 3/5
   - Reserve 4-5/5 for problems requiring non-obvious problem representation or strategic insight about relationships
   - Multiple computational steps ≠ high difficulty; complexity must be conceptual, not just arithmetic

3. ANSWER CHOICE GENERATION:

   a) CORRECT ANSWER FIRST:
      - Solve the problem completely and verify your answer
      - Ensure this answer is mathematically correct before creating any distractors
      - Assign it to a random position (A-D), not always position A or D

   b) DISTRACTOR DESIGN - Create exactly 3 wrong answers, each targeting ONE specific error:
      
      Common high-value misconceptions to target:
      - Using the result as the base instead of the original (e.g., "$60 after 20% increase; student calculates 60 × 1.20 instead of 60 ÷ 1.20")
      - Confusing percent OF vs. percent MORE/LESS THAN
      - Adding/subtracting percentages arithmetically instead of compounding (e.g., "up 20% then down 20% = net 0%")
      - Using the percentage value as decimal incorrectly (20% → using 20 instead of 0.20)
      - Applying operations in wrong order in multi-step problems
      - Calculation errors from correct setup (off-by-one-step, correct method but arithmetic slip)
   
   c) DISTRACTOR VERIFICATION (CRITICAL):
      - For EACH distractor, write: "Distractor [X] = [value]: Student [specific error]. Calculation: [step 1] = [number], [step 2] = [number], final = [value] ✓"
      - Verify your arithmetic: actually compute each step and confirm it equals the distractor value
      - If your calculation doesn't produce the distractor value exactly, that distractor is INVALID - remove it and create a different one
      - Each distractor must result from ONE coherent error path, not multiple conflicting errors
      - Do NOT write distractors that require explanations like "student does X... or maybe Y... approximately Z"
   
   d) COVERAGE REQUIREMENTS:
      - At least one distractor for correct setup with execution error
      - At least one distractor for conceptual misunderstanding of percentage relationships
      - At least one distractor for the single most predictable misconception for this problem type
      - NO distractors requiring multiple simultaneous independent errors
      - NO distractors that are "close" to the answer without clear error logic
   
   e) UNIQUENESS CHECK:
      - Verify all four answer choices are numerically distinct
      - If two distractors produce the same value, keep only one and create a different distractor
      - Ensure no distractor accidentally equals the correct answer
   
   f) FINAL VERIFICATION:
      - Test that ONLY the correct answer satisfies all problem conditions
      - Verify each distractor fails when substituted back into the problem
      - Confirm you can articulate the single specific error producing each distractor

4. GENERATION ORDER (MANDATORY):
   Step 1: Create the problem scenario
   Step 2: Solve completely and identify the correct answer
   Step 3: Verify correct answer by backward substitution
   Step 4: Generate distractor 1 with explicit calculation verification
   Step 5: Generate distractor 2 with explicit calculation verification  
   Step 6: Generate distractor 3 with explicit calculation verification
   Step 7: Final uniqueness and validity check of all four choices
```