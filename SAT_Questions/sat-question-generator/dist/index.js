"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core types
__exportStar(require("./core/types"), exports);
__exportStar(require("./core/config"), exports);
// Judges (SSR)
__exportStar(require("./judges"), exports);
// Evaluation
__exportStar(require("./evaluation"), exports);
// Generation
__exportStar(require("./generation"), exports);
// Prompts
__exportStar(require("./prompts"), exports);
// Schemas
__exportStar(require("./schemas"), exports);
//# sourceMappingURL=index.js.map