import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import type {
  GeneratedQuestion,
  QuestionEvaluation,
  MicroJudgeResult,
  TopicPath,
  EvaluationDimension,
} from '../core/types';
import {
  getEvaluationDir,
  ensureDirectoryExists,
  SSR_CONFIG,
} from '../core/config';
import { SSRRater, createSSRRater } from '../judges/ssr-rater';

/**
 * Question Evaluator - Coordinates micro-judge evaluations and aggregates results
 */
export class QuestionEvaluator {
  private ssrRater: SSRRater;

  constructor(ssrRater?: SSRRater) {
    this.ssrRater = ssrRater || createSSRRater();
  }

  /**
   * Evaluate a single question
   */
  async evaluate(
    question: GeneratedQuestion,
    dimensions?: EvaluationDimension[]
  ): Promise<QuestionEvaluation> {
    const judgeResults = await this.ssrRater.evaluateQuestion(question, dimensions);

    const aggregateScore = this.calculateAggregateScore(judgeResults);
    const passesThreshold = this.checkThreshold(judgeResults);
    const errorCategories = this.extractErrorCategories(judgeResults);

    const evaluation: QuestionEvaluation = {
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
  async evaluateBatch(
    questions: GeneratedQuestion[],
    dimensions?: EvaluationDimension[]
  ): Promise<QuestionEvaluation[]> {
    const subagents = Math.max(
      1,
      parseInt(
        process.env.EVALUATION_CONCURRENCY ||
          process.env.PREAM_SUBAGENTS ||
          '1',
        10
      )
    );
    const limit = pLimit(subagents);

    return Promise.all(
      questions.map((question) => limit(() => this.evaluate(question, dimensions)))
    );
  }

  /**
   * Calculate aggregate score from individual judge results
   * Uses weighted average based on dimension importance
   */
  private calculateAggregateScore(results: MicroJudgeResult[]): number {
    const weights: Record<EvaluationDimension, number> = {
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
  private checkThreshold(results: MicroJudgeResult[]): boolean {
    // Critical dimensions that must pass
    const criticalDimensions: EvaluationDimension[] = [
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
    const avgScore =
      results.reduce((sum, r) => sum + r.ssrScore.expectedValue, 0) / results.length;

    return avgScore >= SSR_CONFIG.acceptableThreshold;
  }

  /**
   * Extract error categories from failed evaluations
   */
  private extractErrorCategories(results: MicroJudgeResult[]): string[] {
    const categories: string[] = [];

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
  async saveEvaluation(
    evaluation: QuestionEvaluation,
    topic: TopicPath
  ): Promise<string> {
    const evalDir = getEvaluationDir(topic);
    ensureDirectoryExists(evalDir);

    const filename = `eval_${evaluation.questionId}_${Date.now()}.json`;
    const filepath = path.join(evalDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(evaluation, null, 2));

    return filepath;
  }

  /**
   * Load evaluations for a topic
   */
  loadEvaluations(topic: TopicPath): QuestionEvaluation[] {
    const evalDir = getEvaluationDir(topic);

    if (!fs.existsSync(evalDir)) {
      return [];
    }

    const files = fs.readdirSync(evalDir).filter((f) => f.endsWith('.json'));
    const evaluations: QuestionEvaluation[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(evalDir, file), 'utf-8');
      evaluations.push(JSON.parse(content));
    }

    return evaluations;
  }

  /**
   * Get evaluation statistics for a topic
   */
  getEvaluationStats(evaluations: QuestionEvaluation[]): {
    total: number;
    passed: number;
    passRate: number;
    avgScore: number;
    byDimension: Record<string, { avgScore: number; passRate: number }>;
    errorCategoryFrequency: Record<string, number>;
  } {
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
    const avgScore =
      evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;

    // By dimension stats
    const dimensionScores: Record<string, number[]> = {};
    const dimensionVerdicts: Record<string, boolean[]> = {};

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

    const byDimension: Record<string, { avgScore: number; passRate: number }> = {};
    for (const [dim, scores] of Object.entries(dimensionScores)) {
      const verdicts = dimensionVerdicts[dim];
      byDimension[dim] = {
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        passRate: verdicts.filter(Boolean).length / verdicts.length,
      };
    }

    // Error category frequency
    const errorCategoryFrequency: Record<string, number> = {};
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

/**
 * Create evaluator with default configuration
 */
export function createEvaluator(): QuestionEvaluator {
  return new QuestionEvaluator();
}
