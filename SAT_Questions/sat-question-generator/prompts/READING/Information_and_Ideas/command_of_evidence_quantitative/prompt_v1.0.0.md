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

### Stage 2: Generate the Question
Create a short passage (2-3 sentences) that:
- Introduces a researcher, study, or finding related to the data
- Makes a claim that is one of these types:
  - **Causal**: "X causes/leads to Y"
  - **Correlational**: "X is associated with Y"
  - **Comparative**: "X differs from/exceeds Y"
  - **Trend-based**: "X has increased/decreased over time"

The question stem should ask students to:
- Support the claim with data: "Which choice most effectively uses data from the figure to support..."
- OR weaken the claim: "Which choice most effectively uses data from the figure to weaken..."
- OR complete a statement: "Which choice most effectively uses data to complete the text?"

## ANSWER REQUIREMENTS

**Correct Answer (A):** Must accurately cite specific data from the chart that directly addresses the claim. Use exact values/percentages.

**Distractors (B, C, D):** Each should use a different strategy from this list:
1. **Misread value**: Uses a value from an adjacent category/row (number exists but answers wrong question)
2. **Wrong comparison**: Reverses which category is higher/lower
3. **Opposite trend**: Claims opposite direction (e.g., "decreased" when data shows increase)
4. **Percentage confusion**: Confuses absolute numbers with percentages
5. **Irrelevant data**: References accurate data from wrong year/category that doesn't answer the question
6. **Extrapolation error**: Claims values beyond what the data actually shows

All distractors should:
- Use real numbers that appear somewhere in the data
- Sound academically plausible
- Be similar in length and structure to the correct answer

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

- **Easy (2/5)**: Correct answer directly matches the claim's key term; data point is the most prominent (max/min); distractors use obviously wrong categories
- **Medium (3/5)**: Requires reading the correct row/column carefully; distractors use adjacent values; some calculation may be needed
- **Hard (4-5/5)**: Requires comparing multiple data points or calculating change; multiple plausible-looking options; subtle distinctions between correct and incorrect interpretations

## CRITICAL VALIDATION

Before finalizing:
1. Verify ALL numbers in answer choices actually appear in your chartData
2. Ensure the correct answer DIRECTLY supports/weakens the specific claim made
3. Check that each distractor uses a DISTINCT error strategy
4. Confirm the imageDescription contains COMPLETE data for chart rendering
```
