import type { TopicPath, DifficultyLevel, ReadingQuestion } from '../core/types';
import { type SampledReadingParams, type PassageAnalysis } from '../prompts/reading-templates';
/**
 * Reading Question Generator
 *
 * Uses TWO-STAGE generation:
 * 1. Generate passage with metadata (paragraph purposes, testable vocab, inferences, etc.)
 * 2. Generate question using passage analysis
 *
 * This ensures questions are tightly coupled to passage content and
 * enables sophisticated distractor generation.
 */
export declare class ReadingQuestionGenerator {
    private client;
    constructor(apiKey: string);
    /**
     * Stage 1: Generate passage with analysis metadata
     */
    generatePassage(params: SampledReadingParams): Promise<PassageAnalysis>;
    /**
     * Stage 2: Generate question from passage analysis
     */
    generateQuestionFromPassage(topic: TopicPath, passageAnalysis: PassageAnalysis, params: SampledReadingParams): Promise<ReadingQuestion>;
    /**
     * Full generation: passage + question in two stages
     */
    generateQuestion(topic: TopicPath, targetDifficulty: DifficultyLevel): Promise<ReadingQuestion>;
    /**
     * Generate batch of questions
     */
    generateBatch(topic: TopicPath, count: number): Promise<ReadingQuestion[]>;
    /**
     * Generate and save questions
     */
    generateAndSave(topic: TopicPath, count: number): Promise<{
        saved: number;
        failed: number;
        paths: string[];
    }>;
    private extractJSON;
    /**
     * Sanitize control characters in JSON string values
     */
    private sanitizeJSONString;
    private computeOverallDifficulty;
    private mapPassageTypeToGenre;
    private buildChoices;
    private getDefaultDifficultyDistribution;
}
/**
 * Create reading generator from environment
 */
export declare function createReadingGenerator(): ReadingQuestionGenerator;
//# sourceMappingURL=reading-generator.d.ts.map