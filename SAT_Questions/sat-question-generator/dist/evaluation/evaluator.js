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
exports.QuestionEvaluator = void 0;
exports.createEvaluator = createEvaluator;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../core/config");
const ssr_rater_1 = require("../judges/ssr-rater");
/**
 * Question Evaluator - Coordinates micro-judge evaluations and aggregates results
 */
class QuestionEvaluator {
    ssrRater;
    constructor(ssrRater) {
        this.ssrRater = ssrRater || (0, ssr_rater_1.createSSRRater)();
    }
    /**
     * Evaluate a single question
     */
    async evaluate(question, dimensions) {
        const judgeResults = await this.ssrRater.evaluateQuestion(question, dimensions);
        const aggregateScore = this.calculateAggregateScore(judgeResults);
        const passesThreshold = this.checkThreshold(judgeResults);
        const errorCategories = this.extractErrorCategories(judgeResults);
        const evaluation = {
            questionId: question.id,
            generationId: question.metadata.generationId,
            evaluatedAt: new Date().toISOString(),
            judgeResults,
            aggregateScore,
            passesThreshold,
            errorCategories,
        };
        return evaluation;
    }
    /**
     * Evaluate multiple questions
     */
    async evaluateBatch(questions, dimensions) {
        // Process in parallel with some concurrency limit
        const results = [];
        for (const question of questions) {
            const evaluation = await this.evaluate(question, dimensions);
            results.push(evaluation);
        }
        return results;
    }
    /**
     * Calculate aggregate score from individual judge results
     * Uses weighted average based on dimension importance
     */
    calculateAggregateScore(results) {
        const weights = {
            faithfulness: 1.5,
            answer_validity: 2.0, // Most critical
            distractor_quality: 1.0,
            difficulty_accuracy: 1.0,
            frontend_convertibility: 0.5,
            image_quality: 1.0,
            grammar_authenticity: 1.0,
        };
        let totalWeight = 0;
        let weightedSum = 0;
        for (const result of results) {
            const weight = weights[result.dimension];
            totalWeight += weight;
            weightedSum += result.ssrScore.expectedValue * weight;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    /**
     * Check if question passes all thresholds
     */
    checkThreshold(results) {
        // Critical dimensions that must pass
        const criticalDimensions = [
            'answer_validity',
            'faithfulness',
        ];
        for (const result of results) {
            // Critical dimensions must be acceptable
            if (criticalDimensions.includes(result.dimension)) {
                if (result.verdict !== 'acceptable') {
                    return false;
                }
            }
        }
        // Overall aggregate must be above threshold
        const avgScore = results.reduce((sum, r) => sum + r.ssrScore.expectedValue, 0) / results.length;
        return avgScore >= config_1.SSR_CONFIG.acceptableThreshold;
    }
    /**
     * Extract error categories from failed evaluations
     */
    extractErrorCategories(results) {
        const categories = [];
        for (const result of results) {
            if (result.verdict === 'unacceptable') {
                categories.push(`${result.dimension}_failure`);
            }
        }
        return categories;
    }
    /**
     * Save evaluation to disk
     */
    async saveEvaluation(evaluation, topic) {
        const evalDir = (0, config_1.getEvaluationDir)(topic);
        (0, config_1.ensureDirectoryExists)(evalDir);
        const filename = `eval_${evaluation.questionId}_${Date.now()}.json`;
        const filepath = path.join(evalDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(evaluation, null, 2));
        return filepath;
    }
    /**
     * Load evaluations for a topic
     */
    loadEvaluations(topic) {
        const evalDir = (0, config_1.getEvaluationDir)(topic);
        if (!fs.existsSync(evalDir)) {
            return [];
        }
        const files = fs.readdirSync(evalDir).filter((f) => f.endsWith('.json'));
        const evaluations = [];
        for (const file of files) {
            const content = fs.readFileSync(path.join(evalDir, file), 'utf-8');
            evaluations.push(JSON.parse(content));
        }
        return evaluations;
    }
    /**
     * Get evaluation statistics for a topic
     */
    getEvaluationStats(evaluations) {
        if (evaluations.length === 0) {
            return {
                total: 0,
                passed: 0,
                passRate: 0,
                avgScore: 0,
                byDimension: {},
                errorCategoryFrequency: {},
            };
        }
        const passed = evaluations.filter((e) => e.passesThreshold).length;
        const avgScore = evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;
        // By dimension stats
        const dimensionScores = {};
        const dimensionVerdicts = {};
        for (const evaluation of evaluations) {
            for (const result of evaluation.judgeResults) {
                if (!dimensionScores[result.dimension]) {
                    dimensionScores[result.dimension] = [];
                    dimensionVerdicts[result.dimension] = [];
                }
                dimensionScores[result.dimension].push(result.ssrScore.expectedValue);
                dimensionVerdicts[result.dimension].push(result.verdict === 'acceptable');
            }
        }
        const byDimension = {};
        for (const [dim, scores] of Object.entries(dimensionScores)) {
            const verdicts = dimensionVerdicts[dim];
            byDimension[dim] = {
                avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
                passRate: verdicts.filter(Boolean).length / verdicts.length,
            };
        }
        // Error category frequency
        const errorCategoryFrequency = {};
        for (const evaluation of evaluations) {
            for (const category of evaluation.errorCategories) {
                errorCategoryFrequency[category] = (errorCategoryFrequency[category] || 0) + 1;
            }
        }
        return {
            total: evaluations.length,
            passed,
            passRate: passed / evaluations.length,
            avgScore,
            byDimension,
            errorCategoryFrequency,
        };
    }
}
exports.QuestionEvaluator = QuestionEvaluator;
/**
 * Create evaluator with default configuration
 */
function createEvaluator() {
    return new QuestionEvaluator();
}
//# sourceMappingURL=evaluator.js.map