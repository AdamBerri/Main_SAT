import type { TopicPath, PREAMConfig, PREAMState, GeneratedQuestion } from '../core/types';
import { QuestionEvaluator } from './evaluator';
/**
 * PREAM (Prompt Refinement with Evaluations by Automated Micro-judges) Loop
 * Implements the closed-loop prompt optimization algorithm from the PREAM paper.
 */
export declare class PREAMLoop {
    private client;
    private evaluator;
    private repairer;
    private config;
    constructor(apiKey: string, config?: Partial<PREAMConfig>, evaluator?: QuestionEvaluator);
    /**
     * Run a single PREAM iteration (for round-robin orchestration)
     * Loads existing state, runs one iteration, saves state, and returns
     */
    runSingleIteration(topic: TopicPath, generateQuestions: (topic: TopicPath, promptVersion: string, count: number) => Promise<GeneratedQuestion[]>): Promise<{
        iterationNumber: number;
        newVersion: string;
        converged: boolean;
        testScore: number;
        improvement: number;
    }>;
    /**
     * Run the PREAM optimization loop for a topic
     */
    optimize(topic: TopicPath, generateQuestions: (topic: TopicPath, promptVersion: string, count: number) => Promise<GeneratedQuestion[]>): Promise<PREAMState>;
    /**
     * Run a single PREAM iteration
     */
    private runIteration;
    /**
     * Categorize errors from evaluations
     */
    private categorizeErrors;
    /**
     * Generate improved prompt using meta-prompting
     */
    private improvePrompt;
    /**
     * Calculate metrics from evaluations
     */
    private calculateMetrics;
    /**
     * Load prompt from file
     */
    private loadPrompt;
    /**
     * Get default prompt for a topic
     */
    private getDefaultPrompt;
    /**
     * Save prompt version to file
     */
    private savePromptVersion;
    /**
     * Save PREAM state to file
     */
    private saveState;
    /**
     * Load PREAM state from file
     */
    loadState(topic: TopicPath): PREAMState | null;
    /**
     * Increment version (semver minor bump)
     */
    private incrementVersion;
    /**
     * Decrement version
     */
    private decrementVersion;
    /**
     * Summarize improvement made
     */
    private summarizeImprovement;
    /**
     * Build a lightweight coverage summary to encourage diversity
     */
    private buildCoverageSummary;
}
/**
 * Create PREAM loop with environment variables
 */
export declare function createPREAMLoop(config?: Partial<PREAMConfig>): PREAMLoop;
//# sourceMappingURL=pream-loop.d.ts.map