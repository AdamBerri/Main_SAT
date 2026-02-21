```
Generate an SAT Math question about linear inequalities.

## APPROACH A: ANSWER SET FIRST

You MUST produce the answer set before writing the stem. Follow this exact output order.

### Phase 1: Commit to all 4 answer values and their error paths

Write this block FIRST:

```
SKILL: [e.g., "solve single inequality with sign flip opportunity"]
CORRECT: [value/expression] — [one line showing correct solution]
DISTRACTOR A: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR B: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR C: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
```

Error menu (pick 3 distinct ones):
- **Sign flip forgotten**: didn't reverse inequality when dividing by negative
- **Boundary confusion**: strict vs non-strict, off-by-one on boundary value
- **Solved for wrong quantity**: reports x instead of the expression asked for
- **Arithmetic slip**: wrong distribution, wrong sign when moving terms, wrong division
- **Wrong relationship**: set up = instead of ≤, or confused AND/OR logic
- **Reversed setup**: modeled the constraint backward
- **Complement**: found what's excluded instead of what's included

CRITICAL: Every distractor value must be reachable from ONE specific error in ONE line of arithmetic. If it takes two separate mistakes to reach the value, that distractor is invalid.

### Phase 2: Choose coefficients that make it work

Adjust coefficients and constants until all 4 answers are distinct clean integers. If an error produces a non-integer, change the problem parameters.

### Phase 3: Write the stem

2-4 sentences. Difficulty 1-3: real-world context required (budget, capacity, measurements). Difficulty 4-5: may be more abstract but must still feel like SAT, not math olympiad. Never ask "which value does NOT satisfy" — these questions lack meaningful computation and produce hollow distractors.

### Phase 4: Verify

- Solve from scratch. Answer matches?
- Execute each error. Values match?
- If dividing by negative, did you flip the inequality?
- Difficulty honest? (1-2: single inequality, 2-3 steps. 3: two inequalities or 4-5 steps. 4: system requiring synthesis. 5: multi-constraint decomposition, >90 seconds.)

{DIFFICULTY_DESCRIPTION}
```
