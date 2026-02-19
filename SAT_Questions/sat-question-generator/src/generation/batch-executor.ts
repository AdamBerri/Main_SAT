import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import type {
  TopicPath,
  BatchConfig,
  BatchResult,
  APIKeyConfig,
  GeneratedQuestion,
  DifficultyLevel,
} from '../core/types';
import { QuestionGenerator } from './generator';
import { QuestionEvaluator, createEvaluator } from '../evaluation/evaluator';
import { getAllTopics, topicToString, getGeneratedDir, ensureDirectoryExists } from '../core/config';
import { resolveLLMApiKey } from '../core/glm-client';

/**
 * API Key Pool Manager
 * Manages multiple Zhipu API keys with rate limiting
 */
export class APIKeyPool {
  private keys: APIKeyConfig[];
  private currentIndex: number = 0;

  constructor(apiKeys: string[]) {
    this.keys = [];

    for (const key of apiKeys) {
      this.keys.push({
        provider: 'zhipu',
        key,
        rateLimit: 50, // requests per minute
        currentUsage: 0,
        resetAt: Date.now() + 60000,
      });
    }
  }

  /**
   * Get next available API key
   */
  getKey(): string {
    if (this.keys.length === 0) {
      throw new Error('No API keys available');
    }

    // Reset counters if needed
    const now = Date.now();
    for (const key of this.keys) {
      if (now >= key.resetAt) {
        key.currentUsage = 0;
        key.resetAt = now + 60000;
      }
    }

    // Find key with capacity
    for (const key of this.keys) {
      if (key.currentUsage < key.rateLimit) {
        key.currentUsage++;
        return key.key;
      }
    }

    // All keys at capacity - use round robin
    const key = this.keys[this.currentIndex % this.keys.length];
    this.currentIndex++;
    key.currentUsage++;
    return key.key;
  }

  /**
   * Get count of available keys
   */
  get keyCount(): number {
    return this.keys.length;
  }
}

/**
 * Batch Executor
 * Runs question generation and evaluation in parallel with multiple API keys.
 * Organizes generated questions by topic in the file system.
 */
export class BatchExecutor {
  private keyPool: APIKeyPool;
  private concurrency: number;

  constructor(apiKeys: string[], concurrency: number = 5) {
    this.keyPool = new APIKeyPool(apiKeys);
    this.concurrency = concurrency;
  }

  /**
   * Execute batch generation for multiple topics
   * Questions are saved organized by topic: generated/SECTION/DOMAIN/SUBTOPIC/
   */
  async executeBatch(config: BatchConfig): Promise<BatchResult> {
    const startTime = new Date().toISOString();
    const limit = pLimit(config.concurrency || this.concurrency);

    const results: BatchResult = {
      batchId: config.batchId,
      startedAt: startTime,
      completedAt: '',
      totalGenerated: 0,
      totalPassed: 0,
      byTopic: {},
      errors: [],
    };

    console.log(`\nStarting batch ${config.batchId}`);
    console.log(`Topics: ${config.topics.length}, Questions per topic: ${config.questionsPerTopic}`);
    console.log(`Concurrency: ${config.concurrency || this.concurrency}, API keys: ${this.keyPool.keyCount}`);

    // Create tasks for each topic
    const tasks = config.topics.map((topic) =>
      limit(async () => {
        const topicKey = topicToString(topic);
        console.log(`\n[${topicKey}] Starting generation...`);

        try {
          const { generated, passed, avgScore, savedPaths } = await this.processTopicBatch(
            topic,
            config.questionsPerTopic
          );

          results.byTopic[topicKey] = { generated, passed, avgScore };
          results.totalGenerated += generated;
          results.totalPassed += passed;

          console.log(
            `[${topicKey}] Complete: ${generated} generated, ${passed} passed (${(avgScore * 100).toFixed(1)}% avg)`
          );
          console.log(`[${topicKey}] Saved to: ${savedPaths[0]?.split('/').slice(0, -1).join('/') || 'N/A'}`);
        } catch (error) {
          results.errors.push({
            topic: topicKey,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          });
          console.error(`[${topicKey}] Error: ${error}`);
        }
      })
    );

    // Wait for all tasks
    await Promise.all(tasks);

    results.completedAt = new Date().toISOString();

    // Print summary
    console.log('\n========== BATCH COMPLETE ==========');
    console.log(`Total generated: ${results.totalGenerated}`);
    console.log(`Total passed: ${results.totalPassed}`);
    console.log(`Pass rate: ${results.totalGenerated > 0 ? ((results.totalPassed / results.totalGenerated) * 100).toFixed(1) : 0}%`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Duration: ${this.calculateDuration(results.startedAt, results.completedAt)}`);

    // Save batch results
    await this.saveBatchResults(results);

    return results;
  }

  /**
   * Process a single topic batch
   * Saves questions to: generated/SECTION/DOMAIN/SUBTOPIC/
   */
  private async processTopicBatch(
    topic: TopicPath,
    count: number
  ): Promise<{ generated: number; passed: number; avgScore: number; savedPaths: string[] }> {
    // Get API key and create generator
    const apiKey = this.keyPool.getKey();
    const generator = new QuestionGenerator(apiKey);
    const evaluator = createEvaluator();

    // Generate questions
    const questions = await generator.generateBatch(topic, count);

    if (questions.length === 0) {
      return { generated: 0, passed: 0, avgScore: 0, savedPaths: [] };
    }

    // Evaluate questions
    const evaluations = await evaluator.evaluateBatch(questions);

    // Calculate stats
    const passed = evaluations.filter((e) => e.passesThreshold).length;
    const avgScore =
      evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;

    // Save ALL questions organized by topic (with evaluation status in filename)
    const savedPaths = await this.saveQuestionsByTopic(topic, questions, evaluations);

    return {
      generated: questions.length,
      passed,
      avgScore,
      savedPaths,
    };
  }

  /**
   * Save questions organized by topic
   * Directory structure: generated/SECTION/DOMAIN/SUBTOPIC/
   * Filename includes pass/fail status
   */
  private async saveQuestionsByTopic(
    topic: TopicPath,
    questions: GeneratedQuestion[],
    evaluations: { questionId: string; passesThreshold: boolean; aggregateScore: number }[]
  ): Promise<string[]> {
    const topicDir = getGeneratedDir(topic);
    ensureDirectoryExists(topicDir);

    const savedPaths: string[] = [];

    for (const question of questions) {
      const evaluation = evaluations.find((e) => e.questionId === question.id);
      const status = evaluation?.passesThreshold ? 'pass' : 'fail';
      const score = evaluation?.aggregateScore.toFixed(2) || '0.00';

      // Filename: {id}_{status}_{score}.json
      const filename = `${question.id}_${status}_${score}.json`;
      const filepath = path.join(topicDir, filename);

      // Include evaluation summary in saved question
      const questionWithEval = {
        ...question,
        _evaluation: {
          status,
          score: evaluation?.aggregateScore || 0,
          evaluatedAt: new Date().toISOString(),
        },
      };

      fs.writeFileSync(filepath, JSON.stringify(questionWithEval, null, 2));
      savedPaths.push(filepath);
    }

    return savedPaths;
  }

  /**
   * Save batch results summary
   */
  private async saveBatchResults(results: BatchResult): Promise<void> {
    const resultsDir = path.join(__dirname, '../../generated/batch_results');
    ensureDirectoryExists(resultsDir);

    const filename = `${results.batchId}.json`;
    const filepath = path.join(resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`Batch results saved to: ${filepath}`);
  }

  /**
   * Calculate duration between two ISO timestamps
   */
  private calculateDuration(start: string, end: string): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Run batch for all topics
   */
  async executeAllTopics(questionsPerTopic: number): Promise<BatchResult> {
    const topics = getAllTopics();

    return this.executeBatch({
      batchId: `batch_all_${Date.now()}`,
      topics,
      questionsPerTopic,
      concurrency: this.concurrency,
      apiKeys: [],
    });
  }

  /**
   * Run batch for a specific section
   */
  async executeSection(
    section: 'READING' | 'MATH',
    questionsPerTopic: number
  ): Promise<BatchResult> {
    const topics = getAllTopics().filter((t) => t.section === section);

    return this.executeBatch({
      batchId: `batch_${section}_${Date.now()}`,
      topics,
      questionsPerTopic,
      concurrency: this.concurrency,
      apiKeys: [],
    });
  }

  /**
   * Run batch for specific topics
   */
  async executeTopics(
    topics: TopicPath[],
    questionsPerTopic: number
  ): Promise<BatchResult> {
    return this.executeBatch({
      batchId: `batch_custom_${Date.now()}`,
      topics,
      questionsPerTopic,
      concurrency: this.concurrency,
      apiKeys: [],
    });
  }
}

/**
 * Create batch executor from environment variables
 */
export function createBatchExecutor(concurrency?: number): BatchExecutor {
  const apiKeys: string[] = [];

  // Primary key
  if (process.env.ZHIPU_API_KEY) {
    apiKeys.push(process.env.ZHIPU_API_KEY);
  }

  // Additional keys (ZHIPU_API_KEY_2, ZHIPU_API_KEY_3, etc.)
  for (let i = 2; i <= 10; i++) {
    const key = process.env[`ZHIPU_API_KEY_${i}`];
    if (key) apiKeys.push(key);
  }

  // Alternative env name for custom/local backends
  if (apiKeys.length === 0 && process.env.LLM_API_KEY) {
    apiKeys.push(process.env.LLM_API_KEY);
  }

  // Keyless local backend (OpenAI-compatible server on RunPod, vLLM, MiniMax, etc.)
  if (apiKeys.length === 0) {
    apiKeys.push(resolveLLMApiKey());
  }

  if (apiKeys.length === 0) {
    throw new Error('No API key or local LLM backend configured');
  }

  console.log(`Batch executor initialized with ${apiKeys.length} API key(s)`);

  return new BatchExecutor(apiKeys, concurrency);
}
