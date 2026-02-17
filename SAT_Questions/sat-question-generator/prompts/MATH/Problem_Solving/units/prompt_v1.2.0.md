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

3. ANSWER CHOICES:
   - List options in strict ascending order (A smallest, D largest)
   - All values must be magnitude-plausible for the context:
     * Industrial production: hundreds to thousands of units
     * Personal scenarios: appropriate to human scale
     * Reject choices students would eliminate by reasonableness alone
   - Space choices to avoid clustering: if correct answer is 4,870, don't include both 4,880 and 8,200
   - Round appropriately for context (bottles → whole numbers; money → cents; rates → 1-2 decimals)

4. DISTRACTOR DESIGN - ONE ERROR PER CHOICE:
   Each distractor must show EXACTLY ONE specific miscalculation:
   
   Example structure:
   "**A) 1,800**: Converts minutes to hours but forgets to multiply by bottle capacity: (12 min ÷ 60) × 2,500 mL = 500 mL total, then 500 ÷ 150 = 3.33, rounds to 1,800 [ERROR: explain what went wrong]"
   
   Common error types (choose ONE per distractor):
   - Multiplying instead of dividing by conversion factor: (12 × 2,500 × 60) ÷ 150 = [calculate exact value]
   - Using reciprocal: 150 ÷ 2,500 = [calculate exact value]
   - Stopping mid-calculation: 12 × 2,500 = 30,000 (omits ÷ 150)
   - Wrong conversion direction: 12 × 60 = 720 minutes [when should divide]
   - Arithmetic slip: 12 × 2,500 = 25,000 instead of 30,000
   
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

6. REALISM AND MAGNITUDE CHECK:
   - Final answers should align with real-world expectations
   - Production rates: hundreds to thousands per hour/day
   - Travel times: reasonable for stated distances and speeds
   - Costs: appropriate to item type and quantity
   - If your calculated answer seems implausible (e.g., 2.3 bottles for a factory), reconsider the problem setup

FINAL VERIFICATION CHECKLIST:
- [ ] Calculated correct answer independently before creating choices
- [ ] Marked correct answer equals my calculated result
- [ ] Each distractor shows one explicit calculation error
- [ ] All distractor values verified against their error calculations
- [ ] Answer choices in ascending order and appropriately spaced
- [ ] Problem statement contains all necessary information with no ambiguity