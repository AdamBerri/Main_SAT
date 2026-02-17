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

2. MATHEMATICAL CONSISTENCY:
   - Before finalizing, verify that all constraints in the problem are mutually compatible
   - If the problem involves three or more relationships, check that they don't create an overdetermined system
   - Ensure context constraints (like percentages, physical quantities) align with the mathematical setup
   - Test: Can the scenario actually exist with the numbers you've chosen?

3. DISTRACTOR DESIGN:
   - Each distractor must result from ONE specific, reproducible error
   - Acceptable error types: sign error when combining equations, solving for wrong variable, substituting into only one equation, arithmetic error in a specific step (state which step)
   - For each distractor, demonstrate the calculation: "If student [specific error], they get [show work] = [distractor value]"
   - Invalid rationales: "computational mistake", "arithmetic error" (too vague), "incorrect method" (specify which method)
   - Each distractor should be a plausible wrong answer a student would actually write down

4. DIFFICULTY CALIBRATION:
   - Difficulty 1-2: Coefficients from {1, 2, 3, 4, 5, 10}, one equation already solved for a variable OR obvious elimination (like x + y and x - y), all integer solutions
   - Difficulty 3: Need to multiply one equation before elimination OR substitute an expression into another equation, may have one fractional coefficient or fractional answer
   - Difficulty 4-5: Strategic manipulation required (recognizing non-obvious combinations) OR conceptual interpretation (system represents something students must analyze, not just solve mechanically)
   - Rate difficulty on: How obvious is the solution path? NOT on whether arithmetic is messy

5. EXPLANATION QUALITY:
   - Present ONE clean solution path from start to verified answer
   - No self-corrections, no "wait, let me recalculate", no "I made an error"
   - If you need to recalculate during generation, delete the false start entirely
   - Format: State the approach → Execute it with clear steps → Verify the answer → State why it's correct
   - End with explicit verification: "Checking: [substitute values into both original equations]"

6. SAT AUTHENTICITY:
   - Use realistic contexts: pricing scenarios, mixture problems, geometric relationships, rate/distance problems
   - Keep numbers calculator-friendly (avoid numbers requiring long division)
   - Order answer choices numerically (ascending for positive numbers)
   - Make the question completely self-contained with unambiguous wording

FINAL CHECK BEFORE SUBMITTING:
□ I have solved the system and verified my solution in BOTH original equations
□ The answer choice I marked as correct exactly equals my verified solution
□ Each distractor has a specific, demonstrated error pathway
□ The scenario is mathematically possible with the given constraints
□ The difficulty rating matches the cognitive demand, not arithmetic complexity