"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathQuestionSchema = exports.ReadingQuestionSchema = exports.BaseQuestionSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Question Output Types
// ============================================
exports.BaseQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    topic: zod_1.z.object({
        section: zod_1.z.enum(['READING', 'MATH']),
        domain: zod_1.z.string(),
        subtopic: zod_1.z.string(),
    }),
    difficulty: zod_1.z.object({
        overall: zod_1.z.number().min(1).max(5),
        conceptual: zod_1.z.number().min(1).max(5),
        procedural: zod_1.z.number().min(1).max(5),
        linguistic: zod_1.z.number().min(1).max(5).optional(),
        computational: zod_1.z.number().min(1).max(5).optional(),
    }),
    stem: zod_1.z.string(),
    choices: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.enum(['A', 'B', 'C', 'D']),
        text: zod_1.z.string(),
        isCorrect: zod_1.z.boolean(),
    })),
    correctAnswer: zod_1.z.enum(['A', 'B', 'C', 'D']),
    explanation: zod_1.z.string(),
    distractorRationale: zod_1.z.record(zod_1.z.enum(['A', 'B', 'C', 'D']), zod_1.z.string()),
    metadata: zod_1.z.object({
        generatedAt: zod_1.z.string().datetime(),
        promptVersion: zod_1.z.string(),
        modelUsed: zod_1.z.string(),
        generationId: zod_1.z.string().uuid(),
    }),
});
exports.ReadingQuestionSchema = exports.BaseQuestionSchema.extend({
    passage: zod_1.z.string(),
    passageMetadata: zod_1.z.object({
        genre: zod_1.z.enum(['literary', 'informational', 'argumentative', 'scientific']),
        wordCount: zod_1.z.number(),
        source: zod_1.z.string().optional(),
    }),
    // Image support for reading questions with charts/graphs/tables
    hasImage: zod_1.z.boolean().optional(),
    imageDescription: zod_1.z.string().optional(),
    imagePath: zod_1.z.string().optional(),
});
exports.MathQuestionSchema = exports.BaseQuestionSchema.extend({
    hasImage: zod_1.z.boolean(),
    imageDescription: zod_1.z.string().optional(),
    imagePath: zod_1.z.string().optional(),
    requiresCalculator: zod_1.z.boolean(),
    answerType: zod_1.z.enum(['multiple_choice', 'grid_in']),
    gridInAnswer: zod_1.z.string().optional(),
});
//# sourceMappingURL=types.js.map