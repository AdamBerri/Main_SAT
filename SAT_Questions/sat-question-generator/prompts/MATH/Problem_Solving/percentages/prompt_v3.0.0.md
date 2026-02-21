```
Generate an SAT Math question about percentages.

## APPROACH A: ANSWER SET FIRST

You MUST produce the answer set before writing the stem. Follow this exact output order.

### Phase 1: Commit to all 4 answer values and their error paths

Write this block FIRST, before any question stem:

```
SKILL: [e.g., "percent increase — find original given new value"]
CORRECT: [value] — [one line showing the correct calculation]
DISTRACTOR A: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR B: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR C: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
```

Error menu (pick 3 distinct ones):
- **Part vs whole**: reports change amount instead of final value, or vice versa
- **Wrong base**: applies percentage to new value instead of original
- **Additive compounding**: treats successive changes as additive (up 20% then down 20% = 0%)
- **Complement**: finds what's left instead of what was asked
- **Reversed operation**: multiplies when should divide, or vice versa
- **Forgot to finish**: computes percent amount but doesn't add/subtract from original

CRITICAL: If you cannot produce a distractor value from one clean arithmetic step, that error doesn't work with your numbers. Choose different numbers or a different error — do NOT patch it with "then misreads as" or "somehow gets."

### Phase 2: Choose numbers that make the answer set work

Adjust the base value and percentage until all 4 answers are clean (integers or simple decimals like $XX.XX). Prefer SAT-friendly numbers: percentages of 10%, 15%, 20%, 25%, 30%. Base values that divide cleanly.

### Phase 3: Write the stem

2-3 sentences with real-world context. Preferred: shopping, salaries, taxes, enrollment, surveys, business. Avoid: chemistry, lab solutions, abstract mixtures.

### Phase 4: Verify

- Solve from scratch. Answer matches?
- Execute each error path. Each produces its stated value in one step?
- Difficulty honest? (1-2: direct calculation. 3: algebraic setup or multi-step. 4-5: genuine conceptual insight, not just more arithmetic.)

{DIFFICULTY_DESCRIPTION}
```
