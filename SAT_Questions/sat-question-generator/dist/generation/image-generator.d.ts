import type { ImageGenerationRequest, GeneratedImage, GeneratedQuestion } from '../core/types';
/**
 * Image Generator using Google's Gemini 2.0 Flash (Nano Banana)
 * Generates images for SAT math questions that require visual elements.
 *
 * Key principle: Keep prompts CONCISE. Nano Banana tends to over-detail
 * when given verbose instructions. Simple, direct prompts work best.
 */
export declare class ImageGenerator {
    private genAI;
    private model;
    constructor(googleApiKey: string);
    /**
     * Generate an image for a math question
     */
    generateImage(request: ImageGenerationRequest): Promise<GeneratedImage>;
    /**
     * Build a CONCISE prompt for image generation
     * Key: Nano Banana works best with short, direct instructions
     */
    private buildConcisePrompt;
    /**
     * Save generated image to disk
     */
    private saveImage;
    /**
     * Generate images for all questions that need them (both Math and Reading)
     * Batches requests to avoid rate limiting
     */
    generateImagesForQuestions(questions: GeneratedQuestion[], concurrency?: number): Promise<Map<string, GeneratedImage>>;
    /**
     * Infer image type from question topic and description
     * Works for both Math and Reading questions
     */
    private inferImageType;
    /**
     * Update a question with its generated image path
     */
    updateQuestionWithImage<T extends GeneratedQuestion>(question: T, image: GeneratedImage): T;
}
/**
 * Create image generator from environment
 */
export declare function createImageGenerator(): ImageGenerator;
//# sourceMappingURL=image-generator.d.ts.map