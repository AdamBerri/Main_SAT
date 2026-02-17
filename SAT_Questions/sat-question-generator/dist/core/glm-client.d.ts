import OpenAI from 'openai';
/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
export declare function createGLMClient(apiKey: string): OpenAI;
/**
 * Create GLM client from ZHIPU_API_KEY environment variable
 */
export declare function createGLMClientFromEnv(): OpenAI;
/**
 * Extract text content from an OpenAI chat completion response
 */
export declare function extractText(response: OpenAI.Chat.Completions.ChatCompletion): string;
//# sourceMappingURL=glm-client.d.ts.map