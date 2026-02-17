"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATH_BASE_PROMPTS = exports.READING_BASE_PROMPTS = exports.MATH_SYSTEM_PROMPT = exports.READING_SYSTEM_PROMPT = void 0;
exports.describeDifficulty = describeDifficulty;
exports.buildPrompt = buildPrompt;
/**
 * Base prompt templates for SAT question generation.
 * These serve as initial prompts that will be refined via PREAM optimization.
 */
// ============================================
// System Prompts
// ============================================
exports.READING_SYSTEM_PROMPT = `You are an expert SAT question writer with extensive experience creating official College Board SAT Reading & Writing section questions. Your questions are indistinguishable from authentic SAT questions.

Key principles:
1. Follow SAT format precisely - single passage followed by a single question
2. Use appropriate vocabulary and sentence complexity for SAT
3. Create unambiguously correct answers with well-crafted distractors
4. Calibrate difficulty accurately to the specified level
5. Ensure passages are engaging and academically appropriate

You always output valid JSON matching the provided schema.`;
exports.MATH_SYSTEM_PROMPT = `You are an expert SAT question writer with extensive experience creating official College Board SAT Math section questions. Your questions are indistinguishable from authentic SAT questions.

Key principles:
1. Follow SAT format precisely with clear mathematical notation
2. Use realistic contexts that are appropriate for SAT
3. Create problems that test genuine mathematical understanding
4. Design distractors that target specific misconceptions
5. Calibrate difficulty accurately to the specified level

You always output valid JSON matching the provided schema.`;
// ============================================
// Difficulty Descriptions
// ============================================
function describeDifficulty(params) {
    const overallDescriptions = {
        1: 'Easy - Most students will answer correctly. Straightforward application of basic concepts.',
        2: 'Below Average - Slightly more challenging but still accessible to prepared students.',
        3: 'Medium - About half of students will answer correctly. Requires solid understanding.',
        4: 'Above Average - Challenging for most students. Requires strong conceptual grasp.',
        5: 'Hard - Only top students will answer correctly. Complex reasoning or multiple steps required.',
    };
    return `
DIFFICULTY CALIBRATION:
- Overall: Level ${params.overall}/5 - ${overallDescriptions[params.overall]}
- Conceptual complexity: ${params.conceptual.toFixed(1)}/5
- Procedural complexity: ${params.procedural.toFixed(1)}/5
${params.linguistic ? `- Linguistic complexity: ${params.linguistic.toFixed(1)}/5` : ''}
${params.computational ? `- Computational complexity: ${params.computational.toFixed(1)}/5` : ''}

The question difficulty should precisely match these specifications.`;
}
// ============================================
// Reading Question Prompts
// ============================================
exports.READING_BASE_PROMPTS = {
    // Information and Ideas
    central_ideas: `Generate an SAT Reading question that tests the student's ability to identify the central idea or main argument of a passage.

The passage should:
- Be 80-120 words for shorter passages, 150-200 for longer ones
- Have a clear central idea that's supported throughout
- Come from academic or literary contexts

The question should:
- Ask students to identify what the passage is "mainly about" or the author's "central claim"
- Have one answer that captures the main idea accurately
- Include distractors that are either too narrow, too broad, or focus on details

{DIFFICULTY_DESCRIPTION}`,
    inferences: `Generate an SAT Reading question that tests the student's ability to make logical inferences based on passage information.

The passage should:
- Contain implicit information that can be logically inferred
- Not state the correct answer explicitly
- Support one clear inference while ruling out others

The question should:
- Ask what can be "reasonably inferred" or "most likely concluded"
- Test logical reasoning, not just reading comprehension
- Have distractors that are either unsupported or contradict the passage

{DIFFICULTY_DESCRIPTION}`,
    command_of_evidence: `Generate an SAT Reading question that tests the student's ability to identify textual evidence supporting a claim.

The passage should:
- Make a claim or support a particular interpretation
- Contain specific evidence (quotes, data, examples) that supports the main point

The question should:
- Ask which quote/evidence "best supports" a given claim
- Require students to evaluate which evidence is most relevant
- Have distractors that are from the passage but don't support the specific claim

{DIFFICULTY_DESCRIPTION}`,
    command_of_evidence_quantitative: `Generate an SAT Reading question that tests the student's ability to use quantitative data from a chart, graph, or table to support or weaken a claim.

This is the QUANTITATIVE version of Command of Evidence - students must interpret visual data, not textual quotes.

First, generate realistic data for a bar chart, line graph, or data table. Then create a passage (2-3 sentences) that makes a claim about the data.

The question should ask students to:
- Support the claim with data from the figure
- OR weaken the claim with data
- OR complete a statement using the data

Correct answer must accurately cite specific values from the chart.

Distractors should use these strategies:
- Misread value (adjacent category)
- Wrong comparison (reversed relationship)
- Opposite trend (flipped direction)
- Irrelevant data (wrong year/category)

Output must include hasImage: true and detailed imageDescription with ALL data values for chart rendering.

{DIFFICULTY_DESCRIPTION}`,
    textual_evidence: `Generate an SAT Reading question with paired texts or a text with notes/data.

The passage should include:
- Primary text with supplementary information (chart, graph, or additional text)
- A clear relationship between the elements

The question should:
- Ask how information from different sources relates
- Test integration of textual and quantitative evidence
- Have distractors that misinterpret the relationship

{DIFFICULTY_DESCRIPTION}`,
    // Craft and Structure
    words_in_context: `Generate an SAT Reading question that tests vocabulary in context.

The passage should:
- Use a word with multiple possible meanings
- Provide enough context to determine the intended meaning
- Use the word in a natural, academic context

The question should:
- Ask what the underlined word "most nearly means" in context
- Have a correct answer that matches the contextual usage
- Include distractors that are other valid meanings of the word but wrong in context

{DIFFICULTY_DESCRIPTION}`,
    text_structure: `Generate an SAT Reading question about how a passage is organized or structured.

The passage should:
- Have a clear organizational pattern (compare/contrast, cause/effect, problem/solution, etc.)
- Include transition words and structural markers
- Be well-organized with identifiable parts

The question should:
- Ask about the overall structure or how parts relate
- Test understanding of rhetorical organization
- Have distractors that misidentify the structure

{DIFFICULTY_DESCRIPTION}`,
    cross_text_connections: `Generate an SAT Reading question with two related passages (paired texts).

The passages should:
- Address the same topic from different angles or perspectives
- Be 75-100 words each
- Have a clear relationship (agreement, disagreement, complementary, etc.)

The question should:
- Ask how the passages relate to each other
- Test understanding of multiple perspectives
- Have distractors that mischaracterize the relationship

{DIFFICULTY_DESCRIPTION}`,
    overall_purpose: `Generate an SAT Reading question about the author's purpose.

The passage should:
- Have a clear rhetorical purpose (inform, persuade, analyze, describe, etc.)
- Show the author's intent through word choice and structure
- Be from an academic, journalistic, or literary context

The question should:
- Ask about the author's "main purpose" or why they wrote the passage
- Test understanding of rhetorical intent
- Have distractors that confuse purpose with topic or misidentify intent

{DIFFICULTY_DESCRIPTION}`,
    // Expression of Ideas
    rhetorical_synthesis: `Generate an SAT Writing question that tests the ability to combine ideas effectively.

Provide:
- Notes or bullet points with related information
- A context for why this synthesis is needed (essay, report, etc.)

The question should:
- Ask which option "most effectively" combines the given information
- Test understanding of emphasis, flow, and logical connection
- Have distractors that are grammatical but less effective

{DIFFICULTY_DESCRIPTION}`,
    transitions: `Generate an SAT Writing question about transitions between ideas.

The passage should:
- Have two sentences or paragraphs that need connection
- Require a specific type of transition (contrast, cause, addition, etc.)
- Make the relationship between ideas clear from context

The question should:
- Ask which transition "most logically" connects the ideas
- Have the correct answer precisely match the logical relationship
- Include distractors that are valid transitions but wrong for this relationship

{DIFFICULTY_DESCRIPTION}`,
    // Standard English Conventions
    boundaries: `Generate an SAT Writing question about sentence boundaries (run-ons, fragments, comma splices).

The passage should:
- Contain a sentence boundary issue (or test correct boundary usage)
- Be in academic writing context
- Have clear subjects and predicates that can be analyzed

The question should:
- Ask which option correctly handles sentence boundaries
- Test understanding of complete sentences vs. fragments
- Have distractors with common boundary errors (comma splice, run-on, incorrect semicolon)

{DIFFICULTY_DESCRIPTION}`,
    form_structure_sense: `Generate an SAT Writing question about grammar, usage, or sentence structure.

This may test:
- Subject-verb agreement
- Pronoun reference and agreement
- Verb tense and mood
- Modifier placement
- Parallel structure
- Possessives

The passage should:
- Contain a clear grammatical issue (or test correct usage)
- Use the construction naturally in context

The question should:
- Ask which option is grammatically correct
- Have the correct answer follow standard English conventions
- Include distractors with common grammatical errors

{DIFFICULTY_DESCRIPTION}`,
};
// ============================================
// Math Question Prompts
// ============================================
exports.MATH_BASE_PROMPTS = {
    // Algebra
    linear_equations: `Generate an SAT Math question involving linear equations in one or two variables.

The question should:
- Present a real-world scenario or abstract problem involving linear equations
- Require solving for a variable or finding a specific value
- Use appropriate difficulty-level complexity

Include:
- Clear problem setup with necessary constraints
- Realistic numbers and contexts
- Unambiguous solution path

{DIFFICULTY_DESCRIPTION}`,
    linear_functions: `Generate an SAT Math question about linear functions and their properties.

The question may test:
- Slope and y-intercept interpretation
- Rate of change in context
- Linear function notation f(x)
- Graphical representation of linear functions

The scenario should be realistic and the function properties should be clear.

{DIFFICULTY_DESCRIPTION}`,
    systems_of_equations: `Generate an SAT Math question involving systems of two linear equations.

The question should:
- Present a scenario naturally requiring two equations
- Have exactly one solution (unless testing special cases at higher difficulty)
- Test either the solution process or interpretation of solutions

{DIFFICULTY_DESCRIPTION}`,
    linear_inequalities: `Generate an SAT Math question about linear inequalities.

The question may involve:
- Solving single-variable inequalities
- Systems of inequalities
- Inequality constraints in real-world contexts
- Graphical representation of inequalities

{DIFFICULTY_DESCRIPTION}`,
    // Advanced Math
    equivalent_expressions: `Generate an SAT Math question about equivalent algebraic expressions.

The question should test ability to:
- Factor or expand expressions
- Simplify complex expressions
- Recognize equivalent forms
- Work with polynomial operations

{DIFFICULTY_DESCRIPTION}`,
    nonlinear_equations: `Generate an SAT Math question involving nonlinear equations.

This may include:
- Quadratic equations (factoring, quadratic formula, completing the square)
- Radical equations
- Rational equations
- Absolute value equations

{DIFFICULTY_DESCRIPTION}`,
    nonlinear_functions: `Generate an SAT Math question about nonlinear functions.

Topics may include:
- Quadratic functions and parabolas
- Exponential functions and growth/decay
- Polynomial function behavior
- Function transformations

{DIFFICULTY_DESCRIPTION}`,
    // Problem Solving and Data Analysis
    ratios_rates: `Generate an SAT Math question involving ratios, rates, or proportional relationships.

The question should:
- Present a realistic scenario using rates or ratios
- Require setting up and solving proportions
- Use unit conversion where appropriate

{DIFFICULTY_DESCRIPTION}`,
    percentages: `Generate an SAT Math question about percentages.

Topics may include:
- Percent increase/decrease
- Finding the whole, part, or percent
- Multi-step percentage problems
- Percent in real-world contexts (tax, discount, interest)

{DIFFICULTY_DESCRIPTION}`,
    units: `Generate an SAT Math question involving unit conversion or dimensional analysis.

The question should:
- Require converting between units
- Use realistic measurement scenarios
- Test understanding of rate units (e.g., miles per hour, dollars per pound)

{DIFFICULTY_DESCRIPTION}`,
    data_distributions: `Generate an SAT Math question about statistical measures and data distributions.

Topics may include:
- Mean, median, mode, range
- Standard deviation interpretation
- Comparing distributions
- Effects of data changes on statistics

{DIFFICULTY_DESCRIPTION}`,
    probability: `Generate an SAT Math question about probability.

Topics may include:
- Basic probability calculations
- Compound events
- Conditional probability
- Expected value

{DIFFICULTY_DESCRIPTION}`,
    inference: `Generate an SAT Math question about statistical inference.

Topics may include:
- Margin of error
- Confidence intervals (conceptual)
- Sample vs population
- Drawing conclusions from samples

{DIFFICULTY_DESCRIPTION}`,
    evaluating_claims: `Generate an SAT Math question about evaluating statistical claims.

The question should present:
- A study or survey scenario
- Claims based on data
- Need to evaluate validity of conclusions

{DIFFICULTY_DESCRIPTION}`,
    two_variable_data: `Generate an SAT Math question involving two-variable data and scatterplots.

Topics may include:
- Line of best fit
- Correlation interpretation
- Scatterplot analysis
- Predicting values from relationships

{DIFFICULTY_DESCRIPTION}`,
    // Geometry and Trigonometry
    area_volume: `Generate an SAT Math question about area, surface area, or volume.

The question should:
- Involve standard geometric shapes
- Potentially combine multiple shapes
- Require application of area/volume formulas

Consider whether an image would help illustrate the problem.

{DIFFICULTY_DESCRIPTION}`,
    lines_angles: `Generate an SAT Math question about lines, angles, and their properties.

Topics may include:
- Parallel lines cut by transversals
- Angle relationships (complementary, supplementary, vertical)
- Angle measures in geometric figures

Consider whether an image is needed.

{DIFFICULTY_DESCRIPTION}`,
    triangles: `Generate an SAT Math question about triangles.

Topics may include:
- Triangle properties and theorems
- Similar triangles
- Pythagorean theorem
- Special triangles (30-60-90, 45-45-90)

Consider whether an image is needed.

{DIFFICULTY_DESCRIPTION}`,
    circles: `Generate an SAT Math question about circles.

Topics may include:
- Circle equations in coordinate plane
- Arc length and sector area
- Central and inscribed angles
- Circle properties

Consider whether an image is needed.

{DIFFICULTY_DESCRIPTION}`,
    right_triangles: `Generate an SAT Math question about right triangle trigonometry.

Topics may include:
- Sine, cosine, tangent ratios
- Solving right triangles
- Trigonometry in real-world contexts
- Pythagorean theorem applications

Consider whether an image is needed.

{DIFFICULTY_DESCRIPTION}`,
};
// ============================================
// Prompt Builder
// ============================================
function buildPrompt(topic, difficulty) {
    const isReading = topic.section === 'READING';
    const system = isReading ? exports.READING_SYSTEM_PROMPT : exports.MATH_SYSTEM_PROMPT;
    const basePrompts = isReading ? exports.READING_BASE_PROMPTS : exports.MATH_BASE_PROMPTS;
    const basePrompt = basePrompts[topic.subtopic] || getGenericPrompt(topic);
    const difficultyDescription = describeDifficulty(difficulty);
    const user = basePrompt.replace('{DIFFICULTY_DESCRIPTION}', difficultyDescription);
    return { system, user };
}
function getGenericPrompt(topic) {
    return `Generate an SAT ${topic.section} question for the topic: ${topic.subtopic}.

Follow official SAT format and style precisely.
Create one unambiguously correct answer with well-crafted distractors.

{DIFFICULTY_DESCRIPTION}`;
}
//# sourceMappingURL=base-prompts.js.map