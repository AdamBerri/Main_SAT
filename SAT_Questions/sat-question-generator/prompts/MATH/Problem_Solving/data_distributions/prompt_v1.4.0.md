```
Generate an SAT Math question about statistical measures and data distributions.

Topics may include:
- Mean, median, mode, range
- Standard deviation interpretation (conceptual understanding, not computation)
- Comparing distributions
- Effects of data changes on statistics

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER VALIDITY (MOST COMMON ERROR - TRIPLE CHECK):
   - BEFORE writing answer choices, manually calculate the correct answer on paper
   - Show your calculation work explicitly in your explanation
   - For questions involving data removal/addition:
     * Calculate the ORIGINAL statistic first
     * Calculate the NEW statistic second
     * Compare them to determine the effect
   - Verify your designated correct answer (A/B/C/D) matches your calculated result
   - Common mistakes to avoid:
     * Stating "mean decreases" when your calculation shows it increases
     * Arithmetic errors (e.g., 360 - 301 = 59, not 57)
     * Confusing which direction a statistic changes
   - If any doubt exists, recalculate before finalizing

2. DISTRACTOR DESIGN (MOST FREQUENT FAILURE - READ CAREFULLY):
   The most common reason questions fail evaluation is weak distractors. A distractor is weak if
   it can be eliminated without understanding the concept, or if its misconception rationale is
   vague or implausible.

   CONSTRUCTION RULE: For every distractor, write its misconception label FIRST, then derive the
   numerical value from that misconception. Never work backward from a "nearby number."

   REQUIRED MISCONCEPTION TYPES FOR DATA DISTRIBUTION QUESTIONS — use at least 2 of these:
   a) Wrong operation on the statistic: e.g., student finds mean of the removed values instead of
      the mean of the remaining values; student computes sum/n instead of sum/(n-1) after removal.
   b) Median position error: student uses the old position formula on the new (shorter) list, or
      forgets to re-sort after adding/removing a value.
   c) Statistic confusion: student applies the rule for mean to the median (or vice versa) —
      e.g., believes removing a value below the current median always lowers the median.
   d) Direction reversal: student correctly identifies which statistic changes but reverses the
      direction — plausible only when the answer is non-obvious (do NOT use this for "remove the
      largest value" style questions where the direction is obvious).
   e) Partial computation: student computes an intermediate step and treats it as the final answer
      — e.g., reports the new sum instead of the new mean.

   QUALITY CHECKS FOR EACH DISTRACTOR:
   - State its misconception in one sentence (this must appear in the explanation).
   - Confirm the distractor value is numerically distinct from the correct answer by a margin
     large enough that a student cannot eliminate it by estimation alone.
   - Confirm a student with 70–80% understanding of the topic WOULD choose it.
   - Confirm a student who fully understands the topic would NOT choose it.
   - Do NOT create a distractor that is simply a small rounding variant of the correct answer
     unless the question context makes rounding a genuine conceptual trap.

3. SAT AUTHENTICITY:
   - Focus on conceptual understanding and data interpretation
   - Questions should require genuine reasoning, not mechanical elimination
   - Avoid overly obvious patterns (e.g., "removing the largest value always decreases the mean" is too direct)
   - Add nuance: use data where the effect isn't immediately obvious, or where multiple statistics change
   - Computational complexity:
     * Easy: 1-2 arithmetic operations (addition, subtraction, simple division)
     * Medium: 2-3 operations with one conceptual step
     * Hard: 3-4 operations OR 2 operations with sophisticated conceptual reasoning
   - Do NOT require computing standard deviation from scratch
   - For standard deviation: provide values and ask about interpretation/comparison

4. DIFFICULTY CALIBRATION (FREQUENTLY OVERESTIMATED):
   - Easy (1-2/5): Single operation, direct application of definition (30-45 seconds)
     * Example: "What is the mean of 2, 4, 6, 8?"
   - Medium (3/5): Two conceptual steps OR 2-3 calculations (60-75 seconds)
     * Example: "If the mean of 5 numbers is 20, and we add a 6th number..."
   - Hard (4-5/5): Multi-step reasoning with non-obvious insight OR tracking multiple statistics simultaneously (90+ seconds)
     * Example: "Given two datasets with same mean but different spreads, which change affects..."
   - BEFORE assigning difficulty, count actual steps required and time a solution
   - If your question can be solved in under 45 seconds, it's Easy (1-2/5), NOT Medium
   - MATCH THE TARGET LEVEL PRECISELY: After writing your question, re-read the {DIFFICULTY_DESCRIPTION}
     and confirm every criterion it specifies (step count, time, concept depth) is satisfied.
     If the question falls short of or exceeds the target level, revise it before continuing.

5. D2 (MEDIUM-LOW) QUESTION STANDARDS:
   - Use small, clean data sets with integer values that produce unambiguous statistics
     * Prefer datasets of 5-9 values where every calculation is exact (no rounding)
     * Example of a clean set: {3, 5, 7, 9, 11} — mean, median, range all whole numbers
     * Avoid sets where mean requires rounding or where median depends on precise ordering logic
   - Verify every statistic in your data set before writing the question:
     * List the values in sorted order
     * Compute mean = (sum) / (count) — confirm it is exact or clearly expressed
     * Identify median position = (n+1)/2 — confirm the median value is unambiguous
     * Confirm mode is clear (or explicitly state there is no mode if needed)
     * Confirm range = max - min
   - Answer choices must be clearly distinguishable — avoid options that differ by only 0.5 or 1
     when the question context makes that difference hard to verify confidently
   - The correct answer must be reachable by a straightforward 2-step procedure
     with no hidden subtleties; save subtle traps for d3+ questions

6. STEP-BY-STEP STATISTICAL VERIFICATION (ALL DIFFICULTY LEVELS):
   Before finalising any question, explicitly perform and record these checks:

   STEP A — Sort the data set in ascending order and list it.
   STEP B — Compute the mean: sum all values, divide by count. Write out the arithmetic.
   STEP C — Identify the median: locate the middle value(s) by position. Write out the position formula.
   STEP D — Identify the mode(s): list value frequencies.
   STEP E — Compute the range: max minus min.
   STEP F — If standard deviation is mentioned: confirm you are using it conceptually only
             (larger spread = larger SD; do not require the formula).
   STEP G — For "after change" questions: repeat Steps A–F on the modified data set.
   STEP H — Confirm the correct answer letter matches your Step B–G results.
   STEP I — For each distractor: write its misconception label, show the calculation a student
             making that error would perform, and confirm the resulting value is numerically
             distinct from all other answer choices.

   These steps must appear in the explanation field of your output. Do not skip or abbreviate them.

7. FINAL VERIFICATION CHECKLIST:
   □ I have manually calculated the answer and it matches the designated correct choice
   □ Each distractor's misconception is named explicitly in the explanation (not just "wrong approach")
   □ I derived each distractor's value FROM its misconception (not the reverse)
   □ Each distractor would plausibly fool a student with partial understanding
   □ No distractor can be eliminated by estimation or without conceptual knowledge
   □ Difficulty rating matches actual solution time and step count
   □ Difficulty rating matches every criterion in {DIFFICULTY_DESCRIPTION}
   □ For d2 questions: data set is clean, integer-friendly, and all statistics are unambiguous
   □ Steps A–I from the verification protocol are present in the explanation
   □ Question requires genuine reasoning, not pattern recognition

Complete this checklist mentally before submitting your question.
```
