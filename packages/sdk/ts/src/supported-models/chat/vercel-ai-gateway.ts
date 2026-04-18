import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway model IDs
// The Vercel AI Gateway provides access to models from multiple providers
// through a single OpenAI-compatible API endpoint
export type VercelAIGatewayModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | 'claude-3-5-sonnet-20240620'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-1.0-pro'
  | 'mistral-large-latest'
  | 'mistral-medium-latest'
  | 'mistral-small-latest'
  | 'llama-3.1-405b-instruct'
  | 'llama-3.1-70b-instruct'
  | 'llama-3.1-8b-instruct';

export const VercelAIGatewayModels: SupportedModel[] = [
  // OpenAI models via Vercel AI Gateway
  {
    model_id: 'gpt-4o',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Vercel',
  },
  {
    model_id: 'gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'Vercel',
  },
  {
    model_id: 'gpt-4',
    input_cost_per_token: 0.00003,
    output_cost_per_token: 0.00006,
    provider: 'Vercel',
  },
  {
    model_id: 'gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  // Anthropic models via Vercel AI Gateway
  {
    model_id: 'claude-3-opus-20240229',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Vercel',
  },
  {
    model_id: 'claude-3-sonnet-20240229',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  {
    model_id: 'claude-3-haiku-20240307',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Vercel',
  },
  {
    model_id: 'claude-3-5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Vercel',
  },
  // Google models via Vercel AI Gateway
  {
    model_id: 'gemini-1.5-pro',
    input_cost_per_token: 0.0000035,
    output_cost_per_token: 0.0000105,
    provider: 'Vercel',
  },
  {
    model_id: 'gemini-1.5-flash',
    input_cost_per_token: 3.5e-7,
    output_cost_per_token: 0.00000105,
    provider: 'Vercel',
  },
  {
    model_id: 'gemini-1.0-pro',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'Vercel',
  },
  // Mistral models via Vercel AI Gateway
  {
    model_id: 'mistral-large-latest',
    input_cost_per_token: 0.000004,
    output_cost_per_token: 0.000012,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral-medium-latest',
    input_cost_per_token: 0.0000027,
    output_cost_per_token: 0.0000081,
    provider: 'Vercel',
  },
  {
    model_id: 'mistral-small-latest',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'Vercel',
  },
  // Meta Llama models via Vercel AI Gateway
  {
    model_id: 'llama-3.1-405b-instruct',
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000016,
    provider: 'Vercel',
  },
  {
    model_id: 'llama-3.1-70b-instruct',
    input_cost_per_token: 9e-7,
    output_cost_per_token: 0.0000009,
    provider: 'Vercel',
  },
  {
    model_id: 'llama-3.1-8b-instruct',
    input_cost_per_token: 2e-7,
    output_cost_per_token: 2e-7,
    provider: 'Vercel',
  },
];
