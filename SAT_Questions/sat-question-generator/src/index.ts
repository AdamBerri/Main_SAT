/**
 * @sat-prep/question-generator
 *
 * PREAM-based self-improving SAT question generation system.
 *
 * Features:
 * - SSR (Semantic Similarity Rating) based micro-judge evaluation
 * - PREAM optimization loop for prompt improvement
 * - Versioned prompts per subtopic
 * - Multi-API key batch execution
 * - Image generation and evaluation for math questions
 *
 * @example
 * ```typescript
 * import {
 *   createGenerator,
 *   createEvaluator,
 *   createPREAMLoop,
 *   parseTopicString,
 * } from '@sat-prep/question-generator';
 *
 * // Generate questions
 * const generator = createGenerator();
 * const topic = parseTopicString('MATH/Algebra/linear_equations');
 * const questions = await generator.generateBatch(topic, 10);
 *
 * // Evaluate questions
 * const evaluator = createEvaluator();
 * const evaluations = await evaluator.evaluateBatch(questions);
 *
 * // Run PREAM optimization
 * const pream = createPREAMLoop();
 * const state = await pream.optimize(topic, generator.generateBatch.bind(generator));
 * ```
 */

// Core types
export * from './core/types';
export * from './core/config';

// Judges (SSR)
export * from './judges';

// Evaluation
export * from './evaluation';

// Generation
export * from './generation';

// Prompts
export * from './prompts';

// Schemas
export * from './schemas';
