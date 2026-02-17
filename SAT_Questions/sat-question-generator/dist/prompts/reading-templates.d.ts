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
export declare const PASSAGE_TYPES: readonly ["literary_narrative", "social_science", "natural_science", "humanities"];
export type PassageType = (typeof PASSAGE_TYPES)[number];
export declare const PASSAGE_TYPE_CHARACTERISTICS: Record<PassageType, {
    description: string;
    voiceOptions: string[];
    topicExamples: string[];
    structureHints: string[];
}>;
export declare const READING_DISTRACTOR_STRATEGIES: {
    readonly too_broad: "Answer is technically true but too general. It could apply to many passages and doesn't specifically address the question.";
    readonly too_narrow: "Answer focuses on a minor detail that's in the passage but misses the main point. True statement, wrong scope.";
    readonly opposite_meaning: "Answer reverses the author's actual position or the passage's meaning. Contradicts what the text says.";
    readonly unsupported_inference: "Answer makes a reasonable-sounding claim that goes beyond what the text actually supports. Plausible but not evidenced.";
    readonly wrong_scope: "Answer references content from the wrong paragraph or applies an idea from one part to a question about another part.";
    readonly misread_tone: "Answer misinterprets the author's attitude, confusing approval with criticism, certainty with hesitation, etc.";
    readonly partial_answer: "Answer addresses only part of what the question asks. Incomplete even if partially correct.";
    readonly plausible_but_wrong: "Answer uses language/phrases from the passage but draws an incorrect conclusion. Sounds right, isn't right.";
    readonly extreme_position: "Answer uses absolute language ('always', 'never', 'completely') when the passage is more nuanced.";
    readonly temporal_confusion: "Answer confuses sequence of events, or attributes to one time period what belongs to another.";
};
export type DistractorStrategy = keyof typeof READING_DISTRACTOR_STRATEGIES;
export declare const DISTRACTOR_COMBOS_BY_SUBTOPIC: Record<string, DistractorStrategy[][]>;
export declare const READING_SAMPLING_PARAMS: {
    passageComplexity: {
        mean: number;
        stdDev: number;
    };
    inferenceDepth: {
        mean: number;
        stdDev: number;
    };
    vocabularyLevel: {
        mean: number;
        stdDev: number;
    };
    evidenceEvaluation: {
        mean: number;
        stdDev: number;
    };
    synthesisRequired: {
        mean: number;
        stdDev: number;
    };
    passageLengths: readonly ["short", "medium", "long"];
    passageLengthWords: {
        short: {
            min: number;
            max: number;
        };
        medium: {
            min: number;
            max: number;
        };
        long: {
            min: number;
            max: number;
        };
    };
};
export type PassageLength = (typeof READING_SAMPLING_PARAMS.passageLengths)[number];
export interface SampledReadingParams {
    passageType: PassageType;
    passageLength: PassageLength;
    passageComplexity: number;
    inferenceDepth: number;
    vocabularyLevel: number;
    evidenceEvaluation: number;
    synthesisRequired: number;
    distractorStrategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy];
    targetOverallDifficulty: number;
}
export declare function sampleGaussian(mean: number, stdDev: number): number;
export declare function sampleFrom<T>(arr: readonly T[]): T;
export declare function sampleDistractorCombo(subtopic: string): [DistractorStrategy, DistractorStrategy, DistractorStrategy];
export declare function sampleReadingParams(subtopic: string, overrides?: Partial<SampledReadingParams>): SampledReadingParams;
export declare function buildPassageGenerationPrompt(params: SampledReadingParams): string;
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
export declare function buildDistractorInstructions(strategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy]): string;
export declare const QUESTION_TYPE_PROMPTS: Record<string, string>;
export declare function buildQuestionGenerationPrompt(subtopic: string, passageAnalysis: PassageAnalysis, distractorStrategies: [DistractorStrategy, DistractorStrategy, DistractorStrategy]): string;
//# sourceMappingURL=reading-templates.d.ts.map