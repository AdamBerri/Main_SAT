```
Generate an SAT Math question about linear functions and their properties.

The question may test:
- Slope and y-intercept interpretation
- Rate of change in context
- Linear function notation f(x)
- Graphical representation of linear functions

CRITICAL REQUIREMENTS:

1. ANSWER VALIDITY:
   - The problem must be fully determined - provide sufficient constraints to uniquely determine the answer
   - Verify the correct answer mathematically before finalizing using complete calculations
   - Ensure the answer is physically/contextually reasonable (no negative heights, impossible times, etc.)
   - The question wording must lead unambiguously to the keyed answer using standard mathematical interpretation
   - Don't include answer choice values in the problem stem (prevents recognition over computation)
   - PRECISION CHECK: After computing the correct answer, re-read the question stem word-for-word and confirm the answer matches exactly what was asked (e.g., if asked for the y-intercept, confirm you are returning the y-intercept value, not a coordinate pair or the slope)
   - UNITS AND LABELS: If the problem uses units or a specific variable name, the correct answer must include or match them exactly
   - HARD QUESTION VALIDITY: For difficulty 4-5, the question must require genuinely multi-step reasoning. If you can solve the problem in one or two trivial steps, it is not a hard question — redesign it to introduce a real second layer of reasoning (e.g., find the function first, then use it; interpret the result in context; compare two functions; work backwards through two unknowns).

2. QUESTION CLARITY:
   - Use precise mathematical language
   - "increases by 3 times" means the increase equals 3 times the original (total becomes 4x)
   - "is 3 times" means the final value equals 3 times the original (total is 3x)
   - Avoid phrasing that could be interpreted multiple ways
   - The most natural reading of the question should yield the correct answer

3. DISTRACTOR DESIGN (MOST IMPORTANT):
   - Each distractor must arise from ONE specific, plausible computational or conceptual error
   - Write the exact error calculation that produces each distractor value
   - Example of good rationale: "Uses -8 instead of 8 for slope: y = -8(3) + 10 = -24 + 10 = -14"
   - Example of bad rationale: "Confuses slope concepts" or "Arithmetic error"
   - Verify each distractor calculation produces the stated value
   - Common distinct errors to consider: sign errors (+/- flip), confusing slope with y-intercept, swapping x and y, using wrong operation (×/÷ or +/-), unit conversion errors, using wrong formula component
   - Ensure all four distractors result from DIFFERENT error types - no redundancy
   - Avoid convoluted multi-step error pathways that no student would actually follow

   DISTRACTOR QUALITY AT EASY DIFFICULTY (1-2):
   - Easy questions are especially prone to weak distractors because the correct path is short
   - Each distractor must still represent a SINGLE, COMMON student mistake — not an artificial or contrived error
   - Good easy distractors: reading the wrong coefficient, forgetting the constant term, substituting into the wrong variable, sign error on a single term
   - Bad easy distractors: combining two unrelated errors, describing a vague "confusion," or producing a value no student would reasonably get
   - The distractor rationale must be a SINGLE sentence showing the exact wrong calculation, e.g.: "Reads the slope coefficient 3 as the y-intercept: answers 3 instead of 7"
   - If you cannot write a clear one-sentence error pathway, the distractor is too convoluted — redesign it

   DISTRACTOR SEPARATION CHECK: After choosing all four distractors, verify that no two distractors are within 10% of each other in value (or within 1 unit for small integers). If two distractors are nearly identical in magnitude, replace one with an error from a different category. Each distractor should look meaningfully different from all others and from the correct answer when a student scans the choices.

4. FAITHFULNESS TO LINEAR FUNCTIONS:
   - Every question must require direct reasoning about a LINEAR function or linear relationship — a function of the form f(x) = mx + b or equivalent
   - Do not drift into purely arithmetic word problems that happen to mention a "function" in passing
   - The core skill tested must be one of: interpreting slope/rate of change, interpreting y-intercept/initial value, evaluating or inverting a linear function, writing a linear equation from given information, or reading/comparing linear graphs
   - If the question uses a real-world context, the linear function (its equation, graph, or table) must be the central mathematical object — not merely background flavor
   - AVOID EQUATION-GIVEN PLUG-AND-SOLVE AT MEDIUM DIFFICULTY: If the question hands the student a complete equation like f(x) = 75x + 150 and asks them to solve for x given a y-value, that is a difficulty 1-2 task. At difficulty 3, the student must either (a) derive part of the function from given information, or (b) interpret what the slope or intercept means in context, or (c) reason about the function without having every parameter handed to them directly.

   FAITHFULNESS AT EASY DIFFICULTY (1-2) — MOST IMPORTANT FIX:
   The most common faithfulness failure at difficulty 2 is generating questions that are SAT-adjacent but not authentically SAT-style. Authentic SAT linear function questions at D1-D2 do NOT simply hand the student a naked equation and ask them to read off a coefficient or evaluate a single substitution. Instead, they:

   a) PREFER CONTEXTUAL FRAMING: The function is presented within a real-world scenario (cost, distance, temperature, etc.) and the question asks what a specific part of the function represents or what the output means in context.
      - Good D2: "The function C(t) = 12t + 25 gives the cost in dollars to rent a bicycle for t hours. What is the hourly rental rate, in dollars per hour?" (Tests identifying slope in context.)
      - Bad D2: "The function f(x) = 12x + 25. What is f(3)?" (Pure symbol manipulation with no meaning.)

   b) USE TABLE OR GRAPH PRESENTATION: Present two or three (x, y) pairs or a described graph — student reads slope or intercept from the pattern.
      - Good D2: "The table shows values of the linear function h." [table with x=0,h=8; x=2,h=14] "What is the slope of the graph of h in the xy-plane?"

   c) ASK FOR CONTEXTUAL MEANING, NOT JUST VALUE: "What does the value 40 represent in the function P(n) = 40n + 120?" is more authentic than "What is the slope of P(n) = 40n + 120?"

   d) AVOID THESE SPECIFIC D2 ANTI-PATTERNS that produce faithfulness:4:
      - Giving f(x) = mx + b and asking "what is f(k)?" with no context — this is pure function evaluation with no conceptual layer
      - Giving f(x) = mx + b and asking "what is the y-intercept?" — a student answers this by reading the constant, not by reasoning about a linear function
      - Giving a line through (0, b) with slope m and asking to evaluate — this is functionally identical to the above anti-patterns
      - Asking for the x-intercept of a given equation with no context — while technically a linear function skill, it reduces to solving one equation

   INSTEAD, at D2, use one of these authentic SAT formats:
   - Context + equation given → ask what a coefficient represents in that context
   - Context + equation given → evaluate and interpret the result (e.g., "how much does it cost after 3 hours?")
   - Table of 2-3 values → identify slope or y-intercept
   - Short verbal description of a linear relationship → write which equation matches

5. DIFFICULTY CALIBRATION:
   - Easy (1-2): Single-step problems, direct substitution into given formula, or reading a coefficient directly from an equation
   - Medium (3): Requires finding slope from two points OR applying formula with one non-trivial calculation step; the equation must NOT be fully given if the only task is to substitute and solve
   - Hard (4-5): Must involve at least TWO distinct mathematical steps, such as: finding both slope and y-intercept from data then solving for an unknown input; comparing two linear functions; or multi-step contextual reasoning where the student must set up the equation before solving
   - Be honest about scaffolding - if the full equation is provided and the only step is substitution, difficulty is 1-2 regardless of how complex the context sounds
   - Rate based on actual cognitive demand, not topic complexity

   HARD QUESTION PATTERNS (use these as guides for difficulty 4-5):
   - Find the linear equation from two data points, then find the x-value where f(x) equals a new target
   - Given a table, determine both the function rule and the initial value, then use them to answer a contextual question
   - Determine where two linear functions intersect or when their difference equals a given value (but the functions must be derived, not handed directly)
   - Given a graph description with intercepts or labeled points, write the equation and answer a follow-up question

{DIFFICULTY_DESCRIPTION}

BEFORE FINALIZING:
- Calculate the correct answer completely
- Re-read the question stem word-for-word and confirm the answer matches exactly what is asked
- Calculate each distractor using its error pathway
- Verify all five values are distinct and no two distractors are nearly identical in value
- Confirm the problem has exactly one solution
- Re-read each distractor rationale: is it ONE clear sentence with an exact calculation? If not, simplify it
- Confirm the question centers on a linear function concept, not a generic arithmetic problem
- DIFFICULTY HONESTY CHECK: Count the distinct mathematical steps a student must execute. If fewer than two non-trivial steps are required, lower the difficulty rating. If the difficulty is stated as 4 or 5, confirm the question cannot be solved by a single substitution or a single linear equation solve from a given formula.
- D2 FAITHFULNESS CHECK: If the difficulty is 1 or 2, ask yourself: "Does this question require the student to understand what a linear function IS, or just to execute arithmetic on symbols?" If the answer is "just arithmetic on symbols," redesign it with a context, a table, or a meaning-based question so it resembles an authentic SAT question.
```
