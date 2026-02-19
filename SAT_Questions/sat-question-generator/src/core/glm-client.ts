import OpenAI from 'openai';

const GLM_BASE_URL = 'https://api.z.ai/api/paas/v4/';
const LOCAL_PLACEHOLDER_API_KEY = 'local-no-auth';

/**
 * Resolve API key from environment.
 * Supports hosted providers (Zhipu/OpenAI) and keyless local OpenAI-compatible servers.
 */
export function resolveLLMApiKey(): string {
  const key =
    process.env.LLM_API_KEY ||
    process.env.MINIMAX_API_KEY ||
    process.env.ZHIPU_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (key && key.trim().length > 0) {
    return key;
  }

  const hasLocalBaseURL =
    !!process.env.LLM_BASE_URL || !!process.env.MINIMAX_BASE_URL || !!process.env.OPENAI_BASE_URL;

  if (hasLocalBaseURL) {
    // OpenAI SDK requires a non-empty apiKey even when the backend ignores auth.
    return LOCAL_PLACEHOLDER_API_KEY;
  }

  throw new Error(
    'Missing LLM credentials. Set ZHIPU_API_KEY for hosted GLM, or set LLM_BASE_URL/MINIMAX_BASE_URL for local keyless inference.'
  );
}

/**
 * Resolve base URL from environment.
 */
export function resolveLLMBaseURL(): string {
  const baseURL =
    process.env.LLM_BASE_URL ||
    process.env.MINIMAX_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    GLM_BASE_URL;

  return baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
}

/**
 * Create an OpenAI-compatible client configured for Zhipu AI's GLM-5
 */
export function createGLMClient(apiKey?: string): OpenAI {
  return new OpenAI({
    apiKey: apiKey || resolveLLMApiKey(),
    baseURL: resolveLLMBaseURL(),
  });
}

/**
 * Create GLM client from environment variables
 */
export function createGLMClientFromEnv(): OpenAI {
  return createGLMClient(resolveLLMApiKey());
}

/**
 * Extract text content from an OpenAI chat completion response
 */
export function extractText(response: OpenAI.Chat.Completions.ChatCompletion): string {
  return response.choices[0]?.message?.content || '';
}
