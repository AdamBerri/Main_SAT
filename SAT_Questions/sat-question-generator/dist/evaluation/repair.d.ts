import type { GeneratedQuestion, TopicPath, RepairResult, RepairCategory } from '../core/types';
/**
 * QuestionRepairer - Self-healing step that fixes common generation issues
 * before questions go to the judge panel.
 *
 * Catches:
 * 1. Math errors (stem numbers don't produce stated answer)
 * 2. Vague distractor rationales ("calculation error")
 * 3. Distractor values that don't match their derivations
 * 4. Non-integer distractors when correct answer is integer
 * 5. Self-debugging language left in explanations
 */
export declare class QuestionRepairer {
    private client;
    constructor(apiKey: string);
    /**
     * Run the repair pass on a single question.
     * Returns the repaired question and a report of what was fixed.
     */
    repair(question: GeneratedQuestion, topic: TopicPath): Promise<{
        question: GeneratedQuestion;
        result: RepairResult;
    }>;
    /**
     * Repair a batch of questions. Returns repaired questions + aggregate stats.
     */
    repairBatch(questions: GeneratedQuestion[], topic: TopicPath): Promise<{
        questions: GeneratedQuestion[];
        results: RepairResult[];
        stats: {
            totalAttempted: number;
            totalRepaired: number;
            issueBreakdown: Record<RepairCategory, number>;
        };
    }>;
    /**
     * Cheap local checks that don't need an LLM call.
     */
    private detectLocalIssues;
    /**
     * LLM-powered repair: verifies math, fixes rationales, cleans explanation.
     */
    private llmRepair;
    /**
     * Compare original and repaired to determine what actually changed.
     */
    private diffIssues;
    /**
     * Basic JSON sanitization for control characters.
     */
    private sanitizeJSON;
}
/**
 * Create repairer from environment
 */
export declare function createRepairer(): QuestionRepairer;
//# sourceMappingURL=repair.d.ts.map