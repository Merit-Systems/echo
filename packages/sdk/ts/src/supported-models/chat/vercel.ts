import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway model IDs
// Models are prefixed with their upstream provider as used by the Vercel AI Gateway
// Pricing sourced from: https://vercel.com/ai-gateway via @ai-sdk/gateway API
// Last updated: 2026-02-18
export type VercelModel =
  | '@anthropic/claude-3-5-sonnet'
  | '@anthropic/claude-3.5-haiku'
  | '@anthropic/claude-3.7-sonnet'
  | '@anthropic/claude-opus-4'
  | '@anthropic/claude-sonnet-4'
  | '@deepseek/deepseek-r1'
  | '@deepseek/deepseek-v3'
  | '@google/gemini-2.0-flash'
  | '@google/gemini-2.0-flash-lite'
  | '@google/gemini-2.5-flash'
  | '@google/gemini-2.5-pro'
  | '@mistral/mistral-large'
  | '@mistral/mistral-small'
  | '@openai/gpt-4.1'
  | '@openai/gpt-4.1-mini'
  | '@openai/gpt-4.1-nano'
  | '@openai/gpt-4o'
  | '@openai/gpt-4o-mini'
  | '@openai/gpt-5'
  | '@openai/gpt-5-mini'
  | '@openai/o3'
  | '@openai/o3-mini'
  | '@openai/o4-mini'
  | '@xai/grok-3'
  | '@xai/grok-3-mini';

export const VercelModels: SupportedModel[] = [
  // Anthropic models via Vercel AI Gateway
  {
    model_id: '@anthropic/claude-3-5-sonnet',
    input_cost_per_token: 0.000003, // $3.00 / 1M tokens
    output_cost_per_token: 0.000015, // $15.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7, // $0.80 / 1M tokens
    output_cost_per_token: 0.000004, // $4.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@anthropic/claude-3.7-sonnet',
    input_cost_per_token: 0.000003, // $3.00 / 1M tokens
    output_cost_per_token: 0.000015, // $15.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@anthropic/claude-opus-4',
    input_cost_per_token: 0.000015, // $15.00 / 1M tokens
    output_cost_per_token: 0.000075, // $75.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003, // $3.00 / 1M tokens
    output_cost_per_token: 0.000015, // $15.00 / 1M tokens
    provider: 'Vercel',
  },
  // DeepSeek models via Vercel AI Gateway
  {
    model_id: '@deepseek/deepseek-r1',
    input_cost_per_token: 0.00000055, // $0.55 / 1M tokens
    output_cost_per_token: 0.00000219, // $2.19 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@deepseek/deepseek-v3',
    input_cost_per_token: 0.00000027, // $0.27 / 1M tokens
    output_cost_per_token: 0.0000011, // $1.10 / 1M tokens
    provider: 'Vercel',
  },
  // Google models via Vercel AI Gateway
  {
    model_id: '@google/gemini-2.0-flash',
    input_cost_per_token: 1e-7, // $0.10 / 1M tokens
    output_cost_per_token: 4e-7, // $0.40 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8, // $0.075 / 1M tokens
    output_cost_per_token: 3e-7, // $0.30 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@google/gemini-2.5-flash',
    input_cost_per_token: 1.5e-7, // $0.15 / 1M tokens
    output_cost_per_token: 6e-7, // $0.60 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125, // $1.25 / 1M tokens
    output_cost_per_token: 0.00001, // $10.00 / 1M tokens
    provider: 'Vercel',
  },
  // Mistral models via Vercel AI Gateway
  {
    model_id: '@mistral/mistral-large',
    input_cost_per_token: 0.000002, // $2.00 / 1M tokens
    output_cost_per_token: 0.000006, // $6.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@mistral/mistral-small',
    input_cost_per_token: 1e-7, // $0.10 / 1M tokens
    output_cost_per_token: 3e-7, // $0.30 / 1M tokens
    provider: 'Vercel',
  },
  // OpenAI models via Vercel AI Gateway
  {
    model_id: '@openai/gpt-4.1',
    input_cost_per_token: 0.000002, // $2.00 / 1M tokens
    output_cost_per_token: 0.000008, // $8.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7, // $0.40 / 1M tokens
    output_cost_per_token: 0.0000016, // $1.60 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7, // $0.10 / 1M tokens
    output_cost_per_token: 4e-7, // $0.40 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-4o',
    input_cost_per_token: 0.0000025, // $2.50 / 1M tokens
    output_cost_per_token: 0.00001, // $10.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7, // $0.15 / 1M tokens
    output_cost_per_token: 6e-7, // $0.60 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-5',
    input_cost_per_token: 0.000002, // $2.00 / 1M tokens
    output_cost_per_token: 0.000008, // $8.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/gpt-5-mini',
    input_cost_per_token: 7.5e-7, // $0.75 / 1M tokens
    output_cost_per_token: 0.000003, // $3.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/o3',
    input_cost_per_token: 0.00001, // $10.00 / 1M tokens
    output_cost_per_token: 0.00004, // $40.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/o3-mini',
    input_cost_per_token: 0.0000011, // $1.10 / 1M tokens
    output_cost_per_token: 0.0000044, // $4.40 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@openai/o4-mini',
    input_cost_per_token: 0.0000011, // $1.10 / 1M tokens
    output_cost_per_token: 0.0000044, // $4.40 / 1M tokens
    provider: 'Vercel',
  },
  // xAI models via Vercel AI Gateway
  {
    model_id: '@xai/grok-3',
    input_cost_per_token: 0.000003, // $3.00 / 1M tokens
    output_cost_per_token: 0.000015, // $15.00 / 1M tokens
    provider: 'Vercel',
  },
  {
    model_id: '@xai/grok-3-mini',
    input_cost_per_token: 0.0000003, // $0.30 / 1M tokens
    output_cost_per_token: 0.0000005, // $0.50 / 1M tokens
    provider: 'Vercel',
  },
];
