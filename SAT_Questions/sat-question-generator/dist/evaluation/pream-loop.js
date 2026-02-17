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
exports.PREAMLoop = void 0;
exports.createPREAMLoop = createPREAMLoop;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../core/config");
const evaluator_1 = require("./evaluator");
/**
 * PREAM (Prompt Refinement with Evaluations by Automated Micro-judges) Loop
 * Implements the closed-loop prompt optimization algorithm from the PREAM paper.
 */
class PREAMLoop {
    anthropic;
    evaluator;
    config;
    constructor(anthropicApiKey, config, evaluator) {
        this.anthropic = new sdk_1.default({ apiKey: anthropicApiKey });
        this.evaluator = evaluator || (0, evaluator_1.createEvaluator)();
        this.config = { ...config_1.DEFAULT_PREAM_CONFIG, ...config };
    }
    /**
     * Run a single PREAM iteration (for round-robin orchestration)
     * Loads existing state, runs one iteration, saves state, and returns
     */
    async runSingleIteration(topic, generateQuestions) {
        // Load existing state or create new
        let state = this.loadState(topic);
        let previousTestScore = 0;
        if (state) {
            // Check if already converged
            if (state.converged) {
                const lastIter = state.iterations[state.iterations.length - 1];
                return {
                    iterationNumber: state.iterations.length,
                    newVersion: state.currentBestVersion,
                    converged: true,
                    testScore: state.bestTestScore || lastIter?.testMetrics.avgScore || 0,
                    improvement: 0,
                };
            }
            // Get previous test score for convergence check
            if (state.iterations.length > 0) {
                previousTestScore = state.iterations[state.iterations.length - 1].testMetrics.avgScore;
            }
            // Initialize bestTestScore if not present (backward compatibility)
            if (state.bestTestScore === undefined) {
                state.bestTestScore = previousTestScore;
            }
        }
        else {
            // Initialize new state
            state = {
                topic,
                config: this.config,
                iterations: [],
                currentBestVersion: '1.0.0',
                bestTestScore: 0,
                converged: false,
                startedAt: new Date().toISOString(),
                completedAt: null,
            };
        }
        const iterationNum = state.iterations.length + 1;
        // Check if max iterations reached
        if (iterationNum > this.config.maxIterations) {
            state.converged = true;
            state.completedAt = new Date().toISOString();
            await this.saveState(state);
            const lastIter = state.iterations[state.iterations.length - 1];
            return {
                iterationNumber: state.iterations.length,
                newVersion: state.currentBestVersion,
                converged: true,
                testScore: lastIter?.testMetrics.avgScore || 0,
                improvement: 0,
            };
        }
        console.log(`\n=== PREAM Iteration ${iterationNum} for ${topic.subtopic} ===`);
        // Run the iteration
        const iteration = await this.runIteration(topic, state.currentBestVersion, iterationNum, generateQuestions);
        state.iterations.push(iteration);
        // Check for convergence - per PrEAM paper Section 4.5:
        // "At convergence, the best-performing prompt is selected for final evaluation"
        const improvement = iteration.testMetrics.avgScore - previousTestScore;
        const improvementOverBest = iteration.testMetrics.avgScore - state.bestTestScore;
        console.log(`Test score: ${iteration.testMetrics.avgScore.toFixed(3)}, Improvement vs prev: ${improvement.toFixed(3)}, vs best: ${improvementOverBest.toFixed(3)}`);
        // Only update best version if this iteration's score is better than the best seen so far
        if (iteration.testMetrics.avgScore > state.bestTestScore) {
            console.log(`New best score! Updating best version from ${state.currentBestVersion} to ${iteration.newPromptVersion}`);
            state.currentBestVersion = iteration.newPromptVersion;
            state.bestTestScore = iteration.testMetrics.avgScore;
        }
        else {
            console.log(`Score did not improve over best (${state.bestTestScore.toFixed(3)}). Keeping best version: ${state.currentBestVersion}`);
        }
        // Check for convergence (score plateau/decrease compared to previous iteration)
        if (iterationNum > 1 && improvement < this.config.convergenceThreshold) {
            console.log(`Convergence threshold reached. Final best version: ${state.currentBestVersion} with score: ${state.bestTestScore.toFixed(3)}`);
            state.converged = true;
            state.completedAt = new Date().toISOString();
        }
        // Save state
        await this.saveState(state);
        return {
            iterationNumber: iterationNum,
            newVersion: iteration.newPromptVersion,
            converged: state.converged,
            testScore: iteration.testMetrics.avgScore,
            improvement,
        };
    }
    /**
     * Run the PREAM optimization loop for a topic
     */
    async optimize(topic, generateQuestions) {
        const state = {
            topic,
            config: this.config,
            iterations: [],
            currentBestVersion: '1.0.0',
            bestTestScore: 0,
            converged: false,
            startedAt: new Date().toISOString(),
            completedAt: null,
        };
        let previousTestScore = 0;
        for (let i = 0; i < this.config.maxIterations && !state.converged; i++) {
            console.log(`\n=== PREAM Iteration ${i + 1} for ${topic.subtopic} ===`);
            const iteration = await this.runIteration(topic, state.currentBestVersion, i + 1, generateQuestions);
            state.iterations.push(iteration);
            // Check for convergence - per PrEAM paper Section 4.5:
            // "At convergence, the best-performing prompt is selected for final evaluation"
            const improvement = iteration.testMetrics.avgScore - previousTestScore;
            const improvementOverBest = iteration.testMetrics.avgScore - state.bestTestScore;
            console.log(`Test score: ${iteration.testMetrics.avgScore.toFixed(3)}, Improvement vs prev: ${improvement.toFixed(3)}, vs best: ${improvementOverBest.toFixed(3)}`);
            // Only update best version if this iteration's score is better than the best seen so far
            if (iteration.testMetrics.avgScore > state.bestTestScore) {
                console.log(`New best score! Updating best version from ${state.currentBestVersion} to ${iteration.newPromptVersion}`);
                state.currentBestVersion = iteration.newPromptVersion;
                state.bestTestScore = iteration.testMetrics.avgScore;
            }
            else {
                console.log(`Score did not improve over best (${state.bestTestScore.toFixed(3)}). Keeping best version: ${state.currentBestVersion}`);
            }
            // Check for convergence (score plateau/decrease compared to previous iteration)
            if (i > 0 && improvement < this.config.convergenceThreshold) {
                console.log(`Convergence threshold reached. Final best version: ${state.currentBestVersion} with score: ${state.bestTestScore.toFixed(3)}`);
                state.converged = true;
            }
            previousTestScore = iteration.testMetrics.avgScore;
            // Save state after each iteration
            await this.saveState(state);
        }
        state.completedAt = new Date().toISOString();
        await this.saveState(state);
        return state;
    }
    /**
     * Run a single PREAM iteration
     */
    async runIteration(topic, currentVersion, iterationNum, generateQuestions) {
        // 1. Generate samples using current prompt
        const totalSamples = this.config.minSamplesPerIteration;
        const trainSize = Math.floor(totalSamples * this.config.trainTestSplit);
        const testSize = totalSamples - trainSize;
        console.log(`Generating ${totalSamples} samples (${trainSize} train, ${testSize} test)...`);
        const allQuestions = await generateQuestions(topic, currentVersion, totalSamples);
        // 2. Split into train/test
        const trainQuestions = allQuestions.slice(0, trainSize);
        const testQuestions = allQuestions.slice(trainSize);
        // 3. Evaluate train set
        console.log('Evaluating training set...');
        const trainEvaluations = await this.evaluator.evaluateBatch(trainQuestions);
        // 4. Evaluate test set
        console.log('Evaluating test set...');
        const testEvaluations = await this.evaluator.evaluateBatch(testQuestions);
        // 5. Categorize errors from train set
        console.log('Categorizing errors...');
        const errorCategories = await this.categorizeErrors(trainEvaluations);
        // 6. Generate improved prompt using meta-prompting
        console.log('Generating improved prompt...');
        const currentPrompt = this.loadPrompt(topic, currentVersion);
        const improvedPrompt = await this.improvePrompt(currentPrompt, errorCategories, trainEvaluations);
        // 7. Calculate new version
        const newVersion = this.incrementVersion(currentVersion);
        // 8. Save new prompt version
        await this.savePromptVersion(topic, newVersion, improvedPrompt, iterationNum);
        // 9. Build iteration result
        const trainMetrics = this.calculateMetrics(trainEvaluations);
        const testMetrics = this.calculateMetrics(testEvaluations);
        return {
            iteration: iterationNum,
            promptVersionUsed: currentVersion,
            trainSetSize: trainSize,
            testSetSize: testSize,
            trainMetrics: {
                avgScore: trainMetrics.avgScore,
                passRate: trainMetrics.passRate,
                errorCategories,
            },
            testMetrics: {
                avgScore: testMetrics.avgScore,
                passRate: testMetrics.passRate,
            },
            improvementMade: this.summarizeImprovement(errorCategories),
            newPromptVersion: newVersion,
        };
    }
    /**
     * Categorize errors from evaluations
     */
    async categorizeErrors(evaluations) {
        // Collect all error explanations
        const errorExplanations = [];
        for (const evaluation of evaluations) {
            for (const result of evaluation.judgeResults) {
                if (result.verdict === 'unacceptable') {
                    errorExplanations.push({
                        dimension: result.dimension,
                        explanation: result.explanation,
                    });
                }
            }
        }
        if (errorExplanations.length === 0) {
            return [];
        }
        // Use LLM to categorize errors
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.evaluation.model,
            max_tokens: 2048,
            system: `You are analyzing evaluation feedback for SAT question generation.
Categorize the errors into ${this.config.errorCategoryCount} distinct categories.
For each category, provide:
1. A short category name (snake_case)
2. How many errors fall into this category
3. 2-3 example error descriptions

Output as JSON array:
[{"category": "...", "frequency": N, "exampleErrors": ["...", "..."]}]`,
            messages: [
                {
                    role: 'user',
                    content: `Categorize these ${errorExplanations.length} errors:\n\n${errorExplanations
                        .map((e, i) => `${i + 1}. [${e.dimension}] ${e.explanation}`)
                        .join('\n\n')}`,
                },
            ],
        });
        const textBlock = response.content.find((block) => block.type === 'text');
        if (!textBlock)
            return [];
        try {
            // Extract JSON from response
            const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (e) {
            console.error('Failed to parse error categories:', e);
        }
        return [];
    }
    /**
     * Generate improved prompt using meta-prompting
     */
    async improvePrompt(currentPrompt, errorCategories, evaluations) {
        // Collect successful examples for reference
        const successfulExamples = evaluations
            .filter((e) => e.passesThreshold)
            .slice(0, 3);
        const failedExamples = evaluations
            .filter((e) => !e.passesThreshold)
            .slice(0, 3);
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.generation.model,
            max_tokens: 4096,
            system: `You are an expert prompt engineer optimizing SAT question generation prompts.
Your task is to improve the given prompt based on error analysis.

Guidelines:
1. Keep the core structure and format requirements
2. Add specific instructions to address identified error patterns
3. Include examples where helpful
4. Make the prompt more precise and unambiguous
5. Don't make the prompt excessively long

Output ONLY the improved prompt text, nothing else.`,
            messages: [
                {
                    role: 'user',
                    content: `Current prompt:
\`\`\`
${currentPrompt}
\`\`\`

Error categories identified (in order of frequency):
${errorCategories
                        .map((c) => `- ${c.category} (${c.frequency} occurrences):\n  Examples: ${c.exampleErrors.slice(0, 2).join('; ')}`)
                        .join('\n')}

${failedExamples.length > 0 ? `\nCommon issues in failed questions:\n${failedExamples
                        .map((e) => `- ${e.errorCategories.join(', ')}`)
                        .join('\n')}` : ''}

Please improve this prompt to address these issues while maintaining its effectiveness for questions that already pass.`,
                },
            ],
        });
        const textBlock = response.content.find((block) => block.type === 'text');
        return textBlock ? textBlock.text : currentPrompt;
    }
    /**
     * Calculate metrics from evaluations
     */
    calculateMetrics(evaluations) {
        if (evaluations.length === 0) {
            return { avgScore: 0, passRate: 0 };
        }
        const avgScore = evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;
        const passRate = evaluations.filter((e) => e.passesThreshold).length / evaluations.length;
        return { avgScore, passRate };
    }
    /**
     * Load prompt from file
     */
    loadPrompt(topic, version) {
        const promptPath = (0, config_1.getPromptPath)(topic, version);
        if (!fs.existsSync(promptPath)) {
            // Return default prompt if version doesn't exist
            return this.getDefaultPrompt(topic);
        }
        return fs.readFileSync(promptPath, 'utf-8');
    }
    /**
     * Get default prompt for a topic
     */
    getDefaultPrompt(topic) {
        return `Generate an SAT ${topic.section} question for the topic: ${topic.subtopic}.

The question should:
1. Follow official SAT format and style
2. Have exactly 4 answer choices (A, B, C, D)
3. Have one unambiguously correct answer
4. Include well-crafted distractors that represent common misconceptions
5. Match the specified difficulty level

Output as valid JSON matching the provided schema.`;
    }
    /**
     * Save prompt version to file
     */
    async savePromptVersion(topic, version, content, iteration) {
        const promptDir = (0, config_1.getPromptDir)(topic);
        (0, config_1.ensureDirectoryExists)(promptDir);
        const promptPath = (0, config_1.getPromptPath)(topic, version);
        fs.writeFileSync(promptPath, content);
        // Update improvement log
        const logPath = path.join(promptDir, 'improvement_log.json');
        let log = [];
        if (fs.existsSync(logPath)) {
            log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        }
        log.push({
            version,
            content,
            createdAt: new Date().toISOString(),
            parentVersion: version === '1.0.0' ? null : this.decrementVersion(version),
            preamIteration: iteration,
            performanceMetrics: null, // Will be updated after evaluation
        });
        fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
    }
    /**
     * Save PREAM state to file
     */
    async saveState(state) {
        const promptDir = (0, config_1.getPromptDir)(state.topic);
        (0, config_1.ensureDirectoryExists)(promptDir);
        const statePath = path.join(promptDir, 'pream_state.json');
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    }
    /**
     * Load PREAM state from file
     */
    loadState(topic) {
        const promptDir = (0, config_1.getPromptDir)(topic);
        const statePath = path.join(promptDir, 'pream_state.json');
        if (!fs.existsSync(statePath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    /**
     * Increment version (semver minor bump)
     */
    incrementVersion(version) {
        const [major, minor, patch] = version.split('.').map(Number);
        return `${major}.${minor + 1}.${patch}`;
    }
    /**
     * Decrement version
     */
    decrementVersion(version) {
        const [major, minor, patch] = version.split('.').map(Number);
        return `${major}.${Math.max(0, minor - 1)}.${patch}`;
    }
    /**
     * Summarize improvement made
     */
    summarizeImprovement(errorCategories) {
        if (errorCategories.length === 0) {
            return 'No significant errors found';
        }
        const topCategories = errorCategories
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 3)
            .map((c) => c.category);
        return `Addressed: ${topCategories.join(', ')}`;
    }
}
exports.PREAMLoop = PREAMLoop;
/**
 * Create PREAM loop with environment variables
 */
function createPREAMLoop(config) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    return new PREAMLoop(apiKey, config);
}
//# sourceMappingURL=pream-loop.js.map