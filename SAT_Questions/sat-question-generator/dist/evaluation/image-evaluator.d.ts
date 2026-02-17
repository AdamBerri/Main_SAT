import type { GeneratedImage, MathQuestion, MicroJudgeResult } from '../core/types';
/**
 * Image Evaluator
 * Evaluates generated images for SAT math questions using Claude's vision capabilities
 */
export declare class ImageEvaluator {
    private client;
    constructor(apiKey: string);
    /**
     * Evaluate an image for a math question
     */
    evaluateImage(question: MathQuestion, image: GeneratedImage): Promise<MicroJudgeResult>;
    /**
     * Load image content for Claude vision
     */
    private loadImageContent;
    /**
     * Get visual evaluation from Claude
     */
    private getVisualEvaluation;
    /**
     * Compute SSR score from textual evaluation using Claude
     */
    private computeSSRScore;
    /**
     * Extract improvement suggestions
     */
    private extractImprovement;
    /**
     * Create a failed result
     */
    private createFailedResult;
    /**
     * Evaluate images for multiple questions
     */
    evaluateBatch(questionsWithImages: Array<{
        question: MathQuestion;
        image: GeneratedImage;
    }>): Promise<Map<string, MicroJudgeResult>>;
}
/**
 * Create image evaluator from environment
 */
export declare function createImageEvaluator(): ImageEvaluator;
//# sourceMappingURL=image-evaluator.d.ts.map