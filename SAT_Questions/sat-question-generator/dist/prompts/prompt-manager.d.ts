import type { TopicPath, PromptConfig, PromptVersion, DifficultyParams, TemperatureConfig, Blueprint } from '../core/types';
/**
 * Manages prompt versions, loading, and configuration for each topic.
 */
export declare class PromptManager {
    /**
     * Get or create prompt configuration for a topic
     */
    getPromptConfig(topic: TopicPath): PromptConfig;
    /**
     * Save prompt configuration
     */
    savePromptConfig(config: PromptConfig): void;
    /**
     * Get the current prompt for a topic
     */
    getCurrentPrompt(topic: TopicPath): string;
    /**
     * Get a specific version of a prompt
     */
    getPromptByVersion(topic: TopicPath, version: string): string;
    /**
     * Get the base prompt for a topic (before any PREAM optimization)
     */
    getBasePrompt(topic: TopicPath): string;
    /**
     * Generic fallback prompt
     */
    private getGenericBasePrompt;
    /**
     * Initialize prompts for a topic (creates v1.0.0 from base prompt)
     */
    initializeTopic(topic: TopicPath): void;
    /**
     * Add a new version of a prompt
     */
    addVersion(topic: TopicPath, content: string, parentVersion: string, preamIteration: number): string;
    /**
     * Update performance metrics for a version
     */
    updateVersionMetrics(topic: TopicPath, version: string, metrics: PromptVersion['performanceMetrics']): void;
    /**
     * Get version history for a topic
     */
    getVersionHistory(topic: TopicPath): PromptVersion[];
    /**
     * Set the current (active) version for a topic
     */
    setCurrentVersion(topic: TopicPath, version: string): void;
    /**
     * Get temperature configuration for a topic
     */
    getTemperatureConfig(topic: TopicPath): TemperatureConfig;
    /**
     * Update temperature configuration
     */
    setTemperatureConfig(topic: TopicPath, tempConfig: TemperatureConfig): void;
    /**
     * Build full prompt with difficulty for generation
     */
    buildGenerationPrompt(topic: TopicPath, difficulty: DifficultyParams, version?: string, blueprint?: Blueprint): {
        system: string;
        user: string;
    };
    /**
     * Format difficulty description
     */
    private describeDifficulty;
    /**
     * Increment version number
     */
    private incrementVersion;
    /**
     * Get all topics that have been initialized
     */
    getInitializedTopics(): TopicPath[];
}
export declare function getPromptManager(): PromptManager;
//# sourceMappingURL=prompt-manager.d.ts.map