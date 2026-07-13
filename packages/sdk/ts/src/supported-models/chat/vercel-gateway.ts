import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway model IDs
// Models are prefixed with their upstream provider (e.g., openai/gpt-4o, anthropic/claude-3.5-sonnet)
export type VercelGatewayModel =
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-5'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'openai/o3'
  | 'openai/o3-mini'
  | 'openai/o4-mini'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3.7-sonnet'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-opus-4'
  | 'anthropic/claude-opus-4.1'
  | 'anthropic/claude-3-haiku'
  | 'anthropic/claude-3.5-haiku'
  | 'anthropic/claude-3-opus'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-flash-lite'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.0-flash'
  | 'google/gemini-2.0-flash-lite'
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-v3'
  | 'deepseek/deepseek-v3.1'
  | 'meta/llama-4-maverick'
  | 'meta/llama-4-scout'
  | 'xai/grok-3'
  | 'xai/grok-3-mini'
  | 'xai/grok-3-fast'
  | 'xai/grok-4'
  | 'mistral/mistral-large'
  | 'mistral/mistral-medium'
  | 'mistral/mistral-small'
  | (string & {});

// Vercel AI Gateway model pricing
// Source: https://vercel.com/docs/ai-gateway/pricing
// Note: Vercel Gateway adds its own margin on top of upstream provider costs.
// These prices reflect Vercel's listed gateway prices.
export const VercelGatewayModels: SupportedModel[] = [
  // OpenAI models via Vercel AI Gateway
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 2.5e-6,
    output_cost_per_token: 1e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 2e-6,
    output_cost_per_token: 8e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 1.6e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 1.5e-5,
    output_cost_per_token: 7.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 1.1e-6,
    output_cost_per_token: 4.4e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 2e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3',
    input_cost_per_token: 2e-5,
    output_cost_per_token: 8e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o3-mini',
    input_cost_per_token: 1.1e-6,
    output_cost_per_token: 4.4e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'openai/o4-mini',
    input_cost_per_token: 1.1e-6,
    output_cost_per_token: 4.4e-6,
    provider: 'VercelGateway',
  },
  // Anthropic models via Vercel AI Gateway
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 3e-6,
    output_cost_per_token: 1.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 1.5e-5,
    output_cost_per_token: 7.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4.1',
    input_cost_per_token: 1.5e-5,
    output_cost_per_token: 7.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.7-sonnet',
    input_cost_per_token: 3e-6,
    output_cost_per_token: 1.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-sonnet',
    input_cost_per_token: 3e-6,
    output_cost_per_token: 1.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3.5-haiku',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 4e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3-haiku',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 1.25e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'anthropic/claude-3-opus',
    input_cost_per_token: 1.5e-5,
    output_cost_per_token: 7.5e-5,
    provider: 'VercelGateway',
  },
  // Google models via Vercel AI Gateway
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 1.25e-6,
    output_cost_per_token: 1e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 1.5e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash-lite',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 5e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'google/gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'VercelGateway',
  },
  // DeepSeek models via Vercel AI Gateway
  {
    model_id: 'deepseek/deepseek-r1',
    input_cost_per_token: 5.5e-6,
    output_cost_per_token: 2.19e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 1.1e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'deepseek/deepseek-v3.1',
    input_cost_per_token: 2.7e-7,
    output_cost_per_token: 1.1e-6,
    provider: 'VercelGateway',
  },
  // xAI models via Vercel AI Gateway
  {
    model_id: 'xai/grok-3',
    input_cost_per_token: 3e-6,
    output_cost_per_token: 1.5e-5,
    provider: 'VercelGateway',
  },
  {
    model_id: 'xai/grok-3-mini',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 1.5e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'xai/grok-3-fast',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 2.5e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'xai/grok-4',
    input_cost_per_token: 3e-6,
    output_cost_per_token: 1.5e-5,
    provider: 'VercelGateway',
  },
  // Meta Llama models via Vercel AI Gateway
  {
    model_id: 'meta/llama-4-maverick',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 6e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'meta/llama-4-scout',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'VercelGateway',
  },
  // Mistral models via Vercel AI Gateway
  {
    model_id: 'mistral/mistral-large',
    input_cost_per_token: 2e-6,
    output_cost_per_token: 6e-6,
    provider: 'VercelGateway',
  },
  {
    model_id: 'mistral/mistral-medium',
    input_cost_per_token: 2.75e-7,
    output_cost_per_token: 8.25e-7,
    provider: 'VercelGateway',
  },
  {
    model_id: 'mistral/mistral-small',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 3e-7,
    provider: 'VercelGateway',
  },
];
