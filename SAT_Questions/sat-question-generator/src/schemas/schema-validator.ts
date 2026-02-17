import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import type { TopicPath, GeneratedQuestion, ReadingQuestion, MathQuestion } from '../core/types';
import { BaseQuestionSchema, ReadingQuestionSchema, MathQuestionSchema } from '../core/types';

/**
 * Schema validation utilities for generated questions
 */

// Re-export schemas for external use
export { BaseQuestionSchema, ReadingQuestionSchema, MathQuestionSchema };

/**
 * Validate a reading question against the schema
 */
export function validateReadingQuestion(data: unknown): {
  valid: boolean;
  question?: ReadingQuestion;
  errors?: z.ZodError;
} {
  const result = ReadingQuestionSchema.safeParse(data);

  if (result.success) {
    return { valid: true, question: result.data };
  }

  return { valid: false, errors: result.error };
}

/**
 * Validate a math question against the schema
 */
export function validateMathQuestion(data: unknown): {
  valid: boolean;
  question?: MathQuestion;
  errors?: z.ZodError;
} {
  const result = MathQuestionSchema.safeParse(data);

  if (result.success) {
    return { valid: true, question: result.data };
  }

  return { valid: false, errors: result.error };
}

/**
 * Validate any generated question based on topic
 */
export function validateQuestion(
  data: unknown,
  topic: TopicPath
): {
  valid: boolean;
  question?: GeneratedQuestion;
  errors?: z.ZodError;
} {
  if (topic.section === 'READING') {
    return validateReadingQuestion(data);
  } else {
    return validateMathQuestion(data);
  }
}

/**
 * Get validation errors as human-readable strings
 */
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}

/**
 * Deep validation checks beyond schema
 */
export function deepValidateQuestion(question: GeneratedQuestion): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check exactly one correct answer
  const correctCount = question.choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    issues.push(`Expected exactly 1 correct answer, found ${correctCount}`);
  }

  // Check correct answer matches choices
  const correctChoice = question.choices.find((c) => c.isCorrect);
  if (correctChoice && correctChoice.label !== question.correctAnswer) {
    issues.push(
      `correctAnswer (${question.correctAnswer}) doesn't match choice marked as correct (${correctChoice.label})`
    );
  }

  // Check all labels are unique
  const labels = question.choices.map((c) => c.label);
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== 4) {
    issues.push('Answer choice labels are not unique');
  }

  // Check all labels are A, B, C, D
  const expectedLabels = new Set(['A', 'B', 'C', 'D']);
  for (const label of labels) {
    if (!expectedLabels.has(label)) {
      issues.push(`Invalid answer choice label: ${label}`);
    }
  }

  // Check distractor rationales exist for wrong answers
  const wrongLabels = question.choices
    .filter((c) => !c.isCorrect)
    .map((c) => c.label);
  for (const label of wrongLabels) {
    if (!question.distractorRationale[label as keyof typeof question.distractorRationale]) {
      issues.push(`Missing distractor rationale for choice ${label}`);
    }
  }

  // Check explanation is substantial
  if (question.explanation.length < 50) {
    issues.push('Explanation is too short (less than 50 characters)');
  }

  // Reading-specific checks
  if ('passage' in question) {
    const readingQ = question as ReadingQuestion;

    // Check passage length matches metadata
    const wordCount = readingQ.passage.split(/\s+/).length;
    const declaredCount = readingQ.passageMetadata.wordCount;
    const tolerance = 0.2; // 20% tolerance

    if (Math.abs(wordCount - declaredCount) > declaredCount * tolerance) {
      issues.push(
        `Passage word count (${wordCount}) differs significantly from declared (${declaredCount})`
      );
    }
  }

  // Math-specific checks
  if ('hasImage' in question) {
    const mathQ = question as MathQuestion;

    // If hasImage is true, imageDescription should exist
    if (mathQ.hasImage && !mathQ.imageDescription) {
      issues.push('Question has image flag but no image description');
    }

    // Grid-in questions should have gridInAnswer
    if (mathQ.answerType === 'grid_in' && !mathQ.gridInAnswer) {
      issues.push('Grid-in question missing gridInAnswer');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Full validation pipeline
 */
export function fullValidation(
  data: unknown,
  topic: TopicPath
): {
  valid: boolean;
  question?: GeneratedQuestion;
  schemaErrors?: string[];
  deepErrors?: string[];
} {
  // Schema validation
  const schemaResult = validateQuestion(data, topic);

  if (!schemaResult.valid) {
    return {
      valid: false,
      schemaErrors: schemaResult.errors ? formatValidationErrors(schemaResult.errors) : [],
    };
  }

  // Deep validation
  const deepResult = deepValidateQuestion(schemaResult.question!);

  if (!deepResult.valid) {
    return {
      valid: false,
      question: schemaResult.question,
      deepErrors: deepResult.issues,
    };
  }

  return {
    valid: true,
    question: schemaResult.question,
  };
}

/**
 * Load and return the JSON schema file content
 */
export function getSchemaContent(section: 'READING' | 'MATH'): object {
  const schemaPath = path.join(
    __dirname,
    section === 'READING' ? 'reading-schema.json' : 'math-schema.json'
  );

  return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
}
