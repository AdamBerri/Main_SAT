import type { GeneratedQuestion, QuestionEvaluation, TopicPath, EvaluationDimension } from '../core/types';
import { SSRRater } from '../judges/ssr-rater';
/**
 * Question Evaluator - Coordinates micro-judge evaluations and aggregates results
 */
export declare class QuestionEvaluator {
    private ssrRater;
    constructor(ssrRater?: SSRRater);
    /**
     * Evaluate a single question
     */
    evaluate(question: GeneratedQuestion, dimensions?: EvaluationDimension[]): Promise<QuestionEvaluation>;
    /**
     * Evaluate multiple questions
     */
    evaluateBatch(questions: GeneratedQuestion[], dimensions?: EvaluationDimension[]): Promise<QuestionEvaluation[]>;
    /**
     * Calculate aggregate score from individual judge results
     * Uses weighted average based on dimension importance
     */
    private calculateAggregateScore;
    /**
     * Check if question passes all thresholds
     */
    private checkThreshold;
    /**
     * Extract error categories from failed evaluations
     */
    private extractErrorCategories;
    /**
     * Save evaluation to disk
     */
    saveEvaluation(evaluation: QuestionEvaluation, topic: TopicPath): Promise<string>;
    /**
     * Load evaluations for a topic
     */
    loadEvaluations(topic: TopicPath): QuestionEvaluation[];
    /**
     * Get evaluation statistics for a topic
     */
    getEvaluationStats(evaluations: QuestionEvaluation[]): {
        total: number;
        passed: number;
        passRate: number;
        avgScore: number;
        byDimension: Record<string, {
            avgScore: number;
            passRate: number;
        }>;
        errorCategoryFrequency: Record<string, number>;
    };
}
/**
 * Create evaluator with default configuration
 */
export declare function createEvaluator(): QuestionEvaluator;
//# sourceMappingURL=evaluator.d.ts.map