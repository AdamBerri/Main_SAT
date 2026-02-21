"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLLMApiKey = resolveLLMApiKey;
exports.resolveLLMBaseURL = resolveLLMBaseURL;
exports.createGLMClient = createGLMClient;
exports.createGLMClientFromEnv = createGLMClientFromEnv;
exports.extractText = extractText;
const openai_1 = __importDefault(require("openai"));
const GLM_BASE_URL = 'https://api.z.ai/api/paas/v4/';
const LOCAL_PLACEHOLDER_API_KEY = 'local-no-auth';
/**
 * Resolve API key from environment.
 * Supports hosted providers (Zhipu/OpenAI) and keyless local OpenAI-compatible servers.
 */
function resolveLLMApiKey() {
    const key = process.env.LLM_API_KEY ||
        process.env.MINIMAX_API_KEY ||
        process.env.ZHIPU_API_KEY ||
        process.env.OPENAI_API_KEY;
    if (key && key.trim().length > 0) {
        return key;
    }
    const hasLocalBaseURL = !!process.env.LLM_BASE_URL || !!process.env.MINIMAX_BASE_URL || !!process.env.OPENAI_BASE_URL;
    if (hasLocalBaseURL) {
        // OpenAI SDK requires a non-empty apiKey even when the backend ignores auth.
        return LOCAL_PLACEHOLDER_API_KEY;
    }
    throw new Error('Missing LLM credentials. Set ZHIPU_API_KEY for hosted GLM, or set LLM_BASE_URL/MINIMAX_BASE_URL for local keyless inference.');
}
/**
 * Resolve base URL from environment.
 */
function resolveLLMBaseURL() {
    const baseURL = process.env.LLM_BASE_URL ||
        process.env.MINIMAX_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        GLM_BASE_URL;
    return baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
}
/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
function createGLMClient(apiKey) {
    return new openai_1.default({
        apiKey: apiKey || resolveLLMApiKey(),
        baseURL: resolveLLMBaseURL(),
    });
}
/**
 * Create GLM client from environment variables
 */
function createGLMClientFromEnv() {
    return createGLMClient(resolveLLMApiKey());
}
/**
 * Strip reasoning/thinking tokens from model output.
 * MiniMax-M1 and other reasoning models wrap their chain-of-thought
 * in <think>...</think> tags before the actual response.
 */
function stripThinkingTokens(text) {
    // Remove all <think>...</think> blocks (greedy, handles newlines)
    const stripped = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return stripped || text;
}
/**
 * Extract text content from an OpenAI chat completion response
 */
function extractText(response) {
    const raw = response.choices[0]?.message?.content || '';
    return stripThinkingTokens(raw);
}
//# sourceMappingURL=glm-client.js.map