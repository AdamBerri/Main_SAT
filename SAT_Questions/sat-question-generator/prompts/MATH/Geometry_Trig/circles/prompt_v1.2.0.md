Generate an SAT Math question about circles.

TOPIC VARIETY — Choose ONE topic from this list and do NOT repeat across questions:
- Circle equations in standard form (x-h)^2 + (y-k)^2 = r^2
- Converting general form to standard form (completing the square)
- Arc length given central angle and radius
- Sector area given central angle and radius
- Inscribed angle theorem
- Central angles and their relationship to arcs
- Tangent lines to circles (perpendicular to radius at point of tangency)
- Chord properties (perpendicular bisector, intersecting chords)
- Circle properties (circumference, area, diameter-radius relationship)
- Circles inscribed in or circumscribing polygons

{DIFFICULTY_DESCRIPTION}

STRICT JSON SCHEMA — Your output MUST exactly match this structure. Do NOT use alternative field names:
- Use "stem" (NOT "question", "questionText", or nested objects)
- Use "choices" as an array of {"label", "text", "isCorrect"} (NOT "options", NOT "value" instead of "text")
- Include ALL required top-level fields: id, topic, difficulty, stem, choices, correctAnswer, explanation, distractorRationale, hasImage, requiresCalculator, answerType, metadata

CRITICAL REQUIREMENTS:

1. REAL-WORLD OR SAT-STYLE CONTEXT: Every question MUST be framed as a word problem or geometric scenario, not a bare formula. Examples:
   - "A circular garden has a diameter of 14 feet. What is the area..."
   - "In the xy-plane, a circle has center (3, -2) and passes through (7, 1). What is..."
   Do NOT write bare computation questions.

2. ANSWER UNIQUENESS AND ARITHMETIC ACCURACY:
   - Solve the problem COMPLETELY before writing choices
   - Verify EVERY arithmetic step, especially addition: double-check sums like a+b by counting
   - Ensure NO two choices are equivalent (e.g., "7" and "√49" are the SAME value — never offer both)
   - Ensure no choice is approximately equal to the correct answer in different form (e.g., "20π" and "62.8")
   - For completing-the-square: verify (b/2)² explicitly, then check the final r² by expanding back

3. GEOMETRIC CONSISTENCY:
   - Before writing the problem, verify the geometry is physically possible
   - If a point is "on a circle," verify it satisfies the circle equation
   - If P lies on the circle, P CANNOT be an external point for tangent construction
   - Check that all given lengths/angles can coexist (e.g., triangle inequality, angle sum = 180°)

4. DISTRACTOR VALIDATION: Each wrong answer must be:
   - Actually incorrect when checked mathematically
   - Based on a specific, named student error with exact calculation shown
   - Numerically distinct from ALL other choices (including equivalent forms)

5. DIFFICULTY CALIBRATION:
   - Difficulty 1: Single formula, minimal calc (circumference from radius)
   - Difficulty 2: Two steps or one formula with conversion
   - Difficulty 3: Multiple steps or one conceptual insight
   - Difficulty 4: Multiple concepts combined (e.g., completing square + distance)
   - Difficulty 5: Non-obvious approach, synthesis of 3+ concepts, complex algebra
   - Be conservative: a problem using one standard theorem is NOT difficulty 5

6. EXPLANATION CLARITY:
   - Show ONE clear solution path, no self-debugging language
   - Do NOT include "Let me verify", "Wait", "Actually", "re-examining", etc.
   - If your solution reveals the problem is flawed, REDESIGN the problem instead of noting the flaw

7. FORMAT REQUIREMENTS:
   - id MUST be a valid UUID v4
   - All numeric answer choices must be distinct values (not equivalent forms)
   - promptVersion: "1.2.0", modelUsed: "claude-sonnet-4-5-20250929"
   - answerType must be "multiple_choice" (with underscore, not hyphen)

PRE-SUBMISSION CHECKLIST:
- JSON uses "stem" and "choices" with "text" fields (not alternatives)
- Only one choice is correct; no two choices are numerically equivalent
- All arithmetic verified (especially sums and squares)
- Geometric setup is physically possible
- Difficulty matches actual complexity
- No self-debugging language anywhere
