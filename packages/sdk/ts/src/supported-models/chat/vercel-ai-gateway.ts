import { SupportedModel } from '../types';

// Vercel AI Gateway model IDs
// Vercel AI Gateway acts as a proxy - it routes requests to underlying providers
// (OpenAI, Anthropic, Google, Groq, etc.) so pricing matches the upstream provider.
// Pricing sourced from: https://vercel.com/docs/ai-gateway/pricing
// Model list sourced from: https://vercel.com/ai-gateway/models
// Last updated: 2026-03-20

export type VercelAIGatewayModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-5'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'o3-mini'
  | 'o4-mini'
  | 'claude-sonnet-4-20250514'
  | 'claude-haiku-4-20250414'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'deepseek-r1'
  | 'deepseek-chat'
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile'
  | 'mistral-large-latest'
  | 'qwen/qwen3-32b';

export const VercelAIGatewayModels: SupportedModel[] = [
  // === OpenAI models via Vercel AI Gateway ===
  {
    model_id: 'gpt-4o',
    input_cost_per_token: 0.0000025, // $2.50 per 1M tokens
    output_cost_per_token: 0.00001, // $10.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-4o-mini',
    input_cost_per_token: 0.00000015, // $0.15 per 1M tokens
    output_cost_per_token: 0.0000006, // $0.60 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-4.1',
    input_cost_per_token: 0.000002, // $2.00 per 1M tokens
    output_cost_per_token: 0.000008, // $8.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-4.1-mini',
    input_cost_per_token: 0.0000004, // $0.40 per 1M tokens
    output_cost_per_token: 0.0000016, // $1.60 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-4.1-nano',
    input_cost_per_token: 0.0000001, // $0.10 per 1M tokens
    output_cost_per_token: 0.0000004, // $0.40 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-5',
    input_cost_per_token: 0.0000025, // $2.50 per 1M tokens
    output_cost_per_token: 0.000015, // $15.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-5-mini',
    input_cost_per_token: 0.0000005, // $0.50 per 1M tokens
    output_cost_per_token: 0.000003, // $3.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gpt-5-nano',
    input_cost_per_token: 0.00000005, // $0.05 per 1M tokens
    output_cost_per_token: 0.00000025, // $0.25 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'o3-mini',
    input_cost_per_token: 0.0000011, // $1.10 per 1M tokens
    output_cost_per_token: 0.0000044, // $4.40 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'o4-mini',
    input_cost_per_token: 0.0000011, // $1.10 per 1M tokens
    output_cost_per_token: 0.0000044, // $4.40 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === Anthropic models via Vercel AI Gateway ===
  {
    model_id: 'claude-sonnet-4-20250514',
    input_cost_per_token: 0.000003, // $3.00 per 1M tokens
    output_cost_per_token: 0.000015, // $15.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'claude-haiku-4-20250414',
    input_cost_per_token: 0.0000008, // $0.80 per 1M tokens
    output_cost_per_token: 0.000004, // $4.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === Google models via Vercel AI Gateway ===
  {
    model_id: 'gemini-2.5-pro',
    input_cost_per_token: 0.00000125, // $1.25 per 1M tokens
    output_cost_per_token: 0.00001, // $10.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'gemini-2.5-flash',
    input_cost_per_token: 0.00000015, // $0.15 per 1M tokens
    output_cost_per_token: 0.0000006, // $0.60 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === DeepSeek models via Vercel AI Gateway ===
  {
    model_id: 'deepseek-r1',
    input_cost_per_token: 0.00000055, // $0.55 per 1M tokens
    output_cost_per_token: 0.00000219, // $2.19 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'deepseek-chat',
    input_cost_per_token: 0.00000014, // $0.14 per 1M tokens
    output_cost_per_token: 0.00000028, // $0.28 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === Groq models via Vercel AI Gateway ===
  {
    model_id: 'llama-3.1-8b-instant',
    input_cost_per_token: 0.00000005, // $0.05 per 1M tokens
    output_cost_per_token: 0.00000008, // $0.08 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
  {
    model_id: 'llama-3.3-70b-versatile',
    input_cost_per_token: 0.00000059, // $0.59 per 1M tokens
    output_cost_per_token: 0.00000079, // $0.79 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === Mistral models via Vercel AI Gateway ===
  {
    model_id: 'mistral-large-latest',
    input_cost_per_token: 0.000002, // $2.00 per 1M tokens
    output_cost_per_token: 0.000006, // $6.00 per 1M tokens
    provider: 'Vercel AI Gateway',
  },

  // === Qwen models via Vercel AI Gateway ===
  {
    model_id: 'qwen/qwen3-32b',
    input_cost_per_token: 0.00000029, // $0.29 per 1M tokens
    output_cost_per_token: 0.00000059, // $0.59 per 1M tokens
    provider: 'Vercel AI Gateway',
  },
];
