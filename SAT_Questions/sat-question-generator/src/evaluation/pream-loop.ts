import * as fs from 'fs';
import * as path from 'path';
import type OpenAI from 'openai';
import type {
  TopicPath,
  PREAMConfig,
  PREAMState,
  PREAMIteration,
  GeneratedQuestion,
  QuestionEvaluation,
  PromptVersion,
  MicroJudgeResult,
  RepairCategory,
} from '../core/types';
import {
  DEFAULT_PREAM_CONFIG,
  MODEL_CONFIG,
  getPromptDir,
  getPromptPath,
  ensureDirectoryExists,
} from '../core/config';
import { createGLMClient, extractText, resolveLLMApiKey } from '../core/glm-client';
import { QuestionEvaluator, createEvaluator } from './evaluator';
import { QuestionRepairer, createRepairer } from './repair';

/**
 * PREAM (Prompt Refinement with Evaluations by Automated Micro-judges) Loop
 * Implements the closed-loop prompt optimization algorithm from the PREAM paper.
 */
export class PREAMLoop {
  private client: OpenAI;
  private evaluator: QuestionEvaluator;
  private repairer: QuestionRepairer | null;
  private config: PREAMConfig;

  constructor(
    apiKey: string,
    config?: Partial<PREAMConfig>,
    evaluator?: QuestionEvaluator
  ) {
    this.client = createGLMClient(apiKey);
    this.evaluator = evaluator || createEvaluator();
    this.config = { ...DEFAULT_PREAM_CONFIG, ...config };
    this.repairer = this.config.repairEnabled ? new QuestionRepairer(apiKey) : null;
  }

  /**
   * Run a single PREAM iteration (for round-robin orchestration)
   * Loads existing state, runs one iteration, saves state, and returns
   */
  async runSingleIteration(
    topic: TopicPath,
    generateQuestions: (
      topic: TopicPath,
      promptVersion: string,
      count: number
    ) => Promise<GeneratedQuestion[]>
  ): Promise<{ iterationNumber: number; newVersion: string; converged: boolean; testScore: number; improvement: number }> {
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
    } else {
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

    // Always use the latest version (not best) so each iteration builds on the last
    const latestVersion = state.iterations.length > 0
      ? state.iterations[state.iterations.length - 1].newPromptVersion
      : state.currentBestVersion;

    // Run the iteration
    const iteration = await this.runIteration(
      topic,
      latestVersion,
      iterationNum,
      generateQuestions
    );

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
    } else {
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
  async optimize(
    topic: TopicPath,
    generateQuestions: (
      topic: TopicPath,
      promptVersion: string,
      count: number
    ) => Promise<GeneratedQuestion[]>
  ): Promise<PREAMState> {
    const state: PREAMState = {
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
    let latestVersion = '1.0.0';

    for (let i = 0; i < this.config.maxIterations && !state.converged; i++) {
      console.log(`\n=== PREAM Iteration ${i + 1} for ${topic.subtopic} ===`);

    const iteration = await this.runIteration(
      topic,
      latestVersion,
      i + 1,
      generateQuestions
    );

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
      } else {
        console.log(`Score did not improve over best (${state.bestTestScore.toFixed(3)}). Keeping best version: ${state.currentBestVersion}`);
      }

      // Check for convergence (score plateau/decrease compared to previous iteration)
      if (i > 0 && improvement < this.config.convergenceThreshold) {
        console.log(`Convergence threshold reached. Final best version: ${state.currentBestVersion} with score: ${state.bestTestScore.toFixed(3)}`);
        state.converged = true;
      }

      previousTestScore = iteration.testMetrics.avgScore;
      latestVersion = iteration.newPromptVersion;

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
  private async runIteration(
    topic: TopicPath,
    currentVersion: string,
    iterationNum: number,
    generateQuestions: (
      topic: TopicPath,
      promptVersion: string,
      count: number
    ) => Promise<GeneratedQuestion[]>
  ): Promise<PREAMIteration> {
    // 1. Generate samples using current prompt
    const totalSamples = this.config.minSamplesPerIteration;
    const trainSize = Math.floor(totalSamples * this.config.trainTestSplit);
    const testSize = totalSamples - trainSize;

    console.log(`Generating ${totalSamples} samples (${trainSize} train, ${testSize} test)...`);
    const allQuestions = await generateQuestions(topic, currentVersion, totalSamples);
    const coverageSummary = this.buildCoverageSummary(allQuestions);

    // 2. REPAIR STEP — fix math errors, schema issues, vague rationales before judging
    let repairStats: { totalAttempted: number; totalRepaired: number; issueBreakdown: Record<RepairCategory, number> } | undefined;

    if (this.repairer) {
      console.log(`Repairing ${allQuestions.length} questions (max ${this.config.maxRepairAttempts} pass${this.config.maxRepairAttempts > 1 ? 'es' : ''})...`);

      let questionsToRepair = allQuestions;
      let cumulativeStats: typeof repairStats = {
        totalAttempted: allQuestions.length,
        totalRepaired: 0,
        issueBreakdown: {} as Record<RepairCategory, number>,
      };

      for (let pass = 0; pass < this.config.maxRepairAttempts; pass++) {
        const { questions: repaired, stats } = await this.repairer.repairBatch(questionsToRepair, topic);
        questionsToRepair = repaired;

        cumulativeStats.totalRepaired += stats.totalRepaired;
        for (const [cat, count] of Object.entries(stats.issueBreakdown)) {
          const key = cat as RepairCategory;
          cumulativeStats.issueBreakdown[key] = (cumulativeStats.issueBreakdown[key] || 0) + count;
        }

        console.log(`  Pass ${pass + 1}: ${stats.totalRepaired}/${stats.totalAttempted} questions repaired`);
        if (stats.totalRepaired === 0) break; // no more issues to fix
      }

      // Replace original questions with repaired versions
      for (let i = 0; i < allQuestions.length; i++) {
        allQuestions[i] = questionsToRepair[i];
      }
      repairStats = cumulativeStats;

      const breakdown = Object.entries(cumulativeStats.issueBreakdown)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      console.log(`Repair complete. ${cumulativeStats.totalRepaired} fixed. Issues: ${breakdown || 'none'}`);
    }

    // 3. Split into train/test
    const trainQuestions = allQuestions.slice(0, trainSize);
    const testQuestions = allQuestions.slice(trainSize);

    // 4. Evaluate train set
    console.log('Evaluating training set...');
    const trainEvaluations = await this.evaluator.evaluateBatch(trainQuestions);

    // 5. Evaluate test set
    console.log('Evaluating test set...');
    const testEvaluations = await this.evaluator.evaluateBatch(testQuestions);

    // 6. Categorize errors from train set
    console.log('Categorizing errors...');
    const errorCategories = await this.categorizeErrors(trainEvaluations);

    // 7. Generate improved prompt using meta-prompting
    console.log('Generating improved prompt...');
    const currentPrompt = this.loadPrompt(topic, currentVersion);
    const improvedPrompt = await this.improvePrompt(
      currentPrompt,
      errorCategories,
      trainEvaluations,
      coverageSummary
    );

    // 8. Calculate new version
    const newVersion = this.incrementVersion(currentVersion);

    // 9. Save new prompt version
    await this.savePromptVersion(topic, newVersion, improvedPrompt, iterationNum);

    // 10. Build iteration result
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
      repairStats,
    };
  }

  /**
   * Categorize errors from evaluations
   */
  private async categorizeErrors(
    evaluations: QuestionEvaluation[]
  ): Promise<Array<{ category: string; frequency: number; exampleErrors: string[] }>> {
    // Collect all error explanations
    const errorExplanations: Array<{ dimension: string; explanation: string }> = [];

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
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: `You are analyzing evaluation feedback for SAT question generation.
Categorize the errors into ${this.config.errorCategoryCount} distinct categories.
For each category, provide:
1. A short category name (snake_case)
2. How many errors fall into this category
3. 2-3 example error descriptions

Output as JSON array:
[{"category": "...", "frequency": N, "exampleErrors": ["...", "..."]}]`,
        },
        {
          role: 'user',
          content: `Categorize these ${errorExplanations.length} errors:\n\n${errorExplanations
            .map((e, i) => `${i + 1}. [${e.dimension}] ${e.explanation}`)
            .join('\n\n')}`,
        },
      ],
    });

    const text = extractText(response);
    if (!text) return [];

    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse error categories:', e);
    }

    return [];
  }

  /**
   * Generate improved prompt using meta-prompting
   */
  private async improvePrompt(
    currentPrompt: string,
    errorCategories: Array<{ category: string; frequency: number; exampleErrors: string[] }>,
    evaluations: QuestionEvaluation[],
    coverageSummary: string
  ): Promise<string> {
    // Collect successful examples for reference
    const successfulExamples = evaluations
      .filter((e) => e.passesThreshold)
      .slice(0, 3);

    const failedExamples = evaluations
      .filter((e) => !e.passesThreshold)
      .slice(0, 3);

    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.generation.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: `You are an expert prompt engineer optimizing SAT question generation prompts.
Your task is to improve the given prompt based on error analysis.

Guidelines:
1. Keep the core structure and format requirements
2. Add specific instructions to address identified error patterns
3. Include examples where helpful
4. Make the prompt more precise and unambiguous
5. Don't make the prompt excessively long

Output ONLY the improved prompt text, nothing else.`,
        },
        {
          role: 'user',
          content: `Current prompt:
\`\`\`
${currentPrompt}
\`\`\`

Error categories identified (in order of frequency):
${errorCategories
  .map(
    (c) =>
      `- ${c.category} (${c.frequency} occurrences):\n  Examples: ${c.exampleErrors.slice(0, 2).join('; ')}`
  )
  .join('\n')}

\nQuestion coverage summary for this iteration (use to increase variety):\n${coverageSummary}

${failedExamples.length > 0 ? `\nCommon issues in failed questions:\n${failedExamples
  .map((e) => `- ${e.errorCategories.join(', ')}`)
  .join('\n')}` : ''}

Please improve this prompt to address these issues while maintaining its effectiveness for questions that already pass.`,
        },
      ],
    });

    return extractText(response) || currentPrompt;
  }

  /**
   * Calculate metrics from evaluations
   */
  private calculateMetrics(evaluations: QuestionEvaluation[]): {
    avgScore: number;
    passRate: number;
  } {
    if (evaluations.length === 0) {
      return { avgScore: 0, passRate: 0 };
    }

    const avgScore =
      evaluations.reduce((sum, e) => sum + e.aggregateScore, 0) / evaluations.length;
    const passRate =
      evaluations.filter((e) => e.passesThreshold).length / evaluations.length;

    return { avgScore, passRate };
  }

  /**
   * Load prompt from file
   */
  private loadPrompt(topic: TopicPath, version: string): string {
    const promptPath = getPromptPath(topic, version);

    if (!fs.existsSync(promptPath)) {
      // Return default prompt if version doesn't exist
      return this.getDefaultPrompt(topic);
    }

    return fs.readFileSync(promptPath, 'utf-8');
  }

  /**
   * Get default prompt for a topic
   */
  private getDefaultPrompt(topic: TopicPath): string {
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
  private async savePromptVersion(
    topic: TopicPath,
    version: string,
    content: string,
    iteration: number
  ): Promise<void> {
    const promptDir = getPromptDir(topic);
    ensureDirectoryExists(promptDir);

    const promptPath = getPromptPath(topic, version);
    fs.writeFileSync(promptPath, content);

    // Update improvement log
    const logPath = path.join(promptDir, 'improvement_log.json');
    let log: PromptVersion[] = [];

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
  private async saveState(state: PREAMState): Promise<void> {
    const promptDir = getPromptDir(state.topic);
    ensureDirectoryExists(promptDir);

    const statePath = path.join(promptDir, 'pream_state.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Load PREAM state from file
   */
  loadState(topic: TopicPath): PREAMState | null {
    const promptDir = getPromptDir(topic);
    const statePath = path.join(promptDir, 'pream_state.json');

    if (!fs.existsSync(statePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  }

  /**
   * Increment version (semver minor bump)
   */
  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor + 1}.${patch}`;
  }

  /**
   * Decrement version
   */
  private decrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${Math.max(0, minor - 1)}.${patch}`;
  }

  /**
   * Summarize improvement made
   */
  private summarizeImprovement(
    errorCategories: Array<{ category: string; frequency: number; exampleErrors: string[] }>
  ): string {
    if (errorCategories.length === 0) {
      return 'No significant errors found';
    }

    const topCategories = errorCategories
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map((c) => c.category);

    return `Addressed: ${topCategories.join(', ')}`;
  }

  /**
   * Build a lightweight coverage summary to encourage diversity
   */
  private buildCoverageSummary(questions: GeneratedQuestion[]): string {
    const blueprintCounts: Record<string, number> = {};
    const difficultyCounts: Record<number, number> = {};

    for (const q of questions) {
      const bp = q.metadata.blueprintId || 'unknown';
      blueprintCounts[bp] = (blueprintCounts[bp] || 0) + 1;
      const level = Math.round(q.difficulty.overall);
      difficultyCounts[level] = (difficultyCounts[level] || 0) + 1;
    }

    const blueprintSummary = Object.entries(blueprintCounts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const difficultySummary = Object.entries(difficultyCounts)
      .map(([k, v]) => `L${k}: ${v}`)
      .join(', ');

    return `Blueprint distribution: ${blueprintSummary || 'n/a'}; Difficulty mix: ${difficultySummary || 'n/a'}`;
  }
}

/**
 * Create PREAM loop with environment variables
 */
export function createPREAMLoop(config?: Partial<PREAMConfig>): PREAMLoop {
  const apiKey = resolveLLMApiKey();
  return new PREAMLoop(apiKey, config);
}
