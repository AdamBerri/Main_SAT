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
exports.QuestionGenerator = void 0;
exports.createGenerator = createGenerator;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../core/config");
const prompt_manager_1 = require("../prompts/prompt-manager");
const schema_validator_1 = require("../schemas/schema-validator");
/**
 * SAT Question Generator
 * Generates questions using Claude with versioned prompts and difficulty sampling
 */
class QuestionGenerator {
    anthropic;
    promptManager = (0, prompt_manager_1.getPromptManager)();
    constructor(anthropicApiKey) {
        this.anthropic = new sdk_1.default({ apiKey: anthropicApiKey });
    }
    /**
     * Sample difficulty parameters with variation
     */
    sampleDifficulty(targetLevel, variation = 0.3, isReading = false) {
        // Add Gaussian noise to create variation
        const sample = (base) => {
            const noise = (Math.random() - 0.5) * 2 * variation;
            return Math.max(1, Math.min(5, base + noise));
        };
        return {
            overall: targetLevel,
            conceptual: sample(targetLevel),
            procedural: sample(targetLevel),
            linguistic: isReading ? sample(targetLevel) : 0,
            computational: isReading ? 0 : sample(targetLevel),
        };
    }
    /**
     * Generate a single question
     */
    async generateQuestion(topic, targetDifficulty, promptVersion) {
        const generationId = (0, uuid_1.v4)();
        const isReading = topic.section === 'READING';
        // Sample difficulty with variation
        const tempConfig = this.promptManager.getTemperatureConfig(topic);
        const difficulty = this.sampleDifficulty(targetDifficulty, tempConfig.variation, isReading);
        // Get prompt
        const { system, user } = this.promptManager.buildGenerationPrompt(topic, difficulty, promptVersion);
        // Get schema for output format
        const schema = (0, schema_validator_1.getSchemaContent)(topic.section);
        const schemaInstruction = `\n\nOutput your response as valid JSON matching this schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\nIMPORTANT: Output ONLY the JSON object, no additional text. Ensure all string values are properly escaped - use \\n for newlines, \\t for tabs.`;
        // Generate
        const response = await this.anthropic.messages.create({
            model: config_1.MODEL_CONFIG.generation.model,
            max_tokens: config_1.MODEL_CONFIG.generation.maxTokens,
            temperature: tempConfig.generation,
            system: system + schemaInstruction,
            messages: [{ role: 'user', content: user }],
        });
        const textBlock = response.content.find((block) => block.type === 'text');
        if (!textBlock) {
            throw new Error('No text response from model');
        }
        // Parse JSON response with sanitization for control characters
        const jsonStr = this.extractJSON(textBlock.text);
        let rawQuestion;
        try {
            rawQuestion = JSON.parse(jsonStr);
        }
        catch (e) {
            throw new Error(`Failed to parse JSON response: ${e}`);
        }
        // Add metadata if not present
        rawQuestion.id = rawQuestion.id || (0, uuid_1.v4)();
        rawQuestion.metadata = {
            generatedAt: new Date().toISOString(),
            promptVersion: promptVersion || this.promptManager.getPromptConfig(topic).currentVersion,
            modelUsed: config_1.MODEL_CONFIG.generation.model,
            generationId,
        };
        // Ensure topic is set correctly
        rawQuestion.topic = {
            section: topic.section,
            domain: topic.domain,
            subtopic: topic.subtopic,
        };
        // Validate
        const validation = (0, schema_validator_1.fullValidation)(rawQuestion, topic);
        if (!validation.valid) {
            const errors = [
                ...(validation.schemaErrors || []),
                ...(validation.deepErrors || []),
            ];
            throw new Error(`Generated question failed validation:\n${errors.join('\n')}`);
        }
        return validation.question;
    }
    /**
     * Generate multiple questions for a topic
     */
    async generateBatch(topic, count, promptVersion, difficultyDistribution) {
        const questions = [];
        // Default to uniform distribution across difficulty levels
        const difficulties = difficultyDistribution || this.getDefaultDifficultyDistribution(count);
        for (let i = 0; i < count; i++) {
            const difficulty = difficulties[i % difficulties.length];
            try {
                const question = await this.generateQuestion(topic, difficulty, promptVersion);
                questions.push(question);
                console.log(`Generated question ${i + 1}/${count} for ${topic.subtopic}`);
            }
            catch (e) {
                console.error(`Failed to generate question ${i + 1}/${count}: ${e}`);
                // Continue with remaining questions
            }
        }
        return questions;
    }
    /**
     * Generate and save questions
     */
    async generateAndSave(topic, count, promptVersion) {
        const questions = await this.generateBatch(topic, count, promptVersion);
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
    /**
     * Load generated questions for a topic
     */
    loadGeneratedQuestions(topic) {
        const dir = (0, config_1.getGeneratedDir)(topic);
        if (!fs.existsSync(dir)) {
            return [];
        }
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
        const questions = [];
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(dir, file), 'utf-8');
                const question = JSON.parse(content);
                questions.push(question);
            }
            catch (e) {
                console.error(`Failed to load question from ${file}: ${e}`);
            }
        }
        return questions;
    }
    /**
     * Default difficulty distribution for batch generation
     */
    getDefaultDifficultyDistribution(count) {
        // Roughly follows SAT distribution: more medium, fewer extremes
        const distribution = [];
        const weights = { 1: 0.15, 2: 0.20, 3: 0.30, 4: 0.20, 5: 0.15 };
        for (const [level, weight] of Object.entries(weights)) {
            const levelCount = Math.round(count * weight);
            for (let i = 0; i < levelCount; i++) {
                distribution.push(parseInt(level));
            }
        }
        // Fill any remaining slots with medium difficulty
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
    /**
     * Extract JSON from a potentially wrapped response
     */
    extractJSON(text) {
        // Try to find JSON object in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let jsonStr = jsonMatch ? jsonMatch[0] : text.trim();
        // Sanitize control characters inside string values
        // This fixes "Bad control character in string literal" errors
        jsonStr = this.sanitizeJSONString(jsonStr);
        return jsonStr;
    }
    /**
     * Sanitize control characters in JSON string values
     * Handles newlines, tabs, and other control chars that break JSON.parse
     */
    sanitizeJSONString(jsonStr) {
        // More robust approach: process string segment by segment
        // This handles edge cases better than a simple state machine
        let result = '';
        let i = 0;
        while (i < jsonStr.length) {
            const char = jsonStr[i];
            if (char === '"') {
                // Start of a string - find the end
                result += char;
                i++;
                while (i < jsonStr.length) {
                    const c = jsonStr[i];
                    const code = c.charCodeAt(0);
                    if (c === '\\') {
                        // Escape sequence - copy both chars
                        result += c;
                        i++;
                        if (i < jsonStr.length) {
                            result += jsonStr[i];
                            i++;
                        }
                    }
                    else if (c === '"') {
                        // End of string
                        result += c;
                        i++;
                        break;
                    }
                    else if (code < 32) {
                        // Control character - escape it
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
                // Outside string - copy as-is
                result += char;
                i++;
            }
        }
        return result;
    }
}
exports.QuestionGenerator = QuestionGenerator;
/**
 * Create generator with environment variables
 */
function createGenerator() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    return new QuestionGenerator(apiKey);
}
//# sourceMappingURL=generator.js.map