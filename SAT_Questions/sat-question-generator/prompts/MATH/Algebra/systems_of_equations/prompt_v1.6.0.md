Generate an SAT Math question involving systems of two linear equations.

The question should:
- Present a scenario naturally requiring two equations
- Have exactly one solution (unless testing special cases at higher difficulty)
- Test either the solution process or interpretation of solutions

{DIFFICULTY_DESCRIPTION}

CRITICAL REQUIREMENTS:

1. ANSWER KEY VERIFICATION (MOST CRITICAL - ERRORS HERE FAIL THE ENTIRE QUESTION):
   - After writing the question, SOLVE THE SYSTEM COMPLETELY using substitution or elimination
   - Show ALL arithmetic steps explicitly (no mental math for multi-step calculations)
   - Verify your answer satisfies BOTH original equations by direct substitution
   - Check: Does substituting your x and y values make BOTH equations true? If not, re-solve from scratch
   - The answer key MUST match your verified solution—mark the choice that equals your verified answer
   - If solving for an expression (like 2x + y), compute it using your verified x and y values
   - STOP and re-verify if any answer choice is within 20% of your computed answer but doesn't match exactly

   MANDATORY STEP-BY-STEP SOLVE BEFORE FINALIZING:
   Before you write any answer choices, complete this block in full:
     SOLVE:
       Step 1: [write out the elimination or substitution step]
       Step 2: [solve for the first variable, showing arithmetic]
       Step 3: [back-substitute to find the second variable, showing arithmetic]
       CHECK equation 1: [plug both values in, confirm LHS = RHS]
       CHECK equation 2: [plug both values in, confirm LHS = RHS]
       CORRECT ANSWER VALUE: [state it explicitly]
   Only after completing this block may you write the answer choices. If the check fails, rewrite the system before proceeding—never patch the answer choice to match a bad system.

2. MATHEMATICAL CONSISTENCY:
   - Before finalizing, verify that all constraints in the problem are mutually compatible
   - If the problem involves three or more relationships, check that they don't create an overdetermined system
   - Ensure context constraints (like percentages, physical quantities) align with the mathematical setup
   - Test: Can the scenario actually exist with the numbers you've chosen?

3. WORDING CLARITY FOR RATES AND CONCEPTUAL QUESTIONS (addresses answer_validity failures):
   When the question involves rates, speeds, or combined quantities, every quantity must be expressed in unambiguous units with a self-evident mathematical translation. Follow these rules:

   RATE / TRAVEL PROBLEMS — MANDATORY WORDING CHECKS:
   - State the time duration explicitly and separately for each condition. BAD: "together covered 130 miles per hour of combined travel time." GOOD: "together they drove a total of 260 miles" (when both drove for 2 hours each).
   - Never phrase a constraint as "[value] [unit1] per [unit2] of [unit3]" if it requires three-unit reasoning that can be read multiple ways. Use one clear constraint: total distance, total time, or a rate for one entity at a time.
   - If the scenario has two separate time periods (e.g., Monday and Tuesday), state the total miles covered or the combined rate per hour for that period explicitly — never leave it implicit.
   - After writing the stem, read each sentence and write the equation it produces. If any sentence maps to more than one plausible equation, rewrite that sentence before proceeding.

   PARAMETER-BASED / "NO SOLUTION" QUESTIONS — MANDATORY WORDING CHECKS:
   - State the parameter clearly with a standard variable like $k$ or $c$ — not as a coefficient embedded in a phrase that requires inference.
   - After writing the stem, confirm the question asks for exactly one thing: "for what value of [parameter] does the system have no solution?" (or infinitely many solutions). Do not bundle additional conditions.
   - Verify that the system written out from the stem is the exact system used in the solution — no hidden constraints arising from the real-world context that would make the mathematical answer invalid.

4. DISTRACTOR DESIGN — FORWARD ENGINEERING REQUIRED:
   Distractors must be designed FORWARD (error → value), never BACKWARD (value → invented justification).

   MANDATORY PROCEDURE FOR EACH DISTRACTOR:
     Step A: Choose a named error type from the list below
     Step B: Apply that error to the actual solution steps and compute the resulting wrong answer
     Step C: Use that computed wrong answer as the distractor value

   Never select a "plausible-looking" number and then construct a post-hoc justification. If you cannot compute the distractor value directly from a named error in one or two steps, redesign the distractor.

   VALID ERROR TYPES (choose one per distractor):
     - Wrong-variable error: student solves the system correctly but reports the other variable (e.g., asked for x, gives y)
     - Sign flip during elimination: student subtracts when they should add (or vice versa) when combining equations; compute the resulting wrong value
     - Coefficient misread: student uses the wrong coefficient (e.g., reads 3x as 2x or 4x); compute what that gives
     - Single-equation error: student uses only one equation and ignores the second constraint; show which equation and what answer it produces
     - Substitution arithmetic error: student correctly finds one variable but makes one specific arithmetic mistake (state which step) when back-substituting; compute the exact wrong result
     - Forgot to halve / forgot to double: student omits a factor of 2 at a key step (common in perimeter and rate problems); compute the result

   DISTRACTOR RATIONALE FORMAT: One sentence, stating the error and the exact arithmetic that produces the wrong answer.
   GOOD: "Solves for y instead of x: back-substituting t = 5 into t + f = 8 gives f = 3, and the student reports f = 3."
   GOOD: "Makes a sign error when eliminating: adds instead of subtracts, giving 2b = 21 + 6 = 27 instead of 2b = 21 − 6 = 15, so b = 13.5."
   BAD: "Makes a computational mistake that leads to an incorrect intermediate value."
   BAD: "Misapplies the formula in a confusing way and arrives at 22 after several errors."

   DISTRACTOR UNIQUENESS: The four answer choices (including the correct one) must all be distinct numbers. Two distractors may not share a value, even if derived from different errors.

   AT DIFFICULTY 1-2 — EXTRA DISTRACTOR REALISM REQUIRED:
   Because easy questions have simple arithmetic, the error must be one that a genuine student would plausibly make at that skill level. Apply this test to every distractor before finalizing:
     REALISM TEST: "Could a student who correctly sets up the system but makes exactly this one arithmetic slip actually arrive at this value?" If the answer requires a second assumption or a follow-on error, the distractor fails. Discard it and choose a different error type.

   Specifically at difficulty 1-2, AVOID these patterns which produce unrealistic distractors:
     - Claiming a sign error produces a clearly impossible value (e.g., a negative count of tickets, an absurdly large number) and then inventing a further assumption to reach a plausible answer
     - Claiming a student "forgets to divide" in a context where the division step is so obvious it would never be skipped
     - Using "coefficient misread" at difficulty 1-2 if the misread coefficient would require re-reading a clearly stated integer as a different integer with no resemblance to the original

   AT DIFFICULTY 3: the solution involves multiple steps (multiply an equation, then eliminate, then back-substitute). Each distractor must pinpoint a single wrong turn at one specific step in this multi-step process — not a cascade of two or more errors. If the only way to reach a candidate value requires two sequential mistakes, discard it and choose a different error type.

5. DIFFICULTY CALIBRATION:
   - Difficulty 1-2: Coefficients from {1, 2, 3, 4, 5, 10}, one equation already solved for a variable OR obvious elimination (like x + y and x - y), all integer solutions
   - Difficulty 3: Need to multiply one equation before elimination OR substitute an expression into another equation, may have one fractional coefficient or fractional answer
   - Difficulty 4-5: Strategic manipulation required (recognizing non-obvious combinations) OR conceptual interpretation (system represents something students must analyze, not just solve mechanically)
   - Rate difficulty on: How obvious is the solution path? NOT on whether arithmetic is messy

6. QUESTION VARIETY — MANDATORY FORMAT ROTATION:
   Template repetition (cookie-cutter questions with identical structures) is a known failure mode, especially at easy difficulty. Each question generated in a batch must use a DIFFERENT format and context from the others. To enforce this:

   BANNED at easy difficulty if already used in the same batch:
     - "tickets cost $A and $B, total sold N, total revenue $R, find number of each"
     - "two numbers sum to S and differ by D, find the larger"
     - "items cost $A each and $B each, bought N total spending $T"

   REQUIRED FORMAT VARIETY — choose from different categories each time:
     a) Solve-for-variable: "What is the value of x?" (direct solve)
     b) Solve-for-expression: "What is the value of 3x − y?" (requires computing a combination after solving)
     c) Interpretation: "Which of the following represents the number of [item] purchased?" (real-world meaning)
     d) Parameter-based: "For what value of k does the system have no solution?" (structural/conceptual)
     e) Graph-based: "At what point do the two lines intersect?" (coordinate form)
     f) Comparison: "How many more [A] than [B] were sold?" (difference of solutions)

   REAL-WORLD CONTEXT VARIETY — rotate through different domains:
     - Pricing / retail (tickets, groceries, items)
     - Motion / travel (rates, distances, times)
     - Mixtures / chemistry (concentrations, blends)
     - Geometry (perimeters, angles, dimensions)
     - Finance / budgeting (costs, savings, earnings)
     - Science / data (populations, growth, measurements)
     - Sports / scoring (points, statistics)
   Do NOT use the same domain in consecutive questions unless explicitly forced by difficulty constraints.

7. EXPLANATION QUALITY:
   - Present ONE clean solution path from start to verified answer
   - No self-corrections, no "wait, let me recalculate", no "I made an error"
   - If you need to recalculate during generation, delete the false start entirely
   - Format: State the approach → Execute it with clear steps → Verify the answer → State why it's correct
   - End with explicit verification: "Checking: [substitute values into both original equations]"

8. SAT AUTHENTICITY:
   - ALWAYS use a real-world context (pricing, mixtures, geometry, rates, tickets, ages, etc.) — never present a bare abstract system of equations
   - Even at difficulty 1-2, wrap the system in a brief, natural scenario
   - Keep numbers calculator-friendly (avoid numbers requiring long division)
   - Order answer choices numerically (ascending for positive numbers)
   - Make the question completely self-contained with unambiguous wording

FINAL CHECK BEFORE SUBMITTING:
□ I completed the MANDATORY SOLVE block (Steps 1-3 + both equation checks) before writing answer choices
□ The answer choice I marked as correct exactly equals the value produced by the MANDATORY SOLVE block
□ For each distractor: I chose the error type FIRST, computed the wrong value from that error, and used that value as the choice — I did NOT pick a value and justify it afterward
□ Each distractor rationale is one sentence naming the error and showing the exact arithmetic that produces the wrong answer
□ At difficulty 1-2, I applied the REALISM TEST to every distractor: a student making exactly ONE slip reaches this value without any additional assumption
□ At difficulty 3, each distractor results from exactly ONE wrong turn at ONE step — not a chain of two or more errors
□ All four answer choices are distinct values
□ This question uses a different format category and real-world domain than the previous question in the batch
□ The scenario is mathematically possible with the given constraints
□ The difficulty rating matches the cognitive demand, not arithmetic complexity
□ The question uses a real-world context, not a bare algebraic system
□ For rate/travel problems: I re-read every sentence of the stem, wrote the equation it produces, and confirmed each sentence maps to exactly one unambiguous equation
□ For parameter-based/no-solution problems: I confirmed the stem asks for exactly one parameter value and that the mathematical system written from the stem matches the system used in the solution
