import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ImageGenerationRequest,
  GeneratedImage,
  MathQuestion,
  ReadingQuestion,
  GeneratedQuestion,
  TopicPath,
} from '../core/types';
import { v4 as uuidv4 } from 'uuid';
import { getGeneratedDir, ensureDirectoryExists } from '../core/config';

/**
 * Image Generator using Google's Gemini 2.0 Flash (Nano Banana)
 * Generates images for SAT math questions that require visual elements.
 *
 * Key principle: Keep prompts CONCISE. Nano Banana tends to over-detail
 * when given verbose instructions. Simple, direct prompts work best.
 */
export class ImageGenerator {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-2.0-flash-exp'; // Nano Banana

  constructor(googleApiKey: string) {
    this.genAI = new GoogleGenerativeAI(googleApiKey);
  }

  /**
   * Generate an image for a math question
   */
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent output
        maxOutputTokens: 1024, // Limit output to prevent over-detail
      },
    });

    // Build CONCISE prompt - key to avoiding verbose output
    const prompt = this.buildConcisePrompt(request);

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const text = response.text();

      const imagePath = await this.saveImage(request.questionId, text, request.type);

      return {
        id: uuidv4(),
        questionId: request.questionId,
        path: imagePath,
        description: request.description,
        generatedAt: new Date().toISOString(),
        evaluationScore: null,
      };
    } catch (error) {
      console.error(`Failed to generate image: ${error}`);
      throw error;
    }
  }

  /**
   * Build a CONCISE prompt for image generation
   * Key: Nano Banana works best with short, direct instructions
   */
  private buildConcisePrompt(request: ImageGenerationRequest): string {
    // Type-specific minimal instructions
    const typeHints: Record<string, string> = {
      graph: 'coordinate plane with labeled axes',
      geometry: 'geometric figure with labeled vertices',
      chart: 'simple data chart',
      diagram: 'clear diagram',
      table: 'data table',
    };

    const hint = typeHints[request.type] || 'diagram';

    // Keep it SHORT - Nano Banana over-details with long prompts
    return `Generate SVG: ${hint}.
${request.description}
${request.specifications.elements ? `Include: ${request.specifications.elements.join(', ')}` : ''}
Size: ${request.specifications.width || 400}x${request.specifications.height || 300}
Output only SVG code.`;
  }

  /**
   * Save generated image to disk
   */
  private async saveImage(
    questionId: string,
    content: string,
    type: string
  ): Promise<string> {
    const imagesDir = path.join(__dirname, '../../generated/images');
    ensureDirectoryExists(imagesDir);

    // Extract SVG if present, otherwise save raw content
    let fileContent = content;
    let extension = 'txt';

    // Try to extract SVG from response
    const svgMatch = content.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      fileContent = svgMatch[0];
      extension = 'svg';
    } else if (content.includes('<?xml') && content.includes('<svg')) {
      // Handle XML-prefixed SVG
      const fullSvgMatch = content.match(/<\?xml[\s\S]*<\/svg>/i);
      if (fullSvgMatch) {
        fileContent = fullSvgMatch[0];
        extension = 'svg';
      }
    }

    const filename = `${questionId}_${type}.${extension}`;
    const filepath = path.join(imagesDir, filename);
    fs.writeFileSync(filepath, fileContent);

    return filepath;
  }

  /**
   * Generate images for all questions that need them (both Math and Reading)
   * Batches requests to avoid rate limiting
   */
  async generateImagesForQuestions(
    questions: GeneratedQuestion[],
    concurrency: number = 3
  ): Promise<Map<string, GeneratedImage>> {
    const results = new Map<string, GeneratedImage>();

    // Filter questions that need images (works for both Math and Reading)
    const needsImage = questions.filter((q) => {
      const hasImageFlag = 'hasImage' in q && q.hasImage;
      const hasDescription = 'imageDescription' in q && q.imageDescription;
      return hasImageFlag && hasDescription;
    });

    console.log(`Generating images for ${needsImage.length} questions...`);

    // Process in batches
    for (let i = 0; i < needsImage.length; i += concurrency) {
      const batch = needsImage.slice(i, i + concurrency);

      const batchResults = await Promise.allSettled(
        batch.map(async (question) => {
          const imageDesc = 'imageDescription' in question ? question.imageDescription : '';
          const image = await this.generateImage({
            questionId: question.id,
            description: imageDesc!,
            type: this.inferImageType(question),
            specifications: {
              width: 400,
              height: 300,
            },
          });
          return { questionId: question.id, image };
        })
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.set(result.value.questionId, result.value.image);
          console.log(`  Generated image for ${result.value.questionId}`);
        } else {
          console.error(`  Failed: ${result.reason}`);
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + concurrency < needsImage.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return results;
  }

  /**
   * Infer image type from question topic and description
   * Works for both Math and Reading questions
   */
  private inferImageType(question: GeneratedQuestion): ImageGenerationRequest['type'] {
    const description = ('imageDescription' in question ? question.imageDescription || '' : '').toLowerCase();
    const subtopic = question.topic.subtopic;
    const section = question.topic.section;

    // Reading section - usually charts, graphs, or tables accompanying passages
    if (section === 'READING') {
      if (description.includes('table') || description.includes('data')) return 'table';
      if (description.includes('graph') || description.includes('plot') || description.includes('trend')) return 'graph';
      if (description.includes('chart') || description.includes('bar') || description.includes('pie')) return 'chart';
      if (description.includes('diagram') || description.includes('figure')) return 'diagram';
      // Default for reading with images is usually a chart or table
      return 'chart';
    }

    // Math section - Geometry topics
    if (['area_volume', 'lines_angles', 'triangles', 'circles', 'right_triangles'].includes(subtopic)) {
      return 'geometry';
    }

    // Function/graphing topics
    if (['linear_functions', 'nonlinear_functions', 'two_variable_data'].includes(subtopic)) {
      return 'graph';
    }

    // Data topics
    if (['data_distributions', 'probability', 'inference', 'evaluating_claims'].includes(subtopic)) {
      if (description.includes('table')) return 'table';
      return 'chart';
    }

    // Fallback based on description
    if (description.includes('graph') || description.includes('plot')) return 'graph';
    if (description.includes('chart') || description.includes('bar') || description.includes('pie')) return 'chart';
    if (description.includes('table')) return 'table';
    if (description.includes('triangle') || description.includes('circle') || description.includes('angle')) return 'geometry';

    return 'diagram';
  }

  /**
   * Update a question with its generated image path
   */
  updateQuestionWithImage<T extends GeneratedQuestion>(question: T, image: GeneratedImage): T {
    return {
      ...question,
      imagePath: image.path,
    };
  }
}

/**
 * Create image generator from environment
 */
export function createImageGenerator(): ImageGenerator {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GOOGLE_API_KEY environment variable');
  }

  return new ImageGenerator(apiKey);
}
