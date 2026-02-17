import type { TopicPath, DifficultyParams } from '../core/types';
/**
 * Base prompt templates for SAT question generation.
 * These serve as initial prompts that will be refined via PREAM optimization.
 */
export declare const READING_SYSTEM_PROMPT = "You are an expert SAT question writer with extensive experience creating official College Board SAT Reading & Writing section questions. Your questions are indistinguishable from authentic SAT questions.\n\nKey principles:\n1. Follow SAT format precisely - single passage followed by a single question\n2. Use appropriate vocabulary and sentence complexity for SAT\n3. Create unambiguously correct answers with well-crafted distractors\n4. Calibrate difficulty accurately to the specified level\n5. Ensure passages are engaging and academically appropriate\n\nYou always output valid JSON matching the provided schema.";
export declare const MATH_SYSTEM_PROMPT = "You are an expert SAT question writer with extensive experience creating official College Board SAT Math section questions. Your questions are indistinguishable from authentic SAT questions.\n\nKey principles:\n1. Follow SAT format precisely with clear mathematical notation\n2. Use realistic contexts that are appropriate for SAT\n3. Create problems that test genuine mathematical understanding\n4. Design distractors that target specific misconceptions\n5. Calibrate difficulty accurately to the specified level\n\nYou always output valid JSON matching the provided schema.";
export declare function describeDifficulty(params: DifficultyParams): string;
export declare const READING_BASE_PROMPTS: Record<string, string>;
export declare const MATH_BASE_PROMPTS: Record<string, string>;
export declare function buildPrompt(topic: TopicPath, difficulty: DifficultyParams): {
    system: string;
    user: string;
};
//# sourceMappingURL=base-prompts.d.ts.map