import OpenAI from 'openai';
/**
 * Resolve API key from environment.
 * Supports hosted providers (Zhipu/OpenAI) and keyless local OpenAI-compatible servers.
 */
export declare function resolveLLMApiKey(): string;
/**
 * Resolve base URL from environment.
 */
export declare function resolveLLMBaseURL(): string;
/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
export declare function createGLMClient(apiKey?: string): OpenAI;
/**
 * Create GLM client from environment variables
 */
export declare function createGLMClientFromEnv(): OpenAI;
/**
 * Extract text content from an OpenAI chat completion response
 */
export declare function extractText(response: OpenAI.Chat.Completions.ChatCompletion): string;
//# sourceMappingURL=glm-client.d.ts.map