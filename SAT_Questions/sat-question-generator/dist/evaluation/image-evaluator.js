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
exports.ImageEvaluator = void 0;
exports.createImageEvaluator = createImageEvaluator;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const fs = __importStar(require("fs"));
const config_1 = require("../core/config");
const anchors_1 = require("../judges/anchors");
/**
 * Image Evaluator
 * Evaluates generated images for SAT math questions using Claude's vision capabilities
 */
class ImageEvaluator {
    anthropic;
    constructor(anthropicApiKey) {
        this.anthropic = new sdk_1.default({ apiKey: anthropicApiKey });
    }
    /**
     * Evaluate an image for a math question
     */
    async evaluateImage(question, image) {
        // Read image file
        const imageContent = await this.loadImageContent(image.path);
        if (!imageContent) {
            return this.createFailedResult('Could not load image file');
        }
        // Get visual evaluation from Claude
        const textualEvaluation = await this.getVisualEvaluation(question, imageContent, image);
        // Convert evaluation to SSR score using semantic comparison
        const ssrResult = await this.computeSSRScore(textualEvaluation);
        const verdict = ssrResult.expectedValue >= config_1.SSR_CONFIG.acceptableThreshold
            ? 'acceptable'
            : 'unacceptable';
        let suggestedImprovement = null;
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
    async loadImageContent(imagePath) {
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
        const mediaTypes = {
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
    async getVisualEvaluation(question, imageContent, image) {
        const systemPrompt = `You are an expert SAT question reviewer evaluating images for math questions.

Evaluate the image quality based on:
1. Accuracy - Does the image correctly represent the mathematical content?
2. Clarity - Is the image clear and easy to understand?
3. Labels - Are all necessary elements properly labeled?
4. Style - Does it match professional SAT test formatting?
5. Usefulness - Does it effectively support the question?

Provide a detailed evaluation describing the image's strengths and weaknesses.`;
        let content;
        if (imageContent.type === 'base64') {
            content = [
                {
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: imageContent.mediaType,
                        data: imageContent.content,
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
        }
        else {
            // For SVG/text content
            content = `Evaluate this SVG/diagram for the following SAT math question:

**Question:** ${question.stem}

**Image Description (intended):** ${image.description}

**Topic:** ${question.topic.subtopic}

**Image Content:**
\`\`\`
${imageContent.content}
\`\`\`

Provide your detailed evaluation of how well this visual content supports the question:`;
        }
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.evaluation.model,
            max_tokens: config_1.MODEL_CONFIG.evaluation.maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content }],
        });
        const textBlock = response.content.find((block) => block.type === 'text');
        return textBlock ? textBlock.text : '';
    }
    /**
     * Compute SSR score from textual evaluation using Claude
     */
    async computeSSRScore(textualEvaluation) {
        const anchorSet = (0, anchors_1.getAnchorSet)('image_quality');
        // Use Claude to compare evaluation to anchors
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.evaluation.model,
            max_tokens: 256,
            system: `You are a semantic similarity scorer. Given an evaluation and 5 anchor statements (1=worst, 5=best), output similarity scores as JSON: {"1": 0.1, "2": 0.2, "3": 0.3, "4": 0.25, "5": 0.15}. Scores must sum to 1.0.`,
            messages: [
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
        const textBlock = response.content.find((block) => block.type === 'text');
        let pmf = { 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.2 };
        if (textBlock) {
            try {
                const jsonMatch = textBlock.text.match(/\{[^}]+\}/);
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
            }
            catch (e) {
                console.error('Failed to parse similarity scores:', e);
            }
        }
        // Calculate expected value
        let expectedValue = 0;
        for (const level of [1, 2, 3, 4, 5]) {
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
    async extractImprovement(evaluation) {
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.evaluation.model,
            max_tokens: 512,
            system: 'Extract specific, actionable improvements for an SAT question image based on the evaluation. Be concise.',
            messages: [
                {
                    role: 'user',
                    content: `Evaluation:\n${evaluation}\n\nProvide 2-3 specific improvements:`,
                },
            ],
        });
        const textBlock = response.content.find((block) => block.type === 'text');
        return textBlock ? textBlock.text : '';
    }
    /**
     * Create a failed result
     */
    createFailedResult(reason) {
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
    async evaluateBatch(questionsWithImages) {
        const results = new Map();
        for (const { question, image } of questionsWithImages) {
            try {
                const result = await this.evaluateImage(question, image);
                results.set(question.id, result);
                console.log(`Evaluated image for ${question.id}: ${result.verdict} (${result.ssrScore.expectedValue.toFixed(1)})`);
            }
            catch (error) {
                console.error(`Failed to evaluate image for ${question.id}: ${error}`);
                results.set(question.id, this.createFailedResult(String(error)));
            }
        }
        return results;
    }
}
exports.ImageEvaluator = ImageEvaluator;
/**
 * Create image evaluator from environment
 */
function createImageEvaluator() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
        throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    return new ImageEvaluator(anthropicKey);
}
//# sourceMappingURL=image-evaluator.js.map