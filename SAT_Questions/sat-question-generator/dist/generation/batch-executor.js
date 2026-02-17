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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchExecutor = exports.APIKeyPool = void 0;
exports.createBatchExecutor = createBatchExecutor;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const p_limit_1 = __importDefault(require("p-limit"));
const generator_1 = require("./generator");
const evaluator_1 = require("../evaluation/evaluator");
const config_1 = require("../core/config");
/**
 * API Key Pool Manager
 * Manages multiple Anthropic API keys with rate limiting
 */
class APIKeyPool {
    keys;
    currentIndex = 0;
    constructor(anthropicKeys) {
        this.keys = [];
        for (const key of anthropicKeys) {
            this.keys.push({
                provider: 'anthropic',
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
    getKey() {
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
    get keyCount() {
        return this.keys.length;
    }
}
exports.APIKeyPool = APIKeyPool;
/**
 * Batch Executor
 * Runs question generation and evaluation in parallel with multiple API keys.
 * Organizes generated questions by topic in the file system.
 */
class BatchExecutor {
    keyPool;
    concurrency;
    constructor(anthropicKeys, concurrency = 5) {
        this.keyPool = new APIKeyPool(anthropicKeys);
        this.concurrency = concurrency;
    }
    /**
     * Execute batch generation for multiple topics
     * Questions are saved organized by topic: generated/SECTION/DOMAIN/SUBTOPIC/
     */
    async executeBatch(config) {
        const startTime = new Date().toISOString();
        const limit = (0, p_limit_1.default)(config.concurrency || this.concurrency);
        const results = {
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
        const tasks = config.topics.map((topic) => limit(async () => {
            const topicKey = (0, config_1.topicToString)(topic);
            console.log(`\n[${topicKey}] Starting generation...`);
            try {
                const { generated, passed, avgScore, savedPaths } = await this.processTopicBatch(topic, config.questionsPerTopic);
                results.byTopic[topicKey] = { generated, passed, avgScore };
                results.totalGenerated += generated;
                results.totalPassed += passed;
                console.log(`[${topicKey}] Complete: ${generated} generated, ${passed} passed (${(avgScore * 100).toFixed(1)}% avg)`);
                console.log(`[${topicKey}] Saved to: ${savedPaths[0]?.split('/').slice(0, -1).join('/') || 'N/A'}`);
            }
            catch (error) {
                results.errors.push({
                    topic: topicKey,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString(),
                });
                console.error(`[${topicKey}] Error: ${error}`);
            }
        }));
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
    async processTopicBatch(topic, count) {
        // Get API key and create generator
        const apiKey = this.keyPool.getKey();
        const generator = new generator_1.QuestionGenerator(apiKey);
        const evaluator = (0, evaluator_1.createEvaluator)();
        // Generate questions
        const questions = await generator.generateBatch(topic, count);
        if (questions.length === 0) {
            return { generated: 0, passed: 0, avgScore: 0, savedPaths: [] };
        }
        // Evaluate questions
        const evaluations = await evaluator.evaluateBatch(questions);
        // Calculate stats
        const passed = evaluations.filter((e) => e.passesThreshold).length;
        const avgScore = evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;
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
    async saveQuestionsByTopic(topic, questions, evaluations) {
        const topicDir = (0, config_1.getGeneratedDir)(topic);
        (0, config_1.ensureDirectoryExists)(topicDir);
        const savedPaths = [];
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
    async saveBatchResults(results) {
        const resultsDir = path.join(__dirname, '../../generated/batch_results');
        (0, config_1.ensureDirectoryExists)(resultsDir);
        const filename = `${results.batchId}.json`;
        const filepath = path.join(resultsDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
        console.log(`Batch results saved to: ${filepath}`);
    }
    /**
     * Calculate duration between two ISO timestamps
     */
    calculateDuration(start, end) {
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    }
    /**
     * Run batch for all topics
     */
    async executeAllTopics(questionsPerTopic) {
        const topics = (0, config_1.getAllTopics)();
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
    async executeSection(section, questionsPerTopic) {
        const topics = (0, config_1.getAllTopics)().filter((t) => t.section === section);
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
    async executeTopics(topics, questionsPerTopic) {
        return this.executeBatch({
            batchId: `batch_custom_${Date.now()}`,
            topics,
            questionsPerTopic,
            concurrency: this.concurrency,
            apiKeys: [],
        });
    }
}
exports.BatchExecutor = BatchExecutor;
/**
 * Create batch executor from environment variables
 */
function createBatchExecutor(concurrency) {
    const anthropicKeys = [];
    // Primary key
    if (process.env.ANTHROPIC_API_KEY) {
        anthropicKeys.push(process.env.ANTHROPIC_API_KEY);
    }
    // Additional keys (ANTHROPIC_API_KEY_2, ANTHROPIC_API_KEY_3, etc.)
    for (let i = 2; i <= 10; i++) {
        const key = process.env[`ANTHROPIC_API_KEY_${i}`];
        if (key)
            anthropicKeys.push(key);
    }
    if (anthropicKeys.length === 0) {
        throw new Error('No ANTHROPIC_API_KEY found in environment');
    }
    console.log(`Batch executor initialized with ${anthropicKeys.length} API key(s)`);
    return new BatchExecutor(anthropicKeys, concurrency);
}
//# sourceMappingURL=batch-executor.js.map