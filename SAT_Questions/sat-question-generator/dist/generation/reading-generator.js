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
exports.ReadingQuestionGenerator = void 0;
exports.createReadingGenerator = createReadingGenerator;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const config_1 = require("../core/config");
const glm_client_1 = require("../core/glm-client");
const reading_templates_1 = require("../prompts/reading-templates");
/**
 * Reading Question Generator
 *
 * Uses TWO-STAGE generation:
 * 1. Generate passage with metadata (paragraph purposes, testable vocab, inferences, etc.)
 * 2. Generate question using passage analysis
 *
 * This ensures questions are tightly coupled to passage content and
 * enables sophisticated distractor generation.
 */
class ReadingQuestionGenerator {
    client;
    constructor(apiKey) {
        this.client = (0, glm_client_1.createGLMClient)(apiKey);
    }
    /**
     * Stage 1: Generate passage with analysis metadata
     */
    async generatePassage(params) {
        const prompt = (0, reading_templates_1.buildPassageGenerationPrompt)(params);
        const response = await this.client.chat.completions.create({
            model: config_1.MODEL_CONFIG.generation.model,
            max_tokens: config_1.MODEL_CONFIG.generation.maxTokens,
            temperature: 0.8, // Higher for creative passage generation
            messages: [{ role: 'user', content: prompt }],
        });
        const responseText = (0, glm_client_1.extractText)(response);
        if (!responseText) {
            throw new Error('No text response from model');
        }
        // Parse JSON response
        const jsonStr = this.extractJSON(responseText);
        try {
            return JSON.parse(jsonStr);
        }
        catch (e) {
            throw new Error(`Failed to parse passage JSON: ${e}\n\nResponse: ${responseText}`);
        }
    }
    /**
     * Stage 2: Generate question from passage analysis
     */
    async generateQuestionFromPassage(topic, passageAnalysis, params) {
        const prompt = (0, reading_templates_1.buildQuestionGenerationPrompt)(topic.subtopic, passageAnalysis, params.distractorStrategies);
        const response = await this.client.chat.completions.create({
            model: config_1.MODEL_CONFIG.generation.model,
            max_tokens: config_1.MODEL_CONFIG.generation.maxTokens,
            temperature: 0.6, // Lower for more consistent question structure
            messages: [{ role: 'user', content: prompt }],
        });
        const responseText = (0, glm_client_1.extractText)(response);
        if (!responseText) {
            throw new Error('No text response from model');
        }
        // Parse question response
        const jsonStr = this.extractJSON(responseText);
        let questionData;
        try {
            questionData = JSON.parse(jsonStr);
        }
        catch (e) {
            throw new Error(`Failed to parse question JSON: ${e}\n\nResponse: ${responseText}`);
        }
        // Build full question object
        const generationId = (0, uuid_1.v4)();
        const question = {
            id: (0, uuid_1.v4)(),
            topic: {
                section: 'READING',
                domain: topic.domain,
                subtopic: topic.subtopic,
            },
            difficulty: {
                overall: this.computeOverallDifficulty(params),
                conceptual: params.inferenceDepth * 5,
                procedural: params.evidenceEvaluation * 5,
                linguistic: params.vocabularyLevel * 5,
            },
            passage: passageAnalysis.passage,
            passageMetadata: {
                genre: this.mapPassageTypeToGenre(params.passageType),
                wordCount: passageAnalysis.passage.split(/\s+/).length,
                source: passageAnalysis.source,
            },
            stem: questionData.questionStem,
            choices: this.buildChoices(questionData.choices, questionData.correctAnswer),
            correctAnswer: questionData.correctAnswer,
            explanation: questionData.explanation,
            distractorRationale: questionData.distractorExplanations || {},
            metadata: {
                generatedAt: new Date().toISOString(),
                promptVersion: '1.0.0',
                modelUsed: config_1.MODEL_CONFIG.generation.model,
                generationId,
            },
        };
        return question;
    }
    /**
     * Full generation: passage + question in two stages
     */
    async generateQuestion(topic, targetDifficulty) {
        // Sample parameters
        const params = (0, reading_templates_1.sampleReadingParams)(topic.subtopic, {
            targetOverallDifficulty: targetDifficulty / 5,
        });
        // Stage 1: Generate passage
        console.log(`  Generating passage (${params.passageType}, ${params.passageLength})...`);
        const passageAnalysis = await this.generatePassage(params);
        // Stage 2: Generate question
        console.log(`  Generating ${topic.subtopic} question...`);
        const question = await this.generateQuestionFromPassage(topic, passageAnalysis, params);
        return question;
    }
    /**
     * Generate batch of questions
     */
    async generateBatch(topic, count) {
        const questions = [];
        const difficulties = this.getDefaultDifficultyDistribution(count);
        for (let i = 0; i < count; i++) {
            try {
                console.log(`Generating question ${i + 1}/${count} for ${topic.subtopic}...`);
                const question = await this.generateQuestion(topic, difficulties[i]);
                questions.push(question);
            }
            catch (e) {
                console.error(`Failed to generate question ${i + 1}: ${e}`);
            }
        }
        return questions;
    }
    /**
     * Generate and save questions
     */
    async generateAndSave(topic, count) {
        const questions = await this.generateBatch(topic, count);
        const outputDir = (0, config_1.getGeneratedDir)(topic);
        (0, config_1.ensureDirectoryExists)(outputDir);
        const paths = [];
        for (const question of questions) {
            const filename = `${question.id}.json`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, JSON.stringify(question, null, 2));
            paths.push(filepath);
        }
        return {
            saved: questions.length,
            failed: count - questions.length,
            paths,
        };
    }
    // ─────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────
    extractJSON(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let jsonStr = jsonMatch ? jsonMatch[0] : text.trim();
        // Sanitize control characters inside string values
        jsonStr = this.sanitizeJSONString(jsonStr);
        return jsonStr;
    }
    /**
     * Sanitize control characters in JSON string values
     */
    sanitizeJSONString(jsonStr) {
        let result = '';
        let i = 0;
        while (i < jsonStr.length) {
            const char = jsonStr[i];
            if (char === '"') {
                result += char;
                i++;
                while (i < jsonStr.length) {
                    const c = jsonStr[i];
                    const code = c.charCodeAt(0);
                    if (c === '\\') {
                        result += c;
                        i++;
                        if (i < jsonStr.length) {
                            result += jsonStr[i];
                            i++;
                        }
                    }
                    else if (c === '"') {
                        result += c;
                        i++;
                        break;
                    }
                    else if (code < 32) {
                        switch (code) {
                            case 9:
                                result += '\\t';
                                break;
                            case 10:
                                result += '\\n';
                                break;
                            case 13:
                                result += '\\r';
                                break;
                            case 8:
                                result += '\\b';
                                break;
                            case 12:
                                result += '\\f';
                                break;
                            default: result += `\\u${code.toString(16).padStart(4, '0')}`;
                        }
                        i++;
                    }
                    else {
                        result += c;
                        i++;
                    }
                }
            }
            else {
                result += char;
                i++;
            }
        }
        return result;
    }
    computeOverallDifficulty(params) {
        const avg = (params.passageComplexity +
            params.inferenceDepth +
            params.vocabularyLevel +
            params.evidenceEvaluation +
            params.synthesisRequired) /
            5;
        return Math.max(1, Math.min(5, Math.round(avg * 5)));
    }
    mapPassageTypeToGenre(passageType) {
        const map = {
            literary_narrative: 'literary',
            social_science: 'informational',
            natural_science: 'scientific',
            humanities: 'argumentative',
        };
        return map[passageType] || 'informational';
    }
    buildChoices(choicesObj, correctAnswer) {
        return ['A', 'B', 'C', 'D'].map((label) => ({
            label,
            text: choicesObj[label] || '',
            isCorrect: label === correctAnswer,
        }));
    }
    getDefaultDifficultyDistribution(count) {
        const distribution = [];
        const weights = { 1: 0.15, 2: 0.2, 3: 0.3, 4: 0.2, 5: 0.15 };
        for (const [level, weight] of Object.entries(weights)) {
            const levelCount = Math.round(count * weight);
            for (let i = 0; i < levelCount; i++) {
                distribution.push(parseInt(level));
            }
        }
        while (distribution.length < count) {
            distribution.push(3);
        }
        // Shuffle
        for (let i = distribution.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
        }
        return distribution.slice(0, count);
    }
}
exports.ReadingQuestionGenerator = ReadingQuestionGenerator;
/**
 * Create reading generator from environment
 */
function createReadingGenerator() {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
        throw new Error('Missing ZHIPU_API_KEY');
    }
    return new ReadingQuestionGenerator(apiKey);
}
//# sourceMappingURL=reading-generator.js.map