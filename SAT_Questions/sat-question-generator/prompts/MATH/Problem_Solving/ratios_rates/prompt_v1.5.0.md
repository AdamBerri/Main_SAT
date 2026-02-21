```
Generate an SAT Math question involving ratios or rates.

SCOPE ENFORCEMENT — READ BEFORE WRITING ANYTHING:
This prompt covers ONLY two concept types:
  1. RATIOS — comparisons of two quantities using the form a:b or a/b (part-to-part or part-to-whole)
  2. RATES — quantities measured per unit of something else (speed, price per unit, work rate, flow rate, etc.)

This prompt does NOT cover:
  - Percentages or percent change (use the percentages prompt instead)
  - Pure proportions with no ratio/rate framing (e.g., "if 3/x = 5/15 find x" with no context)
  - Probability or statistics
  - Algebraic equations that happen to contain fractions

If your question does not explicitly ask a student to reason about a ratio or a rate, DISCARD it and start over.

The question should:
- Present a realistic scenario where the core mathematical operation is setting up, comparing, or applying a ratio or rate
- Require multi-step reasoning appropriate for the SAT (not just direct single-step proportions)
- Use unit conversion where appropriate (miles per hour to feet per second, price per pound to price per ounce, etc.)
- Avoid requiring specialized domain knowledge (chemistry formulas, physics formulas, etc.)
- Include the ratio or rate explicitly in the problem statement or require the student to derive it as the first step

{DIFFICULTY_DESCRIPTION}

RATIO/RATE FAITHFULNESS CHECKLIST — Complete this before writing answer choices:
Before writing any answer choices, verify your question against ALL of the following. Mark each [YES] or [NO].

  [ ] The problem explicitly involves a ratio (a:b comparison) OR a rate (quantity per unit).
  [ ] The correct answer requires manipulating that ratio or rate — not just solving a standalone equation.
  [ ] The problem is NOT primarily about percentages (e.g., "20% of X"). If yes, discard and restart.
  [ ] The problem is NOT primarily about probability (e.g., "what is the chance that..."). If yes, discard and restart.
  [ ] The scenario uses ratio/rate language: "per", "for every", "to", "compared to", "at a rate of", "ratio of", etc.
  [ ] A student who does not understand ratios or rates cannot correctly solve this problem by other means.

If ANY item is marked [NO], DISCARD the question and generate a new one.

CRITICAL REQUIREMENTS:

Mathematical Accuracy (VERIFY BEFORE FINALIZING):
- FIRST: Solve the problem completely and write out ALL calculation steps
- SECOND: Verify your arithmetic using a different method or by working backwards
- THIRD: Check that your calculated answer appears EXACTLY in the answer choices
- If your correct answer doesn't match any choice, RESTART the problem with different numbers
- Show all arithmetic explicitly (e.g., "500 + 420 = 920" not "500 + 420 = 720")
- Do not round intermediate values; only round the final answer if the problem explicitly requires it
- For multi-step problems, verify each intermediate result before proceeding

ANSWER VALIDITY — AVOID THESE FAILURE MODES:
- Never include ambiguous wording that makes the question solvable by more than one method yielding different answers
- For problems involving rates given in non-standard form (e.g., "2 gallons every 3 minutes"), convert to a single unit rate FIRST, then verify the final answer with both the converted rate and working backwards from the answer
- For problems asking about "total" quantities, re-read the stem to confirm what is being totaled — flour only, sugar only, or flour plus sugar combined; misidentifying the target quantity is the most common answer_validity failure
- After writing the correct answer, explicitly verify: "Is this the quantity the problem asked for? Not an intermediate step, not a related but different quantity?"

Answer Choices:
- All four choices (A, B, C, D) must be DISTINCT numerical values
- The mathematically correct answer MUST appear as one of the four choices
- Double-check: no two choices are identical, and the correct answer is present
- If verification reveals the correct answer is missing, regenerate the entire problem

DISTRACTOR DESIGN — FORWARD-ONLY METHOD (CRITICAL):

The single most common distractor failure is working backwards: choosing a plausible-looking number first, then inventing a post-hoc explanation for how a student might reach it. This produces incoherent, multi-path, or mathematically implausible rationales. You MUST use the forward-only method instead.

FORWARD-ONLY METHOD — Follow these steps in strict order:
  1. Solve the problem correctly and record the correct answer.
  2. Choose an error type from the list below.
  3. Re-work the problem from scratch, applying ONLY that specific error and nothing else.
  4. Record the value that results from that single, clean error. That value becomes the distractor.
  5. If the resulting value duplicates the correct answer or another distractor, choose a different error type and repeat.
  6. Never choose a value first and then search for an error that produces it.

CONSEQUENCE OF USING THE FORWARD-ONLY METHOD: If you cannot find three error types that each produce a unique, clean wrong answer for your specific problem, you must redesign the problem with different numbers or a different structure. Do not invent tortured reasoning to justify a pre-chosen distractor value.

PERMITTED ERROR TYPES:

  RATIO ERRORS:
  * "Inverted ratio" — student flips numerator and denominator (e.g., uses b/a instead of a/b)
  * "Part-to-whole vs part-to-part confusion" — student treats a part-to-part ratio as a fraction of the whole
  * "Scaling error" — student multiplies by the given quantity instead of the correct scale factor
  * "Wrong term selected from ratio" — student solves correctly but reports the other part of the ratio

  RATE ERRORS:
  * "Unit inversion" — student divides in the wrong direction when converting rates (multiplies by conversion factor instead of dividing, or vice versa)
  * "Wrong unit conversion factor" — student uses an incorrect conversion constant (e.g., 60 instead of 3600 for hours-to-seconds)
  * "Rate applied to wrong quantity" — student applies the rate to a total instead of per-unit quantity or vice versa
  * "Stopped at intermediate value" — student finds a correct intermediate result but reports it as the final answer

  SHARED ERRORS:
  * "Direct vs inverse proportion confusion" — student uses direct proportion when inverse is needed, or vice versa
  * "Ignored unit conversion entirely" — student skips a required unit conversion step, using the given numbers as-is
  * "Used ratio of totals instead of ratio of rates" — student compares total quantities when the question asks about rates

DISTRACTOR DISTINCTIVENESS RULE: Each of the three distractors must represent a DIFFERENT error type from the list above. Do not use the same error type twice.

DISTRACTOR RATIONALE FORMAT — For each distractor provide:
  1. Error type name (from the list above)
  2. The single wrong step: state precisely which number the student used incorrectly and what they used instead
  3. The complete wrong calculation from start to finish, shown step by step
  4. Confirm the calculation produces the distractor value

RATIONALE QUALITY CHECKS — Before finalizing each distractor rationale, verify:
  [ ] The wrong reasoning involves exactly ONE error. If two separate mistakes are needed to reach the distractor value, the distractor is invalid — choose a different error type.
  [ ] The wrong calculation produces the distractor value exactly, with no rounding or approximation unless the problem itself requires rounding.
  [ ] The rationale does not shift between two different error explanations or present multiple alternative paths to the same value.
  [ ] The error a real student could plausibly make given the problem's structure and numbers.
  [ ] The distractor value is not an intermediate result that appears nowhere in the correct solution path (unless the error type is "Stopped at intermediate value", in which case the value MUST appear as a natural intermediate in the correct solution).

Difficulty Calibration:
- Difficulty 1/5: Two clear steps, basic unit conversions, straightforward ratio application
- Difficulty 2/5: Three steps, one moderate complexity element (unit conversion or multi-part ratio)
- Difficulty 3/5: Three to four steps with compounding elements (multiple conversions, combined rates, or nested ratios) — the scenario must be meaningfully more complex than a difficulty-2 problem, not just the same unit-rate template with different numbers
- Difficulty 4/5: Four or more steps requiring careful setup, multiple concepts integrated, or non-obvious approach
- Difficulty 5/5: Complex multi-stage reasoning, multiple solution paths possible, requires synthesis of several concepts
- Rate your difficulty AFTER creating the problem; if calculations are straightforward, acknowledge lower difficulty
- Computational complexity should match difficulty: basic arithmetic suggests ≤3/5, while complex multi-step calculations suggest 4-5/5

SAT Authenticity:
- Test mathematical reasoning, not domain-specific knowledge (chemistry, advanced physics, etc.)
- Keep scenarios realistic and relatable (travel, pricing, work, recipes, scale drawings, mixing ingredients)
- Even at difficulty 1/5, require at least two distinct reasoning steps
- Avoid contrived numerical relationships or artificially complex scenarios
- Align with modern SAT: clear problem statement, unambiguous correct answer, realistic context
- Keep the question stem concise — SAT stems are rarely more than 3–4 sentences; multi-sentence setup with embedded tables or lengthy sub-clauses reduces authenticity

EXAMPLE SCENARIOS THAT QUALIFY (for inspiration, do not copy):
- A car travels at 55 miles per hour; how many feet does it travel in 40 seconds? (rate + unit conversion)
- A recipe uses flour and sugar in a 3:1 ratio; if you use 2.5 cups of sugar, how much flour? (ratio scaling)
- Pump A fills a tank at 12 gallons per minute, Pump B drains it at 5 gallons per minute; how long to fill 84 gallons? (combined rates)
- A map has a scale of 1 inch : 25 miles; two cities are 3.6 inches apart on the map; what is the actual distance? (ratio/scale)
- A store sells juice for $3.84 per 32-ounce bottle; what is the price per fluid ounce? (unit rate)

EXAMPLE SCENARIOS THAT DO NOT QUALIFY (discard these):
- "A jacket originally costs $80 and is now 15% off. What is the sale price?" — this is a percentage problem
- "If 3/x = 9/15, what is x?" — this is algebraic proportion with no ratio/rate context
- "There are 5 red and 3 blue marbles. What is the probability of drawing red?" — this is probability

WORKED DISTRACTOR EXAMPLE (d2 map-scale problem):

Problem: A map scale shows 2 inches = 50 miles. Two cities are 7 inches apart on the map. What is the actual distance?
Correct answer: 7 × (50/2) = 7 × 25 = 175 miles.

Distractor construction using forward-only method:

  Error type: "Unit inversion" — student inverts the scale, using 2/50 instead of 50/2.
  Wrong step: student computes 7 × (2/50) instead of 7 × (50/2).
  Wrong calculation: 7 × (2/50) = 14/50 = 0.28 miles.
  Result: 0.28 — a valid distractor if it doesn't duplicate another choice.

  Error type: "Ignored unit conversion entirely" — student treats 1 inch = 50 miles, ignoring the "2 inches" part.
  Wrong step: student uses 50 directly instead of 50/2 = 25.
  Wrong calculation: 7 × 50 = 350 miles.
  Result: 350 — a valid distractor.

  Error type: "Scaling error" — student multiplies the scale numbers together: 2 × 50 = 100, then uses 100 as the miles-per-inch rate.
  Wrong step: student uses 100 miles/inch instead of 25 miles/inch.
  Wrong calculation: 7 × 100 = 700 miles.
  Result: 700 — a valid distractor.

Note: Each distractor flows from a single, clearly named error. No distractor required inventing a contradictory second path to reach the value.
```
