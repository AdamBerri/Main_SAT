```
Generate an SAT Reading question that tests the student's ability to use quantitative data from a chart, graph, or table to support or weaken a claim.

This is the QUANTITATIVE version of Command of Evidence - students must interpret visual data, not textual quotes.

## TWO-STAGE GENERATION

### Stage 1: Generate the Data
First, create a realistic dataset for one of these chart types:
- **Bar Chart**: 3-6 categories with comparative values
- **Line Graph**: 4-6 time points showing trends (can have 1-2 series)
- **Data Table**: 3-5 rows with 2-4 columns of related data

The data should:
- Come from a realistic domain: science, economics, social science, health, or environment
- Support interesting comparisons, trends, or relationships
- Have enough variation for meaningful analysis
- Include plausible values with appropriate units
- **Use values with clear separation** — avoid data points that differ by less than 10% of the range, so the correct answer is never ambiguous due to near-identical values

### Stage 2: Generate the Question
Create a short passage (2-3 sentences) that:
- Introduces a researcher, study, or finding related to the data
- Makes a claim that is one of these types:
  - **Causal**: "X causes/leads to Y"
  - **Correlational**: "X is associated with Y"
  - **Comparative**: "X differs from/exceeds Y"
  - **Trend-based**: "X has increased/decreased over time"

**Claim precision rules:**
- If the claim uses a threshold (e.g., "more than double," "at least 15%"), ensure the correct answer's data **clearly and unambiguously** meets that threshold — not borderline. The margin above the threshold should be at least 10% of the threshold value.
- If the claim references a trend (e.g., "steadily increased"), ensure the data shows a consistent pattern with NO exceptions or reversals. If there IS an exception, the claim must acknowledge it or the question must ask about weakening the claim.
- Avoid vague comparative language ("significantly more") unless the data shows at least a 2x difference or the passage defines "significant."

The question stem should ask students to:
- Support the claim with data: "Which choice most effectively uses data from the figure to support..."
- OR weaken the claim: "Which choice most effectively uses data from the figure to weaken..."
- OR complete a statement: "Which choice most effectively uses data to complete the text?"

## ANSWER REQUIREMENTS

**Correct Answer (A):** Must accurately cite specific data from the chart that directly addresses the claim. Use exact values/percentages. The connection between the cited data and the claim must be immediately clear — no multi-step inference chains.

**Distractors (B, C, D):** Each must use a **different** strategy. Choose exactly 3 strategies from this list, one per distractor:
1. **Misread value**: Uses a value from an adjacent category/row (number exists but answers wrong question)
2. **Wrong comparison**: Reverses which category is higher/lower
3. **Opposite trend**: Claims opposite direction (e.g., "decreased" when data shows increase)
4. **Percentage confusion**: Confuses absolute numbers with percentages
5. **Irrelevant data**: References accurate data from wrong year/category that doesn't answer the question
6. **Extrapolation error**: Claims values beyond what the data actually shows
7. **Incomplete evidence**: Cites only part of the needed data, making the argument insufficient (e.g., one data point when the claim requires comparing two)

All distractors should:
- Use real numbers that appear somewhere in the data
- Sound academically plausible
- Be similar in length and structure to the correct answer

## DISTRACTOR QUALITY STANDARDS (ENHANCED)

High-quality distractors are the hallmark of a well-crafted SAT question. Each distractor must:

1. **Be internally consistent** — numbers and comparisons within a single choice must not contradict each other. If a distractor says "X (47) was more than Y (54)," that is self-contradictory. Distractors should be wrong because they answer the wrong question or cite irrelevant data — NOT because they contain mathematical errors.

2. **Target a genuine student misconception** — each distractor should represent a mistake a real student might make:
   - Reading the wrong row/column
   - Confusing which variable is higher
   - Using data that doesn't address the specific claim
   - Drawing a conclusion from incomplete evidence

3. **Be psychometrically subtle** — a student who hasn't carefully read the data should find each distractor plausible. Avoid distractors that are obviously wrong at a glance.

4. **Vary the type of reasoning error** — ensure each distractor tests a genuinely different cognitive mistake. Avoid creating multiple distractors that all rely on "incomplete evidence" or all cite "irrelevant data." The three distractors should force the student to differentiate between distinct types of analytical errors. Specifically:
   - At most ONE distractor may use the "incomplete evidence" strategy
   - At most ONE distractor may use the "irrelevant data" strategy
   - At least ONE distractor should involve misreading specific data values (misread value, wrong comparison, or opposite trend)

5. **Create tempting partial-credit answers** — the best distractors are ones where a student thinks "this seems right" until they realize it doesn't fully answer the question. Design at least one distractor that a student could defend for 10 seconds before seeing why it fails.

## EASY-QUESTION DISTRACTOR REFINEMENT

For easy questions (difficulty 1-2), distractors are often the weakest dimension because the straightforward nature of the question makes wrong answers feel too obviously wrong. To combat this:

1. **Every distractor must reference the key subject of the claim.** If the claim is about "Country A," every distractor should at least mention Country A's data — but pair it with wrong data, wrong comparisons, or incomplete context. Do NOT write distractors that discuss only unrelated categories.

2. **Use "close-miss" distractors at easy levels.** Instead of citing a completely different category, cite the correct category but with an adjacent/wrong value, or cite the correct value but draw the wrong conclusion from it.

3. **Make distractors structurally parallel to the correct answer.** At easy levels, students often eliminate by surface pattern — if three distractors look obviously different in structure from the correct answer, the question becomes trivially easy. All four choices should have similar sentence length, data-citation patterns, and rhetorical structure.

4. **Avoid "dead giveaway" distractors.** At easy levels especially, no distractor should be eliminable by a student who hasn't even looked at the data. If a distractor discusses an entirely different topic from the claim, it can be eliminated by reading the passage alone — replace it with one that requires checking the chart.

## SAT FORMAT CONVENTIONS

To ensure faithfulness to actual SAT quantitative evidence questions:
- The passage should read like a brief excerpt from a research summary or news article — avoid overly casual or textbook-style language
- Each answer choice should be a complete sentence fragment that could logically follow the passage/stem
- Data citations in answer choices should use the format natural to academic writing (e.g., "from 58% to 72%" not "58%→72%")
- "Weaken" questions should appear less frequently than "support" questions (roughly 1 in 4)
- The claim type and data type should match naturally (e.g., trend claims pair with time-series data, comparative claims pair with categorical data)

## OUTPUT REQUIREMENTS

You MUST output valid JSON with these fields:

```json
{
  "passage": "The 2-3 sentence context with the researcher's claim",
  "stem": "Which choice most effectively uses data from the figure to...",
  "choices": [
    {"label": "A", "text": "Correct answer with accurate data citation", "isCorrect": true},
    {"label": "B", "text": "Distractor using strategy X", "isCorrect": false},
    {"label": "C", "text": "Distractor using strategy Y", "isCorrect": false},
    {"label": "D", "text": "Distractor using strategy Z", "isCorrect": false}
  ],
  "correctAnswer": "A",
  "explanation": "Why A is correct and how each distractor fails",
  "distractorRationale": {
    "A": "Correct: accurately cites [specific data] to support the claim",
    "B": "Wrong: uses [misread strategy] - actually refers to...",
    "C": "Wrong: uses [strategy] - the data shows...",
    "D": "Wrong: uses [strategy] - this value is from..."
  },
  "hasImage": true,
  "imageDescription": "DETAILED chart specification including: chart type, title, axis labels, ALL exact data values, and source attribution",
  "chartData": {
    "type": "bar_chart|line_graph|data_table",
    "title": "Chart title",
    "data": { ... structured data for rendering ... }
  },
  "passageMetadata": {
    "genre": "informational",
    "wordCount": <number>,
    "source": "Adapted from [fictional but realistic source]"
  },
  "difficulty": {
    "overall": <1-5>,
    "conceptual": <1.0-5.0>,
    "procedural": <1.0-5.0>,
    "linguistic": <1.0-5.0>
  }
}
```

## DIFFICULTY CALIBRATION

{DIFFICULTY_DESCRIPTION}

- **Easy (1-2/5)**: Correct answer directly matches the claim's key term; data point is the most prominent (max/min); distractors use obviously wrong categories
- **Medium (3/5)**: Requires reading the correct row/column carefully; distractors use adjacent values; some calculation may be needed
- **Hard (4-5/5)**: Requires comparing multiple data points or calculating change; multiple plausible-looking options; subtle distinctions between correct and incorrect interpretations

## CRITICAL VALIDATION

Before finalizing:
1. Verify ALL numbers in answer choices actually appear in your chartData
2. Ensure the correct answer DIRECTLY supports/weakens the specific claim made
3. Check that each distractor uses a DISTINCT error strategy
4. Confirm the imageDescription contains COMPLETE data for chart rendering
5. **Threshold check**: If the claim or question involves a numerical threshold, verify the correct answer exceeds it by a comfortable margin and NO distractor's data is within 5% of the threshold
6. **Trend consistency check**: If the claim asserts a consistent trend, verify EVERY data point in the series follows that trend — if any point deviates, either fix the data or reframe the claim/question
7. **Unambiguous correctness**: Re-read all four answer choices and confirm that exactly ONE is defensibly correct — if a reasonable student could argue for two choices, revise until only one works
8. **Data-answer cross-check**: For EVERY answer choice, verify that any numerical range, comparison, or calculated value stated in the choice text is mathematically consistent with the chartData
9. **Distractor self-consistency**: Read each distractor in isolation. Does it make a mathematically true statement within its own sentence? If it says "A (value1) is greater than B (value2)" but value1 < value2, the distractor is broken. Fix it so the distractor is a true but irrelevant/misapplied statement.
10. **Distractor plausibility**: For each distractor, ask: "Could a student who misread one row or confused two columns arrive at this answer?" If the distractor requires an implausible mistake, replace it with one targeting a more natural error.
11. **Distractor diversity check**: Verify that no two distractors use the same error strategy. If they do, revise one to use a different strategy from the list. Ensure at least one distractor involves a data-reading error (misread value, wrong comparison, or opposite trend) rather than only logical/structural errors (irrelevant data, incomplete evidence).
12. **Distractor temptation check**: For each distractor, confirm it would take a careful student at least 5-10 seconds of analysis to definitively rule it out. If a distractor can be eliminated at a glance (e.g., it discusses completely unrelated data), replace it with a more subtly wrong option.
13. **Easy-level distractor audit**: For questions at difficulty 1-2, re-read each distractor and confirm it mentions the claim's key subject (the entity the claim is about). If any distractor can be eliminated without consulting the data, replace it.
```
