import type { TopicPath, BatchConfig, BatchResult } from '../core/types';
/**
 * API Key Pool Manager
 * Manages multiple Zhipu API keys with rate limiting
 */
export declare class APIKeyPool {
    private keys;
    private currentIndex;
    constructor(apiKeys: string[]);
    /**
     * Get next available API key
     */
    getKey(): string;
    /**
     * Get count of available keys
     */
    get keyCount(): number;
}
/**
 * Batch Executor
 * Runs question generation and evaluation in parallel with multiple API keys.
 * Organizes generated questions by topic in the file system.
 */
export declare class BatchExecutor {
    private keyPool;
    private concurrency;
    constructor(apiKeys: string[], concurrency?: number);
    /**
     * Execute batch generation for multiple topics
     * Questions are saved organized by topic: generated/SECTION/DOMAIN/SUBTOPIC/
     */
    executeBatch(config: BatchConfig): Promise<BatchResult>;
    /**
     * Process a single topic batch
     * Saves questions to: generated/SECTION/DOMAIN/SUBTOPIC/
     */
    private processTopicBatch;
    /**
     * Save questions organized by topic
     * Directory structure: generated/SECTION/DOMAIN/SUBTOPIC/
     * Filename includes pass/fail status
     */
    private saveQuestionsByTopic;
    /**
     * Save batch results summary
     */
    private saveBatchResults;
    /**
     * Calculate duration between two ISO timestamps
     */
    private calculateDuration;
    /**
     * Run batch for all topics
     */
    executeAllTopics(questionsPerTopic: number): Promise<BatchResult>;
    /**
     * Run batch for a specific section
     */
    executeSection(section: 'READING' | 'MATH', questionsPerTopic: number): Promise<BatchResult>;
    /**
     * Run batch for specific topics
     */
    executeTopics(topics: TopicPath[], questionsPerTopic: number): Promise<BatchResult>;
}
/**
 * Create batch executor from environment variables
 */
export declare function createBatchExecutor(concurrency?: number): BatchExecutor;
//# sourceMappingURL=batch-executor.d.ts.map