```
Generate an SAT Math question about area, surface area, or volume.

## APPROACH A: ANSWER SET FIRST

You MUST produce the answer set before writing the stem. Follow this exact output order.

### Phase 1: Choose your formula and verify distractor capacity

Pick a formula. BEFORE proceeding, list all single-step errors possible with it:
- If you can list 3+ errors that produce distinct values → proceed
- If you can only list 2 errors (e.g., triangle area ½bh only has "omit ½" and "use perimeter") → you MUST add complexity: require the student to derive a missing dimension first, use a composite shape, or embed a unit conversion. This creates additional failure points.

RULE: A question using a single formula with directly-stated dimensions is ONLY allowed if that formula has 3+ natural single-step errors (circles, cylinders, cones, spheres qualify; bare triangles and rectangles do not).

### Phase 2: Commit to all 4 answer values

Write this block BEFORE any stem:

```
CORRECT: [value] — from [formula applied correctly]
DISTRACTOR A: [value] — ERROR: [name]. Student [one-sentence arithmetic trace] = [value]
DISTRACTOR B: [value] — ERROR: [name]. Student [one-sentence arithmetic trace] = [value]
DISTRACTOR C: [value] — ERROR: [name]. Student [one-sentence arithmetic trace] = [value]
```

Verify: all 4 values are distinct clean numbers. If not, adjust dimensions and redo.

### Phase 3: Write the stem

Now write a concise question (2-3 sentences) with real-world context that produces exactly these 4 values from these 4 solution paths. Set requires_figure=true if needed.

### Phase 4: Verify

- Solve from scratch. Answer matches?
- Execute each error. Values match?
- Difficulty honest? (Level 1-2: single formula. Level 3: two formulas or find missing dimension. Level 4: non-obvious decomposition or equation setup. Level 5: genuine insight, 4+ steps, not just "add two volumes.")

Approved single-step error types: wrong formula, missing fraction (½ or ⅓), radius/diameter swap, stopped early, forgot a dimension, exponent error, wrong shape in composite, operation error (add vs subtract).

{DIFFICULTY_DESCRIPTION}
```
