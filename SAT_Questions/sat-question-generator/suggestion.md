# Prompt Architecture Recommendation: Answer Set First

## Background

After 8+ PREAM iterations on 32 topics, three topics plateaued below target quality:
- **Area/Volume**: 4.847 test avg
- **Percentages**: 4.900 test avg
- **Linear Inequalities**: 4.716 test avg

Standard PREAM (incremental prompt patching) couldn't push them higher. We ran an A/B/C test of three fundamentally different prompt architectures to break through.

## What We Tested

### A: Answer Set First (v3.0.0)
Forces the model to commit to all 4 answer values with named error traces BEFORE writing the question stem. Four-phase workflow:
1. Declare correct answer + 3 distractors with explicit error names
2. Tune coefficients until all 4 values are distinct clean integers
3. Write the stem
4. Verify by solving from scratch

### B: Hybrid (v3.1.0)
Combines domain knowledge accumulated from PREAM iterations with backward design. Picks a skill + 3 errors, chooses numbers to produce clean answers, writes stem, writes distractor rationales. Includes topic-specific domain rules.

### C: Topic-Specific Creative Fix (v3.2.0)
Different approach per topic:
- Area/Volume: "Formula Vetting Gate" — verify formula supports 3+ distinct single-step errors before proceeding
- Percentages: "Anti-Pattern Immunization" — teach from 3 real failures with explanations of why they fail
- Linear Inequalities: "Constraint Narrative Persona" — roleplay as psychometrician designing for 4 student performance clusters

## Results

### Area/Volume (baseline: 4.847)

| Approach | Test Avg | Train Avg | Pass Rate | vs Baseline |
|----------|----------|-----------|-----------|-------------|
| **A: Answer Set First** | **5.167** | 5.308 | **100%** | **+6.6%** |
| B: Hybrid | 5.014 | 4.791 | 100% | +3.4% |
| C: Formula Vetting Gate | 5.167 | 5.308 | 100% | +6.6% |

### Percentages (baseline: 4.900)

| Approach | Test Avg | Train Avg | Pass Rate | vs Baseline |
|----------|----------|-----------|-----------|-------------|
| **A: Answer Set First** | **5.367** | 5.237 | **100%** | **+9.5%** |
| B: Hybrid | 4.683 | 4.758 | 100% | -4.4% |
| C: Anti-Pattern Immunization | 5.183 | 5.142 | 100% | +5.8% |

### Linear Inequalities (baseline: 4.716)

| Approach | Test Avg | Train Avg | Pass Rate | vs Baseline |
|----------|----------|-----------|-----------|-------------|
| **A: Answer Set First** | **5.317** | 5.450 | **100%** | **+12.7%** |
| B: Hybrid | 4.533 | 5.204 | 80% | -3.9% |
| C: Constraint Narrative | 3.600 | 4.796 | 20% | -23.7% |

## Why Answer Set First Works

The methodology eliminates failure modes by construction rather than instruction:

1. **Answer validity errors disappear.** The model verifies all 4 values are mathematically consistent before the stem exists. No more "correct answer is actually wrong" or "infeasible constraint set" failures.

2. **Distractor quality improves structurally.** Each distractor must map to exactly one named error from a predefined menu (sign flip, wrong formula, forgot factor, wrong base, etc.). No room for "somehow got X" or patched rationales.

3. **Coefficient tuning is explicit.** Phase 2 forces the model to adjust numbers until all errors produce distinct clean integers. This prevents duplicate answer choices and non-integer distractors.

4. **The workflow is topic-agnostic.** Unlike the Hybrid (topic-specific domain rules) or creative fixes (per-topic personas), Answer Set First works identically for any math topic. The only topic-specific element is the error menu.

## Why the Others Fell Short

**Hybrid (v3.1.0):** Strong training scores (the domain knowledge helps) but poor test generalization. The accumulated rules from PREAM iterations create an overfitted prompt — good for the specific failure patterns seen before, but brittle on novel difficulty-5 questions.

**Topic-specific creative fixes (v3.2.0):** Mixed results. Anti-Pattern Immunization worked reasonably well for percentages (+5.8%) by teaching from real failures. Formula Vetting Gate tied Answer Set First for area/volume. But Constraint Narrative Persona collapsed catastrophically for linear inequalities (-23.7%) — the persona encouraged over-engineering at high difficulty levels, and the model's arithmetic broke down.

## Recommendation

**Roll out Answer Set First as the default prompt structure for all 20 math topics.**

The template is already proven across 3 diverse topics (geometry, algebra, problem-solving). It requires minimal customization per topic — just swap the error menu to match the topic's common mistakes:

```
## ANSWER SET FIRST

### Phase 1: Commit to all 4 answer values and their error paths
SKILL: [topic-specific skill]
CORRECT: [value] — [one line showing correct solution]
DISTRACTOR A: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR B: [value] — ERROR: [name]. Student [one-sentence trace] = [value]
DISTRACTOR C: [value] — ERROR: [name]. Student [one-sentence trace] = [value]

Error menu (pick 3 distinct ones):
- [topic-specific error 1]
- [topic-specific error 2]
- [topic-specific error 3]
- ...

### Phase 2: Choose coefficients that make it work
Adjust until all 4 answers are distinct clean integers/expressions.

### Phase 3: Write the stem
2-4 sentences. [topic-specific style guidance]

### Phase 4: Verify
Solve from scratch. Execute each error. Confirm values match.

{DIFFICULTY_DESCRIPTION}
```

### Expected impact
- **Conservative estimate:** +5-7% test avg across topics currently on v1.x prompts
- **Optimistic estimate:** +10-12% for topics with known answer validity issues
- **Risk:** Low — the approach is proven on 3 topics with 0 regressions

### Implementation effort
- Write error menus for the remaining 17 math topics (~30 min each)
- Optionally adapt for 12 reading topics (would need a different phase structure since reading questions don't have arithmetic error traces)
- Run one PREAM iteration per topic to validate

## Files

| File | Location |
|------|----------|
| Answer Set First (area_volume) | `prompts/MATH/Geometry_Trig/area_volume/prompt_v3.0.0.md` |
| Answer Set First (percentages) | `prompts/MATH/Problem_Solving/percentages/prompt_v3.0.0.md` |
| Answer Set First (linear_inequalities) | `prompts/MATH/Algebra/linear_inequalities/prompt_v3.0.0.md` |
| Updated configs | All 3 `config.json` files now point to v3.0.0 |
