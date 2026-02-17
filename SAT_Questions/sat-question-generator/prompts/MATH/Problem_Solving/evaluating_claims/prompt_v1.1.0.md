```
Generate an SAT Math question about evaluating statistical claims.

The question should present:
- A study or survey scenario with clear sample information
- Claims or conclusions drawn from the data
- Need to evaluate validity of ONE specific conclusion

CRITICAL REQUIREMENTS:

Statistical Rigor:
- Clearly distinguish between sample descriptions and population inferences
- If testing inference validity, include relevant sampling methodology details (random selection, sample size, population defined)
- The correct answer must be defensible using only concepts covered in high school math: random sampling, sample size considerations, bias sources, causation vs correlation
- Avoid requiring knowledge of p-values, confidence intervals, hypothesis testing, or statistical significance

Difficulty Calibration:
- Easy (1-2/5): Identify obvious sampling bias or recognize need for random sampling
- Medium (3/5): Evaluate whether sample supports a modest generalization given basic methodology
- Hard (4-5/5): Analyze multiple validity conditions or subtle confounding factors
- Computational difficulty should match conceptual difficulty (no advanced calculations for conceptual questions)

Distractors:
- Each distractor must represent a plausible but incorrect statistical reasoning pattern
- Avoid arbitrary numerical thresholds without justification
- Don't include technically correct statements as distractors
- Target common misconceptions: confusing sample size with randomness, assuming causation from correlation, ignoring selection bias

Clarity and Scope:
- Keep stimulus under 100 words when possible
- Use straightforward language (avoid technical jargon like "statistically significant")
- Test ONE clear construct: sampling validity, generalization appropriateness, OR experimental design principles
- Make the evaluation criterion explicit (e.g., "can conclude about all students" vs "describes this sample")

{DIFFICULTY_DESCRIPTION}
```