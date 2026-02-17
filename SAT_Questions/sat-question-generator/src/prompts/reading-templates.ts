/**
 * Reading Question Templates
 * Based on the methodology from sat-prep-app/convex/readingQuestionTemplates.ts
 *
 * Key features:
 * - Two-stage generation (passage first, then question)
 * - Verbalized sampling with Gaussian distributions
 * - Distractor strategies by question type
 * - Passage type characteristics
 */

// ─────────────────────────────────────────────────────────
// PASSAGE TYPES
// ─────────────────────────────────────────────────────────

export const PASSAGE_TYPES = [
  'literary_narrative',
  'social_science',
  'natural_science',
  'humanities',
] as const;

export type PassageType = (typeof PASSAGE_TYPES)[number];

export const PASSAGE_TYPE_CHARACTERISTICS: Record<
  PassageType,
  {
    description: string;
    voiceOptions: string[];
    topicExamples: string[];
    structureHints: string[];
  }
> = {
  literary_narrative: {
    description: 'Fiction excerpt or personal narrative with literary devices',
    voiceOptions: ['first-person reflective', 'third-person limited', 'third-person omniscient'],
    topicExamples: [
      'coming-of-age realization',
      'cultural identity exploration',
      'relationship dynamics',
      'confronting adversity',
      'moment of self-discovery',
    ],
    structureHints: [
      'sensory details and imagery',
      'internal monologue',
      'dialogue that reveals character',
      'symbolic objects or settings',
    ],
  },
  social_science: {
    description: 'Academic writing about human behavior, society, or economics',
    voiceOptions: ['academic third-person', 'journalistic', 'research summary'],
    topicExamples: [
      'cognitive psychology study',
      'behavioral economics finding',
      'sociological phenomenon',
      'educational research',
      'demographic trend analysis',
    ],
    structureHints: [
      'claim followed by evidence',
      'study methodology summary',
      'counterargument acknowledgment',
      'implications for practice',
    ],
  },
  natural_science: {
    description: 'Scientific research, discovery, or phenomenon explanation',
    voiceOptions: ['research paper summary', 'science journalism', 'academic explanation'],
    topicExamples: [
      'biological mechanism',
      'ecological relationship',
      'physics discovery',
      'medical research finding',
      'environmental process',
    ],
    structureHints: [
      'hypothesis and evidence',
      'process explanation',
      'cause-effect relationship',
      'scientific method reference',
    ],
  },
  humanities: {
    description: 'Historical analysis, philosophical argument, or cultural critique',
    voiceOptions: ['historical narrative', 'philosophical argument', 'cultural analysis'],
    topicExamples: [
      "historical figure's contribution",
      'philosophical concept',
      'artistic movement',
      'cultural tradition',
      'historical event analysis',
    ],
    structureHints: [
      'thesis with supporting evidence',
      'chronological development',
      'compare/contrast elements',
      'significance/implications',
    ],
  },
};

// ─────────────────────────────────────────────────────────
// DISTRACTOR STRATEGIES
// ─────────────────────────────────────────────────────────

export const READING_DISTRACTOR_STRATEGIES = {
  too_broad:
    "Answer is technically true but too general. It could apply to many passages and doesn't specifically address the question.",
  too_narrow:
    "Answer focuses on a minor detail that's in the passage but misses the main point. True statement, wrong scope.",
  opposite_meaning:
    "Answer reverses the author's actual position or the passage's meaning. Contradicts what the text says.",
  unsupported_inference:
    'Answer makes a reasonable-sounding claim that goes beyond what the text actually supports. Plausible but not evidenced.',
  wrong_scope:
    'Answer references content from the wrong paragraph or applies an idea from one part to a question about another part.',
  misread_tone:
    "Answer misinterprets the author's attitude, confusing approval with criticism, certainty with hesitation, etc.",
  partial_answer:
    'Answer addresses only part of what the question asks. Incomplete even if partially correct.',
  plausible_but_wrong:
    "Answer uses language/phrases from the passage but draws an incorrect conclusion. Sounds right, isn't right.",
  extreme_position:
    "Answer uses absolute language ('always', 'never', 'completely') when the passage is more nuanced.",
  temporal_confusion:
    'Answer confuses sequence of events, or attributes to one time period what belongs to another.',
} as const;

export type DistractorStrategy = keyof typeof READING_DISTRACTOR_STRATEGIES;

export const DISTRACTOR_COMBOS_BY_SUBTOPIC: Record<string, DistractorStrategy[][]> = {
  central_ideas: [
    ['too_broad', 'too_narrow', 'opposite_meaning'],
    ['partial_answer', 'too_narrow', 'unsupported_inference'],
    ['extreme_position', 'too_broad', 'wrong_scope'],
  ],
  inferences: [
    ['unsupported_inference', 'opposite_meaning', 'too_narrow'],
    ['plausible_but_wrong', 'extreme_position', 'wrong_scope'],
    ['unsupported_inference', 'partial_answer', 'too_broad'],
  ],
  command_of_evidence: [
    ['wrong_scope', 'partial_answer', 'opposite_meaning'],
    ['too_narrow', 'unsupported_inference', 'plausible_but_wrong'],
  ],
  textual_evidence: [
    ['wrong_scope', 'partial_answer', 'opposite_meaning'],
    ['too_narrow', 'unsupported_inference', 'plausible_but_wrong'],
  ],
  words_in_context: [
    ['plausible_but_wrong', 'too_broad', 'opposite_meaning'],
    ['wrong_scope', 'plausible_but_wrong', 'unsupported_inference'],
  ],
  text_structure: [
    ['wrong_scope', 'too_narrow', 'opposite_meaning'],
    ['partial_answer', 'plausible_but_wrong', 'too_broad'],
  ],
  cross_text_connections: [
    ['opposite_meaning', 'partial_answer', 'wrong_scope'],
    ['plausible_but_wrong', 'unsupported_inference', 'too_narrow'],
  ],
  overall_purpose: [
    ['too_broad', 'too_narrow', 'opposite_meaning'],
    ['partial_answer', 'misread_tone', 'extreme_position'],
  ],
  rhetorical_synthesis: [
    ['partial_answer', 'opposite_meaning', 'unsupported_inference'],
    ['plausible_but_wrong', 'wrong_scope', 'too_narrow'],
  ],
  transitions: [
    ['opposite_meaning', 'plausible_but_wrong', 'partial_answer'],
    ['wrong_scope', 'too_narrow', 'unsupported_inference'],
  ],
};

// ─────────────────────────────────────────────────────────
// VERBALIZED SAMPLING PARAMETERS
// ─────────────────────────────────────────────────────────

export const READING_SAMPLING_PARAMS = {
  passageComplexity: { mean: 0.5, stdDev: 0.2 },
  inferenceDepth: { mean: 0.5, stdDev: 0.25 },
  vocabularyLevel: { mean: 0.5, stdDev: 0.2 },
  evidenceEvaluation: { mean: 0.5, stdDev: 0.2 },
  synthesisRequired: { mean: 0.4, stdDev: 0.2 },

  passageLengths: ['short', 'medium', 'long'] as const,
  passageLengthWords: {
    short: { min: 100, max: 150 },
    medium: { min: 150, max: 250 },
    long: { min: 250, max: 350 },
  },
};

export type PassageLength = (typeof READING_SAMPLING_PARAMS.passageLengths)[number];

// ─────────────────────────────────────────────────────────
// SAMPLED PARAMETERS INTERFACE
// ─────────────────────────────────────────────────────────

export interface SampledReadingParams {
  passageType: PassageType;
  passageLength: PassageLength;
  passageComplexity: number; // 0.0-1.0
  inferenceDepth: number;
  vocabularyLevel: number;
  evidenceEvaluation: number;
  synthesisRequired: number;
  distractorStrategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy];
  targetOverallDifficulty: number;
}

// ─────────────────────────────────────────────────────────
// SAMPLING UTILITIES
// ─────────────────────────────────────────────────────────

export function sampleGaussian(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const value = mean + z * stdDev;
  return Math.max(0, Math.min(1, value));
}

export function sampleFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sampleDistractorCombo(
  subtopic: string
): [DistractorStrategy, DistractorStrategy, DistractorStrategy] {
  const combos = DISTRACTOR_COMBOS_BY_SUBTOPIC[subtopic] || [
    ['too_broad', 'too_narrow', 'opposite_meaning'],
  ];
  return sampleFrom(combos) as [DistractorStrategy, DistractorStrategy, DistractorStrategy];
}

export function sampleReadingParams(
  subtopic: string,
  overrides?: Partial<SampledReadingParams>
): SampledReadingParams {
  return {
    passageType: overrides?.passageType ?? sampleFrom(PASSAGE_TYPES),
    passageLength: overrides?.passageLength ?? sampleFrom(READING_SAMPLING_PARAMS.passageLengths),
    passageComplexity:
      overrides?.passageComplexity ??
      sampleGaussian(
        READING_SAMPLING_PARAMS.passageComplexity.mean,
        READING_SAMPLING_PARAMS.passageComplexity.stdDev
      ),
    inferenceDepth:
      overrides?.inferenceDepth ??
      sampleGaussian(
        READING_SAMPLING_PARAMS.inferenceDepth.mean,
        READING_SAMPLING_PARAMS.inferenceDepth.stdDev
      ),
    vocabularyLevel:
      overrides?.vocabularyLevel ??
      sampleGaussian(
        READING_SAMPLING_PARAMS.vocabularyLevel.mean,
        READING_SAMPLING_PARAMS.vocabularyLevel.stdDev
      ),
    evidenceEvaluation:
      overrides?.evidenceEvaluation ??
      sampleGaussian(
        READING_SAMPLING_PARAMS.evidenceEvaluation.mean,
        READING_SAMPLING_PARAMS.evidenceEvaluation.stdDev
      ),
    synthesisRequired:
      overrides?.synthesisRequired ??
      sampleGaussian(
        READING_SAMPLING_PARAMS.synthesisRequired.mean,
        READING_SAMPLING_PARAMS.synthesisRequired.stdDev
      ),
    distractorStrategies: overrides?.distractorStrategies ?? sampleDistractorCombo(subtopic),
    targetOverallDifficulty: overrides?.targetOverallDifficulty ?? sampleGaussian(0.5, 0.15),
  };
}

// ─────────────────────────────────────────────────────────
// PASSAGE GENERATION PROMPT
// ─────────────────────────────────────────────────────────

export function buildPassageGenerationPrompt(params: SampledReadingParams): string {
  const typeChar = PASSAGE_TYPE_CHARACTERISTICS[params.passageType];
  const lengthRange = READING_SAMPLING_PARAMS.passageLengthWords[params.passageLength];
  const voice = sampleFrom(typeChar.voiceOptions);
  const topic = sampleFrom(typeChar.topicExamples);
  const structureHints = typeChar.structureHints.slice(0, 2).join(', ');

  return `You are generating an SAT-style reading passage.

PASSAGE SPECIFICATIONS:
- Type: ${params.passageType}
- Type Description: ${typeChar.description}
- Voice/Style: ${voice}
- Topic Area: ${topic}
- Complexity Level: ${params.passageComplexity.toFixed(2)} (0.0 = accessible/clear, 1.0 = challenging/dense)
- Target Length: ${lengthRange.min}-${lengthRange.max} words (${params.passageLength})

STRUCTURAL REQUIREMENTS:
1. Write in the style appropriate for ${params.passageType}
2. Use clear paragraph structure (2-4 paragraphs)
3. Each paragraph should have a distinct purpose
4. Vocabulary should match complexity level ${params.passageComplexity.toFixed(2)}
5. Include at least one sentence that requires inference to understand fully
6. Include at least one vocabulary word used in a context-dependent way
7. Include structural features: ${structureHints}

QUALITY GUIDELINES:
- Write like a real excerpt from a book, article, or academic text
- Avoid overly didactic or textbook-style writing
- Include specific details, names, or data where appropriate
- Create natural opportunities for SAT-style questions
- The passage should stand alone as a coherent piece

OUTPUT FORMAT (JSON only, no additional text):
{
  "passage": "Full passage text with clear paragraph breaks (use \\n\\n between paragraphs)",
  "title": "Optional title (null if not appropriate for the type)",
  "author": "Realistic author name (invented)",
  "source": "Realistic publication/source (invented)",
  "paragraphPurposes": ["Purpose of para 1", "Purpose of para 2", ...],
  "testableVocabulary": [
    {
      "word": "word that could be tested",
      "sentenceContext": "The sentence containing this word",
      "contextualMeaning": "What the word means in THIS context",
      "alternativeMeanings": ["Other common meanings that don't fit here"]
    }
  ],
  "keyInferences": [
    "An inference readers could make from the text",
    "Another inference (not explicitly stated)"
  ],
  "mainIdea": "The central idea or main argument of the passage",
  "authorPurpose": "What the author is trying to accomplish"
}

Generate the passage now:`;
}

// ─────────────────────────────────────────────────────────
// PASSAGE ANALYSIS INTERFACE
// ─────────────────────────────────────────────────────────

export interface PassageAnalysis {
  passage: string;
  title: string | null;
  author: string;
  source: string;
  paragraphPurposes: string[];
  testableVocabulary: Array<{
    word: string;
    sentenceContext: string;
    contextualMeaning: string;
    alternativeMeanings: string[];
  }>;
  keyInferences: string[];
  mainIdea: string;
  authorPurpose: string;
}

// ─────────────────────────────────────────────────────────
// QUESTION GENERATION PROMPTS BY SUBTOPIC
// ─────────────────────────────────────────────────────────

export function buildDistractorInstructions(
  strategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy]
): string {
  return strategies
    .map(
      (strategy, i) =>
        `- Choice ${['B', 'C', 'D'][i]} (${strategy}): ${READING_DISTRACTOR_STRATEGIES[strategy]}`
    )
    .join('\n');
}

export const QUESTION_TYPE_PROMPTS: Record<string, string> = {
  central_ideas: `You are generating an SAT Central Ideas question.

This question type asks students to identify the main point, central claim, or primary purpose of the passage.

PASSAGE:
{passage}

PASSAGE ANALYSIS:
- Main Idea: {mainIdea}
- Author's Purpose: {authorPurpose}

QUESTION REQUIREMENTS:
1. Question stem should ask about the main idea, central claim, or primary purpose
2. Use stems like:
   - "Which choice best states the main idea of the text?"
   - "What is the primary purpose of the text?"

CORRECT ANSWER REQUIREMENTS:
- Must capture the MAIN point (not a supporting detail)
- Should be specific to this passage (not generic)
- Should encompass the whole passage, not just one part

DISTRACTOR STRATEGIES:
{distractorInstructions}

OUTPUT FORMAT (JSON only):
{
  "questionStem": "Which choice best states...",
  "choices": {
    "A": "Correct answer capturing the main idea",
    "B": "Distractor using strategy 1",
    "C": "Distractor using strategy 2",
    "D": "Distractor using strategy 3"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: explains how it captures the main idea",
  "distractorExplanations": {
    "B": "Why wrong + strategy used",
    "C": "Why wrong + strategy used",
    "D": "Why wrong + strategy used"
  }
}`,

  inferences: `You are generating an SAT Inferences question.

This question type asks students to draw conclusions not explicitly stated in the text.

PASSAGE:
{passage}

KEY INFERENCES FROM PASSAGE:
{keyInferences}

QUESTION REQUIREMENTS:
1. Question stem should ask what can be inferred or concluded
2. Use stems like:
   - "Based on the text, it can be inferred that..."
   - "The text most strongly suggests that..."

CORRECT ANSWER REQUIREMENTS:
- Must be SUPPORTED by the text but NOT explicitly stated
- Should require connecting ideas from the passage
- Must be a reasonable inference, not a leap

DISTRACTOR STRATEGIES:
{distractorInstructions}

OUTPUT FORMAT (JSON only):
{
  "questionStem": "Based on the text, it can be inferred that...",
  "choices": {
    "A": "Correct: supported inference",
    "B": "Distractor using strategy 1",
    "C": "Distractor using strategy 2",
    "D": "Distractor using strategy 3"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: shows text support for inference",
  "distractorExplanations": {
    "B": "Why wrong + strategy used",
    "C": "Why wrong + strategy used",
    "D": "Why wrong + strategy used"
  }
}`,

  words_in_context: `You are generating an SAT Vocabulary in Context question.

This question type tests understanding of how a word is used in a specific context.

PASSAGE:
{passage}

TESTABLE VOCABULARY:
{testableVocabulary}

QUESTION REQUIREMENTS:
1. Select a word that has multiple possible meanings
2. Question stem: "As used in the text, '[word]' most nearly means..."
3. The word should be used in a way that might not be its most common meaning

CORRECT ANSWER REQUIREMENTS:
- Must reflect the CONTEXTUAL meaning (not dictionary definition)
- Should be a synonym that works in the sentence

DISTRACTOR STRATEGIES:
{distractorInstructions}

Distractors should include OTHER valid meanings of the word that don't fit context.

OUTPUT FORMAT (JSON only):
{
  "targetWord": "The word being tested",
  "targetSentence": "The sentence from the passage containing this word",
  "questionStem": "As used in the text, '[word]' most nearly means",
  "choices": {
    "A": "Correct: contextual meaning",
    "B": "Wrong: different valid meaning",
    "C": "Wrong: related but incorrect",
    "D": "Wrong: another meaning that doesn't fit"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: context clues that support this meaning",
  "distractorExplanations": {
    "B": "Why wrong: this meaning doesn't fit because...",
    "C": "Why wrong: changes the intended meaning...",
    "D": "Why wrong: not supported by context..."
  }
}`,

  text_structure: `You are generating an SAT Text Structure question.

This question type asks about the function or purpose of a specific part of the text.

PASSAGE:
{passage}

PARAGRAPH PURPOSES:
{paragraphPurposes}

QUESTION REQUIREMENTS:
1. Ask about the function of a paragraph, sentence, or section
2. Use stems like:
   - "Which choice best describes the function of the [second paragraph]?"
   - "The author includes [specific detail] primarily to..."

CORRECT ANSWER REQUIREMENTS:
- Must accurately describe the FUNCTION (not just content)
- Should explain HOW that part relates to the whole

DISTRACTOR STRATEGIES:
{distractorInstructions}

OUTPUT FORMAT (JSON only):
{
  "targetElement": "The paragraph/sentence being asked about",
  "questionStem": "Which choice best describes the function of...",
  "choices": {
    "A": "Correct: accurate function description",
    "B": "Distractor using strategy 1",
    "C": "Distractor using strategy 2",
    "D": "Distractor using strategy 3"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: how this element functions in the passage",
  "distractorExplanations": {
    "B": "Why wrong + strategy used",
    "C": "Why wrong + strategy used",
    "D": "Why wrong + strategy used"
  }
}`,

  command_of_evidence: `You are generating an SAT Command of Evidence question.

This question type asks students to identify which quotation best supports a claim.

PASSAGE:
{passage}

QUESTION REQUIREMENTS:
1. First establish a claim or interpretation about the passage
2. Then ask which quotation BEST supports that claim
3. All choices should be ACTUAL quotes from the passage

CORRECT ANSWER REQUIREMENTS:
- Must be a real quote from the passage
- Must DIRECTLY and CLEARLY support the stated claim

DISTRACTOR STRATEGIES:
{distractorInstructions}

OUTPUT FORMAT (JSON only):
{
  "claim": "The claim/interpretation that needs support",
  "questionStem": "Which quotation from the text most effectively supports the claim that [claim]?",
  "choices": {
    "A": "Correct quote that directly supports the claim",
    "B": "Quote from passage (related but doesn't support)",
    "C": "Quote from passage (wrong scope)",
    "D": "Quote from passage (misses the point)"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: directly supports because...",
  "distractorExplanations": {
    "B": "Why wrong: related but doesn't support because...",
    "C": "Why wrong: from wrong section...",
    "D": "Why wrong: misses the key aspect..."
  }
}`,

  overall_purpose: `You are generating an SAT Author's Purpose question.

This question type asks about the author's purpose or intent.

PASSAGE:
{passage}

PASSAGE ANALYSIS:
- Main Idea: {mainIdea}
- Author's Purpose: {authorPurpose}

QUESTION REQUIREMENTS:
1. Ask about the author's "main purpose" or why they wrote the passage
2. Use stems like:
   - "The main purpose of the text is to..."
   - "The author most likely wrote this passage in order to..."

CORRECT ANSWER REQUIREMENTS:
- Must accurately describe the rhetorical intent
- Should distinguish between topic and purpose

DISTRACTOR STRATEGIES:
{distractorInstructions}

OUTPUT FORMAT (JSON only):
{
  "questionStem": "The main purpose of the text is to...",
  "choices": {
    "A": "Correct: accurate purpose description",
    "B": "Distractor using strategy 1",
    "C": "Distractor using strategy 2",
    "D": "Distractor using strategy 3"
  },
  "correctAnswer": "A",
  "explanation": "Why A is correct: captures the author's intent",
  "distractorExplanations": {
    "B": "Why wrong + strategy used",
    "C": "Why wrong + strategy used",
    "D": "Why wrong + strategy used"
  }
}`,
};

export function buildQuestionGenerationPrompt(
  subtopic: string,
  passageAnalysis: PassageAnalysis,
  distractorStrategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy]
): string {
  const basePrompt = QUESTION_TYPE_PROMPTS[subtopic] || QUESTION_TYPE_PROMPTS['central_ideas'];
  const distractorInstructions = buildDistractorInstructions(distractorStrategies);

  return basePrompt
    .replace('{passage}', passageAnalysis.passage)
    .replace('{mainIdea}', passageAnalysis.mainIdea)
    .replace('{authorPurpose}', passageAnalysis.authorPurpose)
    .replace(
      '{paragraphPurposes}',
      passageAnalysis.paragraphPurposes.map((p, i) => `Paragraph ${i + 1}: ${p}`).join('\n')
    )
    .replace(
      '{keyInferences}',
      passageAnalysis.keyInferences.map((inf, i) => `${i + 1}. ${inf}`).join('\n')
    )
    .replace('{testableVocabulary}', JSON.stringify(passageAnalysis.testableVocabulary, null, 2))
    .replace('{distractorInstructions}', distractorInstructions);
}
