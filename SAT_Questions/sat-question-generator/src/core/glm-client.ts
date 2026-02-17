import OpenAI from 'openai';

const GLM_BASE_URL = 'https://api.z.ai/api/paas/v4/';

/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
export function createGLMClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: GLM_BASE_URL,
  });
}

/**
 * Create GLM client from ZHIPU_API_KEY environment variable
 */
export function createGLMClientFromEnv(): OpenAI {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ZHIPU_API_KEY environment variable');
  }
  return createGLMClient(apiKey);
}

/**
 * Extract text content from an OpenAI chat completion response
 */
export function extractText(response: OpenAI.Chat.Completions.ChatCompletion): string {
  return response.choices[0]?.message?.content || '';
}
