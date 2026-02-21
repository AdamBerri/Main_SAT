Generate an SAT Math question involving unit conversion or dimensional analysis.

The question should:
- Require converting between units (distance, time, weight, volume, currency, etc.)
- Use realistic measurement scenarios with plausible numerical values
- Test understanding of rate units (e.g., miles per hour, dollars per pound, liters per minute)

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER KEY ACCURACY - MANDATORY VERIFICATION PROTOCOL:
   - Write out the complete solution BEFORE creating answer choices
   - Show each conversion step with explicit cancellation: (quantity × unit₁) × (unit₂/unit₁) = (quantity × unit₂)
   - Calculate the exact numerical answer to at least 2 decimal places
   - Create answer choices with this verified answer as the correct option
   - After drafting choices, re-calculate to confirm the marked answer matches your solution
   - Check: Does the calculation path use the numbers given in the problem consistently?
   - Ensure no parameter is modified or assumed between problem statement and solution

2. PROBLEM STATEMENT CLARITY:
   - State all given values explicitly and unambiguously
   - Specify exactly what quantity the student must find
   - Include all necessary conversion factors or rates
   - Ensure the question has exactly one correct interpretation
   - Example: "A machine produces 2,500 mL per minute. Each bottle holds 150 mL. How many bottles are produced in 12 minutes?" (Not: "How many bottles does production require?")
   - Stay tightly focused on unit conversion / dimensional analysis; do not drift into algebra, geometry, or other domains

3. ANSWER CHOICES:
   - List options in strict ascending order (A smallest, D largest)
   - All values must be magnitude-plausible for the context:
     * Industrial production: hundreds to thousands of units
     * Personal scenarios: appropriate to human scale
     * Reject choices students would eliminate by reasonableness alone
   - Space choices to avoid clustering: if correct answer is 4,870, don't include both 4,880 and 8,200
   - Round appropriately for context (bottles → whole numbers; money → cents; rates → 1-2 decimals)

4. DISTRACTOR DESIGN - ONE ERROR PER CHOICE:
   Each distractor must represent a REALISTIC unit-conversion mistake a student could plausibly make.
   Acceptable distractor sources (in priority order):
   a) **Wrong conversion factor** — using an incorrect but believable factor (e.g., 1 mile = 5,000 ft instead of 5,280 ft; 1 kg = 2.0 lb instead of 2.205 lb)
   b) **Inverted conversion** — multiplying instead of dividing by the factor, or using the reciprocal (e.g., ÷ 60 when should × 60)
   c) **Forgetting to convert** — leaving one unit unconverted in a multi-step problem (e.g., converting miles to feet but leaving hours unconverted when finding feet per second)
   d) **Mixing metric and imperial** — substituting a metric value where an imperial one was given, or vice versa (e.g., treating km as miles, or using 1 L ≈ 1 qt instead of 1 L ≈ 1.057 qt)
   e) **Stopping one step early** — producing an intermediate result rather than the final answer

   NEVER use arbitrary or random numbers as distractors. Every distractor value must be the exact result of a specific, describable calculation error. If you cannot write a one-sentence explanation of the mistake that produces a given value, discard that distractor and choose a different error.

   For EACH distractor:
   - Write the miscalculation step-by-step showing the wrong operation
   - Calculate the exact wrong answer it produces
   - Verify this matches the choice value you listed
   - Use clear, specific language: not "confuses values" but "multiplies by 60 instead of dividing"

5. DIFFICULTY CALIBRATION - STRUCTURAL COMPLEXITY:
   - **Level 1-2**: Single conversion, 2-3 operations, familiar units (miles↔feet, hours↔minutes)
   - **Level 3**: Two conversions OR rate calculation with context interpretation
   - **Level 4-5**: Three+ conversions OR compound rates (miles/hour → feet/second) OR requires equation setup

   Difficulty is determined by:
   - Number of conversion steps required
   - Whether rates must be manipulated (reciprocals, compounds)
   - Need to set up proportions or equations
   - NOT by whether arithmetic is messy

   FOR LEVEL 4-5 QUESTIONS SPECIFICALLY:
   - "Multi-step" must mean genuinely greater conceptual demand, not just longer arithmetic
   - At least one step must require the student to recognize which unit to convert and in which direction (the conversion path is not obvious)
   - Compound rate manipulation (e.g., converting miles/hour to feet/second requires two independent conversions applied simultaneously) is ideal
   - Avoid questions whose only added complexity is more decimal places or larger numbers — those are NOT harder, just more tedious
   - A valid d4-d5 question: student must track two unit dimensions at once, or must invert a rate partway through, or must decide which of several given conversion factors to chain together

6. REALISM AND MAGNITUDE CHECK:
   - Final answers should align with real-world expectations
   - Production rates: hundreds to thousands per hour/day
   - Travel times: reasonable for stated distances and speeds
   - Costs: appropriate to item type and quantity
   - If your calculated answer seems implausible (e.g., 2.3 bottles for a factory), reconsider the problem setup

FINAL VERIFICATION CHECKLIST:
- [ ] Calculated correct answer independently before creating choices
- [ ] Marked correct answer equals my calculated result
- [ ] Each distractor represents a named, plausible unit-conversion error (wrong factor, inverted conversion, forgotten conversion, metric/imperial mix-up, or early stop)
- [ ] No distractor is an arbitrary or unexplained number
- [ ] All distractor values verified against their error calculations
- [ ] Answer choices in ascending order and appropriately spaced
- [ ] Problem statement contains all necessary information with no ambiguity
- [ ] Problem stays within the units/dimensional-analysis domain (no unintended domain drift)
- [ ] If difficulty is d4 or d5, confirmed that complexity is conceptual (not just arithmetic length)
