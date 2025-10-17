export const ECHO_TOKEN = process.env.ECHO_API_KEY;
export const ECHO_APP_ID = process.env.ECHO_APP_ID;
export const baseRouterUrl =
  process.env.ECHO_DATA_SERVER_URL || 'https://echo.router.merit.systems';

export const getToken = async () => ECHO_TOKEN!;

export function assertEnv() {
  if (!ECHO_TOKEN) throw new Error('Missing Echo token ECHO_API_KEY');
  if (!ECHO_APP_ID) throw new Error('Missing Echo app id (ECHO_APP_ID)');
}

export function getApiErrorDetails(err: unknown): string {
  const e = err as any;
  const status = e?.statusCode;
  const url = e?.url;
  const body = e?.responseBody;
  if (status || url || body) {
    return `status=${status ?? 'unknown'} url=${url ?? 'unknown'} body=${body ?? 'n/a'}`;
  }
  return String(e?.message ?? e);
}

export function getOpenAITools(
  openai: any, // TODO: fix this,
  modelId: string
): Record<string, unknown> | undefined {
  return modelId.includes('deep-research')
    ? {
        webSearchPreview: openai.tools.webSearchPreview({
          searchContextSize: 'medium',
        }),
      }
    : undefined;
}

// OpenRouter models that are too slow for smoke tests (>15s)
const BLACKLISTED_OR_SLOW_MODELS = new Set([
  'mistralai/magistral-medium-2506:thinking',
  'z-ai/glm-4.6',
  'openai/gpt-5-pro',
  'openai/o4-mini-deep-research',
  'meta-llama/llama-guard-2-8b',
  'eleutherai/llemma_7b',
  'alibaba/tongyi-deepresearch-30b-a3b',
  'stepfun-ai/step3',
  'minimax/minimax-m1',
  'sao10k/l3.1-70b-hanami-x1',
  'qwen/qwen-2.5-vl-7b-instruct',
  'deepseek/deepseek-r1-distill-qwen-32b',
  'cohere/command-r-plus-08-2024',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-pro-preview-05-06',
  'meta-llama/llama-3.1-405b',
  'google/gemini-2.5-pro-preview',
  'meta-llama/llama-guard-3-8b',
  'moonshotai/kimi-dev-72b',
  'openai/o1-pro',
  'openai/o3-pro',
  'z-ai/glm-4.5',
  'morph/morph-v3-fast',
  'tngtech/deepseek-r1t-chimera',
  'perplexity/sonar-reasoning-pro',
  'qwen/qwq-32b',
  'nousresearch/hermes-3-llama-3.1-405b',
  'openai/o3',
  'perplexity/sonar',
  'perplexity/sonar-reasoning',
  'qwen/qwen3-32b',
  'deepseek/deepseek-r1-0528',
  'deepseek/deepseek-r1-0528-qwen3-8b',
  'openai/o1',
  'qwen/qwen3-235b-a22b',
  'qwen/qwen3-8b',
  'z-ai/glm-4.5-air',
  'aion-labs/aion-1.0-mini',
  'perplexity/sonar-pro',
  'openai/gpt-oss-120b',
  'deepseek/deepseek-chat-v3.1',
  'deepseek/deepseek-v3.2-exp',
  'google/gemma-2-9b-it',
  'qwen/qwen3-coder',
  'google/gemma-2-27b-it',
  'thudm/glm-z1-32b',
  'deepseek/deepseek-v3.1-terminus',
]);

export function shouldSkipModelInTests(model_id: string): boolean {
  if (BLACKLISTED_OR_SLOW_MODELS.has(model_id)) {
    return true;
  }
  if (model_id.includes('thinking') || model_id.includes('deep-research')) {
    return true;
  }
  return false;
}
