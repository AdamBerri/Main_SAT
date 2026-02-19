import type OpenAI from 'openai';
import * as fs from 'fs';
import type {
  GeneratedImage,
  MathQuestion,
  SSRResult,
  MicroJudgeResult,
} from '../core/types';
import { MODEL_CONFIG, SSR_CONFIG } from '../core/config';
import { createGLMClient, extractText, resolveLLMApiKey } from '../core/glm-client';
import { SSRRater, createSSRRater } from '../judges/ssr-rater';
import { getAnchorSet } from '../judges/anchors';

/**
 * Image Evaluator
 * Evaluates generated images for SAT math questions using Claude's vision capabilities
 */
export class ImageEvaluator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = createGLMClient(apiKey);
  }

  /**
   * Evaluate an image for a math question
   */
  async evaluateImage(
    question: MathQuestion,
    image: GeneratedImage
  ): Promise<MicroJudgeResult> {
    // Read image file
    const imageContent = await this.loadImageContent(image.path);

    if (!imageContent) {
      return this.createFailedResult('Could not load image file');
    }

    // Get visual evaluation from Claude
    const textualEvaluation = await this.getVisualEvaluation(
      question,
      imageContent,
      image
    );

    // Convert evaluation to SSR score using semantic comparison
    const ssrResult = await this.computeSSRScore(textualEvaluation);

    const verdict: 'acceptable' | 'unacceptable' =
      ssrResult.expectedValue >= SSR_CONFIG.acceptableThreshold
        ? 'acceptable'
        : 'unacceptable';

    let suggestedImprovement: string | null = null;
    if (verdict === 'unacceptable') {
      suggestedImprovement = await this.extractImprovement(textualEvaluation);
    }

    return {
      dimension: 'image_quality',
      verdict,
      ssrScore: ssrResult,
      explanation: textualEvaluation,
      suggestedImprovement,
    };
  }

  /**
   * Load image content for Claude vision
   */
  private async loadImageContent(
    imagePath: string
  ): Promise<{ type: 'base64' | 'text'; content: string; mediaType?: string } | null> {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    const extension = imagePath.split('.').pop()?.toLowerCase();

    if (extension === 'svg' || extension === 'txt') {
      // For SVG/text, read as text
      const content = fs.readFileSync(imagePath, 'utf-8');
      return { type: 'text', content };
    }

    // For raster images, read as base64
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');

    const mediaTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    return {
      type: 'base64',
      content: base64,
      mediaType: mediaTypes[extension || ''] || 'image/png',
    };
  }

  /**
   * Get visual evaluation from Claude
   */
  private async getVisualEvaluation(
    question: MathQuestion,
    imageContent: { type: 'base64' | 'text'; content: string; mediaType?: string },
    image: GeneratedImage
  ): Promise<string> {
    const systemPrompt = `You are an expert SAT question reviewer evaluating images for math questions.

Evaluate the image quality based on:
1. Accuracy - Does the image correctly represent the mathematical content?
2. Clarity - Is the image clear and easy to understand?
3. Labels - Are all necessary elements properly labeled?
4. Style - Does it match professional SAT test formatting?
5. Usefulness - Does it effectively support the question?

Provide a detailed evaluation describing the image's strengths and weaknesses.`;

    let userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[];

    if (imageContent.type === 'base64') {
      userContent = [
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageContent.mediaType || 'image/png'};base64,${imageContent.content}`,
          },
        },
        {
          type: 'text',
          text: `Evaluate this image for the following SAT math question:

**Question:** ${question.stem}

**Image Description (intended):** ${image.description}

**Topic:** ${question.topic.subtopic}

Provide your detailed evaluation of the image quality:`,
        },
      ];
    } else {
      // For SVG/text content
      userContent = [
        {
          type: 'text',
          text: `Evaluate this SVG/diagram for the following SAT math question:

**Question:** ${question.stem}

**Image Description (intended):** ${image.description}

**Topic:** ${question.topic.subtopic}

**Image Content:**
\`\`\`
${imageContent.content}
\`\`\`

Provide your detailed evaluation of how well this visual content supports the question:`,
        },
      ];
    }

    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: MODEL_CONFIG.evaluation.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return extractText(response);
  }

  /**
   * Compute SSR score from textual evaluation using Claude
   */
  private async computeSSRScore(textualEvaluation: string): Promise<SSRResult> {
    const anchorSet = getAnchorSet('image_quality');

    // Use GLM-5 to compare evaluation to anchors
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: 256,
      messages: [
        {
          role: 'system',
          content: `You are a semantic similarity scorer. Given an evaluation and 5 anchor statements (1=worst, 5=best), output similarity scores as JSON: {"1": 0.1, "2": 0.2, "3": 0.3, "4": 0.25, "5": 0.15}. Scores must sum to 1.0.`,
        },
        {
          role: 'user',
          content: `Evaluation: "${textualEvaluation}"

Anchors:
1: "${anchorSet.anchors[1]}"
2: "${anchorSet.anchors[2]}"
3: "${anchorSet.anchors[3]}"
4: "${anchorSet.anchors[4]}"
5: "${anchorSet.anchors[5]}"

Output JSON:`,
        },
      ],
    });

    const text = extractText(response);
    let pmf: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.2 };

    if (text) {
      try {
        const jsonMatch = text.match(/\{[^}]+\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          pmf = {
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
    }

    // Calculate expected value
    let expectedValue = 0;
    for (const level of [1, 2, 3, 4, 5] as const) {
      expectedValue += level * pmf[level];
    }
    expectedValue = Math.round(expectedValue * 2) / 2;

    return {
      dimension: 'image_quality',
      textualEvaluation,
      pmf,
      expectedValue,
      anchorSetUsed: anchorSet.id,
    };
  }

  /**
   * Extract improvement suggestions
   */
  private async extractImprovement(evaluation: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: MODEL_CONFIG.evaluation.model,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: 'Extract specific, actionable improvements for an SAT question image based on the evaluation. Be concise.',
        },
        {
          role: 'user',
          content: `Evaluation:\n${evaluation}\n\nProvide 2-3 specific improvements:`,
        },
      ],
    });

    return extractText(response);
  }

  /**
   * Create a failed result
   */
  private createFailedResult(reason: string): MicroJudgeResult {
    return {
      dimension: 'image_quality',
      verdict: 'unacceptable',
      ssrScore: {
        dimension: 'image_quality',
        textualEvaluation: reason,
        pmf: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 },
        expectedValue: 1,
        anchorSetUsed: 'image_quality_v1',
      },
      explanation: reason,
      suggestedImprovement: 'Ensure image file exists and is readable',
    };
  }

  /**
   * Evaluate images for multiple questions
   */
  async evaluateBatch(
    questionsWithImages: Array<{ question: MathQuestion; image: GeneratedImage }>
  ): Promise<Map<string, MicroJudgeResult>> {
    const results = new Map<string, MicroJudgeResult>();

    for (const { question, image } of questionsWithImages) {
      try {
        const result = await this.evaluateImage(question, image);
        results.set(question.id, result);
        console.log(
          `Evaluated image for ${question.id}: ${result.verdict} (${result.ssrScore.expectedValue.toFixed(1)})`
        );
      } catch (error) {
        console.error(`Failed to evaluate image for ${question.id}: ${error}`);
        results.set(question.id, this.createFailedResult(String(error)));
      }
    }

    return results;
  }
}

/**
 * Create image evaluator from environment
 */
export function createImageEvaluator(): ImageEvaluator {
  const apiKey = resolveLLMApiKey();
  return new ImageEvaluator(apiKey);
}
