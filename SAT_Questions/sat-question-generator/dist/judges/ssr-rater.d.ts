import type { EvaluationDimension, SSRResult, MicroJudgeResult, GeneratedQuestion } from '../core/types';
/**
 * Semantic Similarity Rating (SSR) based micro-judge system.
 * Uses GLM-5 to convert free-text evaluations to Likert-scale scores
 * by comparing to anchor statements.
 */
export declare class SSRRater {
    private client;
    constructor(apiKey: string);
    /**
     * Use GLM-5 to compute semantic similarity scores between evaluation and anchors
     * Returns a probability distribution over the 5 Likert levels
     */
    private computeSemanticSimilarity;
    /**
     * Calculate expected value from PMF (gives 0.5 precision naturally)
     */
    private calculateExpectedValue;
    /**
     * Elicit free-text evaluation from LLM
     */
    private elicitEvaluation;
    /**
     * Rate a question on a specific dimension using SSR
     */
    rate(dimension: EvaluationDimension, question: GeneratedQuestion, context?: Record<string, unknown>): Promise<SSRResult>;
    /**
     * Full micro-judge evaluation for a dimension
     */
    judge(dimension: EvaluationDimension, question: GeneratedQuestion, context?: Record<string, unknown>): Promise<MicroJudgeResult>;
    /**
     * Extract improvement suggestions from evaluation
     */
    private extractImprovement;
    /**
     * Evaluate a question across all relevant dimensions
     */
    evaluateQuestion(question: GeneratedQuestion, dimensions?: EvaluationDimension[]): Promise<MicroJudgeResult[]>;
    /**
     * Determine which dimensions apply to a question
     */
    private getApplicableDimensions;
}
/**
 * Factory function to create SSR rater with environment variables
 */
export declare function createSSRRater(): SSRRater;
//# sourceMappingURL=ssr-rater.d.ts.map