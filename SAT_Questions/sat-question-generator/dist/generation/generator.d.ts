import type { TopicPath, DifficultyParams, DifficultyLevel, GeneratedQuestion } from '../core/types';
/**
 * SAT Question Generator
 * Generates questions using Claude with versioned prompts and difficulty sampling
 */
export declare class QuestionGenerator {
    private client;
    private promptManager;
    private similarityCache;
    constructor(apiKey: string);
    /**
     * Sample difficulty parameters with variation
     */
    sampleDifficulty(targetLevel: DifficultyLevel, variation?: number, isReading?: boolean): DifficultyParams;
    /**
     * Generate a single question
     */
    generateQuestion(topic: TopicPath, targetDifficulty: DifficultyLevel, promptVersion?: string): Promise<GeneratedQuestion>;
    /**
     * Generate multiple questions for a topic
     */
    generateBatch(topic: TopicPath, count: number, promptVersion?: string, difficultyDistribution?: DifficultyLevel[]): Promise<GeneratedQuestion[]>;
    /**
     * Generate and save questions
     */
    generateAndSave(topic: TopicPath, count: number, promptVersion?: string): Promise<{
        saved: number;
        failed: number;
        paths: string[];
    }>;
    /**
     * Load generated questions for a topic
     */
    loadGeneratedQuestions(topic: TopicPath): GeneratedQuestion[];
    /**
     * Default difficulty distribution for batch generation
     */
    private getDefaultDifficultyDistribution;
    /**
     * Extract JSON from a potentially wrapped response
     */
    private extractJSON;
    /**
     * Sanitize control characters in JSON string values
     * Handles newlines, tabs, and other control chars that break JSON.parse
     */
    private sanitizeJSONString;
    /**
     * Simple token-based Jaccard similarity to detect duplicates
     */
    private buildSignature;
    private jaccard;
    private loadSimilarityCache;
    private isNovel;
    private addToSimilarityCache;
}
/**
 * Create generator with environment variables
 */
export declare function createGenerator(): QuestionGenerator;
//# sourceMappingURL=generator.d.ts.map