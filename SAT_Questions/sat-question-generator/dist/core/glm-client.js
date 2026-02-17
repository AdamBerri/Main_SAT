"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGLMClient = createGLMClient;
exports.createGLMClientFromEnv = createGLMClientFromEnv;
exports.extractText = extractText;
const openai_1 = __importDefault(require("openai"));
const GLM_BASE_URL = 'https://api.z.ai/api/paas/v4/';
/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
function createGLMClient(apiKey) {
    return new openai_1.default({
        apiKey,
        baseURL: GLM_BASE_URL,
    });
}
/**
 * Create GLM client from ZHIPU_API_KEY environment variable
 */
function createGLMClientFromEnv() {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
        throw new Error('Missing ZHIPU_API_KEY environment variable');
    }
    return createGLMClient(apiKey);
}
/**
 * Extract text content from an OpenAI chat completion response
 */
function extractText(response) {
    return response.choices[0]?.message?.content || '';
}
//# sourceMappingURL=glm-client.js.map