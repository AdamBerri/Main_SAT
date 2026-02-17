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
export declare const FAITHFULNESS_ELICITATION: ElicitationPrompt;
export declare const ANSWER_VALIDITY_ELICITATION: ElicitationPrompt;
export declare const DISTRACTOR_QUALITY_ELICITATION: ElicitationPrompt;
export declare const DIFFICULTY_ACCURACY_ELICITATION: ElicitationPrompt;
export declare const FRONTEND_CONVERTIBILITY_ELICITATION: ElicitationPrompt;
export declare const IMAGE_QUALITY_ELICITATION: ElicitationPrompt;
export declare const GRAMMAR_AUTHENTICITY_ELICITATION: ElicitationPrompt;
export declare const ELICITATION_PROMPTS: Record<EvaluationDimension, ElicitationPrompt>;
export declare function getElicitationPrompt(dimension: EvaluationDimension): ElicitationPrompt;
//# sourceMappingURL=elicitation-prompts.d.ts.map