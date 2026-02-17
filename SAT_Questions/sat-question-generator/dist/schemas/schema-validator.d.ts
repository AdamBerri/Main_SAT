import { z } from 'zod';
import type { TopicPath, GeneratedQuestion, ReadingQuestion, MathQuestion } from '../core/types';
import { BaseQuestionSchema, ReadingQuestionSchema, MathQuestionSchema } from '../core/types';
/**
 * Schema validation utilities for generated questions
 */
export { BaseQuestionSchema, ReadingQuestionSchema, MathQuestionSchema };
/**
 * Validate a reading question against the schema
 */
export declare function validateReadingQuestion(data: unknown): {
    valid: boolean;
    question?: ReadingQuestion;
    errors?: z.ZodError;
};
/**
 * Validate a math question against the schema
 */
export declare function validateMathQuestion(data: unknown): {
    valid: boolean;
    question?: MathQuestion;
    errors?: z.ZodError;
};
/**
 * Validate any generated question based on topic
 */
export declare function validateQuestion(data: unknown, topic: TopicPath): {
    valid: boolean;
    question?: GeneratedQuestion;
    errors?: z.ZodError;
};
/**
 * Get validation errors as human-readable strings
 */
export declare function formatValidationErrors(errors: z.ZodError): string[];
/**
 * Deep validation checks beyond schema
 */
export declare function deepValidateQuestion(question: GeneratedQuestion): {
    valid: boolean;
    issues: string[];
};
/**
 * Full validation pipeline
 */
export declare function fullValidation(data: unknown, topic: TopicPath): {
    valid: boolean;
    question?: GeneratedQuestion;
    schemaErrors?: string[];
    deepErrors?: string[];
};
/**
 * Load and return the JSON schema file content
 */
export declare function getSchemaContent(section: 'READING' | 'MATH'): object;
//# sourceMappingURL=schema-validator.d.ts.map