import type { EvaluationDimension, GeneratedQuestion } from '../core/types';

/**
 * Textual elicitation prompts for micro-judges.
 * These prompts ask the LLM to provide free-text evaluations that will be
 * converted to numerical scores via SSR (Semantic Similarity Rating).
 */

export interface ElicitationPrompt {
  dimension: EvaluationDimension;
  systemPrompt: string;
  buildUserPrompt: (question: GeneratedQuestion, context?: Record<string, unknown>) => string;
}

export const FAITHFULNESS_ELICITATION: ElicitationPrompt = {
  dimension: 'faithfulness',
  systemPrompt: `You are an expert SAT question evaluator who has reviewed thousands of official College Board SAT questions. Your task is to evaluate how closely a generated question matches authentic SAT style and format.

Consider these aspects:
- Question format and structure
- Language style and complexity
- Answer choice formatting
- Difficulty calibration
- Overall authenticity

Provide a detailed evaluation describing how well this question matches official SAT standards. Be specific about what matches and what deviates.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the following generated SAT question for faithfulness to authentic SAT style:

**Topic:** ${question.topic.section} > ${question.topic.domain} > ${question.topic.subtopic}
**Stated Difficulty:** ${question.difficulty.overall}/5

**Question Stem:**
${question.stem}

**Answer Choices:**
A) ${question.choices.find(c => c.label === 'A')?.text}
B) ${question.choices.find(c => c.label === 'B')?.text}
C) ${question.choices.find(c => c.label === 'C')?.text}
D) ${question.choices.find(c => c.label === 'D')?.text}

**Correct Answer:** ${question.correctAnswer}

${'passage' in question ? `**Passage:**\n${question.passage}\n` : ''}

Provide your detailed evaluation of how faithfully this question matches authentic SAT style and format:`,
};

export const ANSWER_VALIDITY_ELICITATION: ElicitationPrompt = {
  dimension: 'answer_validity',
  systemPrompt: `You are an expert SAT content validator responsible for ensuring questions have unambiguously correct answers. Your task is to evaluate whether the designated correct answer is truly correct and whether any distractors could be argued as correct.

Consider:
- Is the keyed answer definitively correct?
- Are there any ambiguities that could make other answers defensible?
- Is the reasoning required to reach the answer sound?
- Would a knowledgeable student reliably select the correct answer?

Provide a detailed evaluation of the answer validity.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the answer validity of this SAT question:

**Question Stem:**
${question.stem}

${'passage' in question ? `**Passage:**\n${question.passage}\n` : ''}

**Answer Choices:**
A) ${question.choices.find(c => c.label === 'A')?.text}
B) ${question.choices.find(c => c.label === 'B')?.text}
C) ${question.choices.find(c => c.label === 'C')?.text}
D) ${question.choices.find(c => c.label === 'D')?.text}

**Designated Correct Answer:** ${question.correctAnswer}

**Provided Explanation:**
${question.explanation}

Evaluate whether the designated correct answer is unambiguously correct and whether any other answer could be defensibly argued as correct:`,
};

export const DISTRACTOR_QUALITY_ELICITATION: ElicitationPrompt = {
  dimension: 'distractor_quality',
  systemPrompt: `You are a psychometrician specializing in SAT item development. Your task is to evaluate the quality of distractor (wrong answer) choices. Good distractors should:

- Represent genuine misconceptions or common errors
- Be plausible to students who don't fully understand the material
- Not be trivially eliminable
- Each target a distinct error type
- Be carefully calibrated for difficulty

Evaluate the distractors' effectiveness at discriminating between students who understand the material and those who don't.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the distractor quality of this SAT question:

**Question Stem:**
${question.stem}

${'passage' in question ? `**Passage:**\n${question.passage}\n` : ''}

**Answer Choices:**
A) ${question.choices.find(c => c.label === 'A')?.text} ${question.correctAnswer === 'A' ? '(CORRECT)' : ''}
B) ${question.choices.find(c => c.label === 'B')?.text} ${question.correctAnswer === 'B' ? '(CORRECT)' : ''}
C) ${question.choices.find(c => c.label === 'C')?.text} ${question.correctAnswer === 'C' ? '(CORRECT)' : ''}
D) ${question.choices.find(c => c.label === 'D')?.text} ${question.correctAnswer === 'D' ? '(CORRECT)' : ''}

**Distractor Rationales Provided:**
${Object.entries(question.distractorRationale)
  .filter(([label]) => label !== question.correctAnswer)
  .map(([label, rationale]) => `${label}: ${rationale}`)
  .join('\n')}

Evaluate how well-crafted the distractors are at targeting specific misconceptions and discriminating between understanding levels:`,
};

export const DIFFICULTY_ACCURACY_ELICITATION: ElicitationPrompt = {
  dimension: 'difficulty_accuracy',
  systemPrompt: `You are an expert in SAT difficulty calibration. Your task is to evaluate whether a question's actual difficulty matches its stated difficulty level. Consider:

- Cognitive load and complexity
- Prerequisite knowledge required
- Number of problem-solving steps
- Common pitfalls and error opportunities
- Time pressure at this difficulty level

Difficulty scale:
1 = Easy (most students answer correctly)
2 = Below Average
3 = Medium (about 50% correct)
4 = Above Average
5 = Hard (only top students answer correctly)

Evaluate how well the actual difficulty matches the stated difficulty.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the difficulty calibration of this SAT question:

**Stated Difficulty:** ${question.difficulty.overall}/5
**Conceptual Difficulty:** ${question.difficulty.conceptual}/5
**Procedural Difficulty:** ${question.difficulty.procedural}/5
${'linguistic' in question.difficulty ? `**Linguistic Difficulty:** ${question.difficulty.linguistic}/5` : ''}
${'computational' in question.difficulty ? `**Computational Difficulty:** ${question.difficulty.computational}/5` : ''}

**Topic:** ${question.topic.section} > ${question.topic.domain} > ${question.topic.subtopic}

**Question Stem:**
${question.stem}

${'passage' in question ? `**Passage (${(question as any).passageMetadata?.wordCount} words):**\n${question.passage}\n` : ''}

**Answer Choices:**
A) ${question.choices.find(c => c.label === 'A')?.text}
B) ${question.choices.find(c => c.label === 'B')?.text}
C) ${question.choices.find(c => c.label === 'C')?.text}
D) ${question.choices.find(c => c.label === 'D')?.text}

Evaluate how accurately the actual question difficulty matches the stated difficulty level:`,
};

export const FRONTEND_CONVERTIBILITY_ELICITATION: ElicitationPrompt = {
  dimension: 'frontend_convertibility',
  systemPrompt: `You are a frontend developer evaluating whether a question's JSON structure can be cleanly rendered in a web application. Check for:

- All required fields present and correctly typed
- Special characters properly escaped
- LaTeX/math notation follows standard conventions
- No malformed or unparseable content
- Structure matches expected schema
- Content renders without issues

Evaluate the JSON structure's suitability for frontend rendering.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the frontend convertibility of this question's JSON structure:

\`\`\`json
${JSON.stringify(question, null, 2)}
\`\`\`

Evaluate whether this JSON structure can be cleanly rendered in a frontend application without errors or formatting issues:`,
};

export const IMAGE_QUALITY_ELICITATION: ElicitationPrompt = {
  dimension: 'image_quality',
  systemPrompt: `You are evaluating generated images for SAT math questions. Consider:

- Accuracy of the visual representation
- Clarity of labels and annotations
- Appropriate scale and proportions
- Professional presentation quality
- Alignment with the question description
- Whether it would help or confuse students

Evaluate the image quality for use in an official SAT question.`,

  buildUserPrompt: (question: GeneratedQuestion, context?: Record<string, unknown>) => `
Evaluate the quality of this generated image for a SAT question:

**Question Stem:**
${question.stem}

**Image Description Requested:**
${'imageDescription' in question ? question.imageDescription : 'N/A'}

**Generated Image Path:**
${'imagePath' in question ? question.imagePath : 'N/A'}

${context?.imageBase64 ? `[Image provided for visual analysis]` : '[Image file to be analyzed]'}

Evaluate the quality and appropriateness of this image for an official SAT question:`,
};

export const GRAMMAR_AUTHENTICITY_ELICITATION: ElicitationPrompt = {
  dimension: 'grammar_authenticity',
  systemPrompt: `You are an SAT Writing section expert evaluating grammar questions. Consider:

- Is the tested grammar concept appropriate for SAT?
- Is the sentence structure natural and SAT-like?
- Is the error appropriately challenging (not too obvious, not too subtle)?
- Do the answer choices follow SAT conventions?
- Does the overall presentation match official SAT grammar questions?

Evaluate how authentically this matches SAT grammar question standards.`,

  buildUserPrompt: (question: GeneratedQuestion) => `
Evaluate the grammar authenticity of this SAT question:

**Grammar Concept Being Tested:** ${question.topic.subtopic}

**Question Stem:**
${question.stem}

**Answer Choices:**
A) ${question.choices.find(c => c.label === 'A')?.text}
B) ${question.choices.find(c => c.label === 'B')?.text}
C) ${question.choices.find(c => c.label === 'C')?.text}
D) ${question.choices.find(c => c.label === 'D')?.text}

**Correct Answer:** ${question.correctAnswer}

**Explanation:**
${question.explanation}

Evaluate how authentically this question tests SAT grammar concepts with appropriate structure and style:`,
};

// Map of all elicitation prompts by dimension
export const ELICITATION_PROMPTS: Record<EvaluationDimension, ElicitationPrompt> = {
  faithfulness: FAITHFULNESS_ELICITATION,
  answer_validity: ANSWER_VALIDITY_ELICITATION,
  distractor_quality: DISTRACTOR_QUALITY_ELICITATION,
  difficulty_accuracy: DIFFICULTY_ACCURACY_ELICITATION,
  frontend_convertibility: FRONTEND_CONVERTIBILITY_ELICITATION,
  image_quality: IMAGE_QUALITY_ELICITATION,
  grammar_authenticity: GRAMMAR_AUTHENTICITY_ELICITATION,
};

export function getElicitationPrompt(dimension: EvaluationDimension): ElicitationPrompt {
  return ELICITATION_PROMPTS[dimension];
}
