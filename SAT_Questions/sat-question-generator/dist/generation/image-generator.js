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
exports.ImageGenerator = void 0;
exports.createImageGenerator = createImageGenerator;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const generative_ai_1 = require("@google/generative-ai");
const uuid_1 = require("uuid");
const config_1 = require("../core/config");
/**
 * Image Generator using Google's Gemini 2.0 Flash (Nano Banana)
 * Generates images for SAT math questions that require visual elements.
 *
 * Key principle: Keep prompts CONCISE. Nano Banana tends to over-detail
 * when given verbose instructions. Simple, direct prompts work best.
 */
class ImageGenerator {
    genAI;
    model = 'gemini-2.0-flash-exp'; // Nano Banana
    constructor(googleApiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(googleApiKey);
    }
    /**
     * Generate an image for a math question
     */
    async generateImage(request) {
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
                id: (0, uuid_1.v4)(),
                questionId: request.questionId,
                path: imagePath,
                description: request.description,
                generatedAt: new Date().toISOString(),
                evaluationScore: null,
            };
        }
        catch (error) {
            console.error(`Failed to generate image: ${error}`);
            throw error;
        }
    }
    /**
     * Build a CONCISE prompt for image generation
     * Key: Nano Banana works best with short, direct instructions
     */
    buildConcisePrompt(request) {
        // Type-specific minimal instructions
        const typeHints = {
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
    async saveImage(questionId, content, type) {
        const imagesDir = path.join(__dirname, '../../generated/images');
        (0, config_1.ensureDirectoryExists)(imagesDir);
        // Extract SVG if present, otherwise save raw content
        let fileContent = content;
        let extension = 'txt';
        // Try to extract SVG from response
        const svgMatch = content.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch) {
            fileContent = svgMatch[0];
            extension = 'svg';
        }
        else if (content.includes('<?xml') && content.includes('<svg')) {
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
    async generateImagesForQuestions(questions, concurrency = 3) {
        const results = new Map();
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
            const batchResults = await Promise.allSettled(batch.map(async (question) => {
                const imageDesc = 'imageDescription' in question ? question.imageDescription : '';
                const image = await this.generateImage({
                    questionId: question.id,
                    description: imageDesc,
                    type: this.inferImageType(question),
                    specifications: {
                        width: 400,
                        height: 300,
                    },
                });
                return { questionId: question.id, image };
            }));
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.set(result.value.questionId, result.value.image);
                    console.log(`  Generated image for ${result.value.questionId}`);
                }
                else {
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
    inferImageType(question) {
        const description = ('imageDescription' in question ? question.imageDescription || '' : '').toLowerCase();
        const subtopic = question.topic.subtopic;
        const section = question.topic.section;
        // Reading section - usually charts, graphs, or tables accompanying passages
        if (section === 'READING') {
            if (description.includes('table') || description.includes('data'))
                return 'table';
            if (description.includes('graph') || description.includes('plot') || description.includes('trend'))
                return 'graph';
            if (description.includes('chart') || description.includes('bar') || description.includes('pie'))
                return 'chart';
            if (description.includes('diagram') || description.includes('figure'))
                return 'diagram';
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
            if (description.includes('table'))
                return 'table';
            return 'chart';
        }
        // Fallback based on description
        if (description.includes('graph') || description.includes('plot'))
            return 'graph';
        if (description.includes('chart') || description.includes('bar') || description.includes('pie'))
            return 'chart';
        if (description.includes('table'))
            return 'table';
        if (description.includes('triangle') || description.includes('circle') || description.includes('angle'))
            return 'geometry';
        return 'diagram';
    }
    /**
     * Update a question with its generated image path
     */
    updateQuestionWithImage(question, image) {
        return {
            ...question,
            imagePath: image.path,
        };
    }
}
exports.ImageGenerator = ImageGenerator;
/**
 * Create image generator from environment
 */
function createImageGenerator() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('Missing GOOGLE_API_KEY environment variable');
    }
    return new ImageGenerator(apiKey);
}
//# sourceMappingURL=image-generator.js.map