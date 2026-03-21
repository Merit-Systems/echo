import { SupportedModel } from '../types';

// Vercel AI Gateway model IDs
// Models accessed through the Vercel AI Gateway use the format: provider/model-id
// Pricing sourced from: Vercel AI Gateway API (gateway.getAvailableModels())
// Last updated: 2026-03-20
export type VercelModel =
  | 'alibaba/qwen-3-14b'
  | 'alibaba/qwen-3-235b'
  | 'alibaba/qwen-3-30b'
  | 'alibaba/qwen-3-32b'
  | 'alibaba/qwen3-coder'
  | 'amazon/nova-lite'
  | 'amazon/nova-micro'
  | 'amazon/nova-pro'
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3-opus'
  | 'anthropic/claude-3.5-haiku'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3.7-sonnet'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-sonnet-4'
  | 'cohere/command-a'
  | 'cohere/command-r'
  | 'cohere/command-r-plus'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-v3'
  | 'deepseek/deepseek-v3.1'
  | 'google/gemini-2.0-flash'
  | 'google/gemini-2.0-flash-lite'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'meta/llama-3.1-70b'
  | 'meta/llama-3.1-8b'
  | 'meta/llama-3.3-70b'
  | 'meta/llama-4-maverick'
  | 'meta/llama-4-scout'
  | 'mistral/mistral-large'
  | 'mistral/mistral-small'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'openai/o3'
  | 'openai/o3-mini'
  | 'openai/o4-mini'
  | 'perplexity/sonar'
  | 'perplexity/sonar-pro'
  | 'xai/grok-3'
  | 'xai/grok-3-mini';

// Pricing data from Vercel AI Gateway API
// These are the per-token costs in USD
export const VercelModels: SupportedModel[] = [
  // Alibaba
  {
    model_id: 'alibaba/qwen-3-14b',
    input_cost_per_token: 0.00000014,
    output_cost_per_token: 0.00000014,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-235b',
    input_cost_per_token: 0.0000014,
    output_cost_per_token: 0.0000014,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-30b',
    input_cost_per_token: 0.00000028,
    output_cost_per_token: 0.00000028,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen-3-32b',
    input_cost_per_token: 0.00000028,
    output_cost_per_token: 0.00000028,
    provider: 'Vercel',
  },
  {
    model_id: 'alibaba/qwen3-coder',
    input_cost_per_token: 0.00000014,
    output_cost_per_token: 0.0000006,
    provider: 'Vercel',
  },
  // Amazon
  {
    model_id: 'amazon/nova-lite',
    input_cost_per_token: 0.00000006,
    output_cost_per_token: 0.00000024,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-micro',
    input_cost_per_token: 0.000000035,
    output_cost_per_token: 0.00000014,
    provider: 'Vercel',
  },
  {
    model_id: 'amazon/nova-pro',
    input_cost_per_token: 0.0000008,
    output_cost_per_token: 0.0000032,
    provider: 'Vercel',
  },
  // Anthropic
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 0.00000025,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 0.0000008,
    output_cost_per_token: 0.000004,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  // Cohere
  {
    model_id: 'cohere/command-a',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'cohere/command-r',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'Vercel',
  },
  {
    model_id: 'cohere/command-r-plus',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  // DeepSeek
  {
    model_id: 'deepseek/deepseek-r1',
    input_cost_per_token: 0.00000055,
    output_cost_per_token: 0.00000219,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3',
    input_cost_per_token: 0.00000027,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  {
    model_id: 'deepseek/deepseek-v3.1',
    input_cost_per_token: 0.00000027,
    output_cost_per_token: 0.0000011,
    provider: 'Vercel',
  },
  // Google
  {
    model_id: 'google/gemini-2.0-flash',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'Vercel',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  // Meta
  {
    model_id: 'meta/llama-3.1-70b',
    input_cost_per_token: 0.00000088,
    output_cost_per_token: 0.00000088,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.1-8b',
    input_cost_per_token: 0.00000018,
    output_cost_per_token: 0.00000018,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-3.3-70b',
    input_cost_per_token: 0.00000088,
    output_cost_per_token: 0.00000088,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-4-maverick',
    input_cost_per_token: 0.00000025,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'meta/llama-4-scout',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'Vercel',
  },
  // Mistral
  {
    model_id: 'mistral/mistral-large',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000006,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral/mistral-small',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000003,
    provider: 'Vercel',
  },
  // OpenAI
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 0.0000004,
    output_cost_per_token: 0.0000016,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00004,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  {
    model_id: 'openai/o4-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'Vercel',
  },
  // Perplexity
  {
    model_id: 'perplexity/sonar',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000001,
    provider: 'Vercel',
  },
  {
    model_id: 'perplexity/sonar-pro',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  // xAI
  {
    model_id: 'xai/grok-3',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'xai/grok-3-mini',
    input_cost_per_token: 0.0000003,
    output_cost_per_token: 0.0000005,
    provider: 'Vercel',
  },
];
