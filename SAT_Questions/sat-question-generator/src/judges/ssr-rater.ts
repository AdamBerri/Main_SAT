import type OpenAI from 'openai';
import type {
  EvaluationDimension,
  SSRResult,
  MicroJudgeResult,
  GeneratedQuestion,
  AnchorSet,
} from '../core/types';
import { SSR_CONFIG, MODEL_CONFIG } from '../core/config';
import { createGLMClient, extractText } from '../core/glm-client';
import { getAnchorSet } from './anchors';
import { getElicitationPrompt } from './elicitation-prompts';

/**
 * Semantic Similarity Rating (SSR) based micro-judge system.
 * Uses GLM-5 to convert free-text evaluations to Likert-scale scores
 * by comparing to anchor statements.
 */
export class SSRRater {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = createGLMClient(apiKey);
  }

  /**
   * Use GLM-5 to compute semantic similarity scores between evaluation and anchors
   * Returns a probability distribution over the 5 Likert levels
   */
  private async computeSemanticSimilarity(
    evaluation: string,
    anchorSet: AnchorSet
  ): Promise<Record<1 | 2 | 3 | 4 | 5, number>> {
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: 256,
      messages: [
        {
          role: 'system',
          content: `You are a semantic similarity scorer. Given an evaluation text and 5 anchor statements representing different quality levels (1=worst, 5=best), estimate how similar the evaluation is to each anchor.

Output ONLY a JSON object with similarity scores (0-1) for each level, like:
{"1": 0.1, "2": 0.2, "3": 0.3, "4": 0.25, "5": 0.15}

The scores should sum to 1.0 (they represent a probability distribution).
Consider both the sentiment and specific content when scoring.`,
        },
        {
          role: 'user',
          content: `Evaluation to score:
"${evaluation}"

Anchor statements:
Level 1: "${anchorSet.anchors[1]}"
Level 2: "${anchorSet.anchors[2]}"
Level 3: "${anchorSet.anchors[3]}"
Level 4: "${anchorSet.anchors[4]}"
Level 5: "${anchorSet.anchors[5]}"

Output the similarity distribution as JSON:`,
        },
      ],
    });

    const text = extractText(response);
    if (!text) {
      return { 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.2 }; // Uniform fallback
    }

    try {
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          1: parsed['1'] || 0.2,
          2: parsed['2'] || 0.2,
          3: parsed['3'] || 0.2,
          4: parsed['4'] || 0.2,
          5: parsed['5'] || 0.2,
        };
      }
    } catch (e) {
      console.error('Failed to parse similarity scores:', e);
    }

    return { 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.2 };
  }

  /**
   * Calculate expected value from PMF (gives 0.5 precision naturally)
   */
  private calculateExpectedValue(pmf: Record<1 | 2 | 3 | 4 | 5, number>): number {
    let expectedValue = 0;
    for (const level of [1, 2, 3, 4, 5] as const) {
      expectedValue += level * pmf[level];
    }
    // Round to nearest 0.5
    return Math.round(expectedValue * 2) / 2;
  }

  /**
   * Elicit free-text evaluation from LLM
   */
  private async elicitEvaluation(
    dimension: EvaluationDimension,
    question: GeneratedQuestion,
    context?: Record<string, unknown>
  ): Promise<string> {
    const elicitationPrompt = getElicitationPrompt(dimension);

    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: MODEL_CONFIG.evaluation.maxTokens,
      messages: [
        { role: 'system', content: elicitationPrompt.systemPrompt },
        {
          role: 'user',
          content: elicitationPrompt.buildUserPrompt(question, context),
        },
      ],
    });

    return extractText(response);
  }

  /**
   * Rate a question on a specific dimension using SSR
   */
  async rate(
    dimension: EvaluationDimension,
    question: GeneratedQuestion,
    context?: Record<string, unknown>
  ): Promise<SSRResult> {
    // 1. Get free-text evaluation from LLM
    const textualEvaluation = await this.elicitEvaluation(dimension, question, context);

    // 2. Get anchor set for this dimension
    const anchorSet = getAnchorSet(dimension);

    // 3. Compute semantic similarity PMF using Claude
    const pmf = await this.computeSemanticSimilarity(textualEvaluation, anchorSet);

    // 4. Calculate expected value
    const expectedValue = this.calculateExpectedValue(pmf);

    return {
      dimension,
      textualEvaluation,
      pmf,
      expectedValue,
      anchorSetUsed: anchorSet.id,
    };
  }

  /**
   * Full micro-judge evaluation for a dimension
   */
  async judge(
    dimension: EvaluationDimension,
    question: GeneratedQuestion,
    context?: Record<string, unknown>
  ): Promise<MicroJudgeResult> {
    const ssrResult = await this.rate(dimension, question, context);

    // Determine verdict based on threshold
    const verdict: 'acceptable' | 'unacceptable' =
      ssrResult.expectedValue >= SSR_CONFIG.acceptableThreshold
        ? 'acceptable'
        : 'unacceptable';

    // Extract suggested improvement if unacceptable
    let suggestedImprovement: string | null = null;
    if (verdict === 'unacceptable') {
      suggestedImprovement = await this.extractImprovement(
        dimension,
        question,
        ssrResult.textualEvaluation
      );
    }

    return {
      dimension,
      verdict,
      ssrScore: ssrResult,
      explanation: ssrResult.textualEvaluation,
      suggestedImprovement,
    };
  }

  /**
   * Extract improvement suggestions from evaluation
   */
  private async extractImprovement(
    dimension: EvaluationDimension,
    question: GeneratedQuestion,
    evaluation: string
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `Based on an evaluation of an SAT question for ${dimension}, extract specific, actionable improvements needed. Be concise and specific.`,
        },
        {
          role: 'user',
          content: `Evaluation:\n${evaluation}\n\nProvide 1-3 specific improvements for this ${dimension} issue:`,
        },
      ],
    });

    return extractText(response);
  }

  /**
   * Evaluate a question across all relevant dimensions
   */
  async evaluateQuestion(
    question: GeneratedQuestion,
    dimensions?: EvaluationDimension[]
  ): Promise<MicroJudgeResult[]> {
    // Default dimensions based on question type
    const applicableDimensions = dimensions || this.getApplicableDimensions(question);

    // Run all evaluations in parallel
    const results = await Promise.all(
      applicableDimensions.map((dim) => this.judge(dim, question))
    );

    return results;
  }

  /**
   * Determine which dimensions apply to a question
   */
  private getApplicableDimensions(question: GeneratedQuestion): EvaluationDimension[] {
    const baseDimensions: EvaluationDimension[] = [
      'faithfulness',
      'answer_validity',
      'distractor_quality',
      'difficulty_accuracy',
      'frontend_convertibility',
    ];

    // Add image quality if question has image
    if ('hasImage' in question && question.hasImage) {
      baseDimensions.push('image_quality');
    }

    // Add grammar authenticity for grammar questions
    if (
      question.topic.domain === 'Standard_English_Conventions' ||
      question.topic.subtopic === 'boundaries' ||
      question.topic.subtopic === 'form_structure_sense'
    ) {
      baseDimensions.push('grammar_authenticity');
    }

    return baseDimensions;
  }
}

/**
 * Factory function to create SSR rater with environment variables
 */
export function createSSRRater(): SSRRater {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ZHIPU_API_KEY environment variable.');
  }

  return new SSRRater(apiKey);
}
