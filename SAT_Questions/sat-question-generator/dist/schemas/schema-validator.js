"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathQuestionSchema = exports.ReadingQuestionSchema = exports.BaseQuestionSchema = void 0;
exports.validateReadingQuestion = validateReadingQuestion;
exports.validateMathQuestion = validateMathQuestion;
exports.validateQuestion = validateQuestion;
exports.formatValidationErrors = formatValidationErrors;
exports.deepValidateQuestion = deepValidateQuestion;
exports.fullValidation = fullValidation;
exports.getSchemaContent = getSchemaContent;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("../core/types");
Object.defineProperty(exports, "BaseQuestionSchema", { enumerable: true, get: function () { return types_1.BaseQuestionSchema; } });
Object.defineProperty(exports, "ReadingQuestionSchema", { enumerable: true, get: function () { return types_1.ReadingQuestionSchema; } });
Object.defineProperty(exports, "MathQuestionSchema", { enumerable: true, get: function () { return types_1.MathQuestionSchema; } });
/**
 * Validate a reading question against the schema
 */
function validateReadingQuestion(data) {
    const result = types_1.ReadingQuestionSchema.safeParse(data);
    if (result.success) {
        return { valid: true, question: result.data };
    }
    return { valid: false, errors: result.error };
}
/**
 * Validate a math question against the schema
 */
function validateMathQuestion(data) {
    const result = types_1.MathQuestionSchema.safeParse(data);
    if (result.success) {
        return { valid: true, question: result.data };
    }
    return { valid: false, errors: result.error };
}
/**
 * Validate any generated question based on topic
 */
function validateQuestion(data, topic) {
    if (topic.section === 'READING') {
        return validateReadingQuestion(data);
    }
    else {
        return validateMathQuestion(data);
    }
}
/**
 * Get validation errors as human-readable strings
 */
function formatValidationErrors(errors) {
    return errors.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
    });
}
/**
 * Deep validation checks beyond schema
 */
function deepValidateQuestion(question) {
    const issues = [];
    // Check exactly one correct answer
    const correctCount = question.choices.filter((c) => c.isCorrect).length;
    if (correctCount !== 1) {
        issues.push(`Expected exactly 1 correct answer, found ${correctCount}`);
    }
    // Check correct answer matches choices
    const correctChoice = question.choices.find((c) => c.isCorrect);
    if (correctChoice && correctChoice.label !== question.correctAnswer) {
        issues.push(`correctAnswer (${question.correctAnswer}) doesn't match choice marked as correct (${correctChoice.label})`);
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
        if (!question.distractorRationale[label]) {
            issues.push(`Missing distractor rationale for choice ${label}`);
        }
    }
    // Check explanation is substantial
    if (question.explanation.length < 50) {
        issues.push('Explanation is too short (less than 50 characters)');
    }
    // Reading-specific checks
    if ('passage' in question) {
        const readingQ = question;
        // Check passage length matches metadata
        const wordCount = readingQ.passage.split(/\s+/).length;
        const declaredCount = readingQ.passageMetadata.wordCount;
        const tolerance = 0.2; // 20% tolerance
        if (Math.abs(wordCount - declaredCount) > declaredCount * tolerance) {
            issues.push(`Passage word count (${wordCount}) differs significantly from declared (${declaredCount})`);
        }
    }
    // Math-specific checks
    if ('hasImage' in question) {
        const mathQ = question;
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
function fullValidation(data, topic) {
    // Schema validation
    const schemaResult = validateQuestion(data, topic);
    if (!schemaResult.valid) {
        return {
            valid: false,
            schemaErrors: schemaResult.errors ? formatValidationErrors(schemaResult.errors) : [],
        };
    }
    // Deep validation
    const deepResult = deepValidateQuestion(schemaResult.question);
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
function getSchemaContent(section) {
    const schemaPath = path.join(__dirname, section === 'READING' ? 'reading-schema.json' : 'math-schema.json');
    return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
}
//# sourceMappingURL=schema-validator.js.map