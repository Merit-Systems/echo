import { SupportedModel } from '../types';

// Union type of Vercel AI Gateway language model IDs supported through Echo.
export type VercelAIGatewayModel =
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4.1'
  | 'openai/gpt-4.1-mini'
  | 'openai/gpt-4.1-nano'
  | 'openai/gpt-5'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5-nano'
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-opus-4'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'xai/grok-4'
  | 'xai/grok-code-fast-1';

export const VercelAIGatewayModels: SupportedModel[] = [
  {
    model_id: 'openai/gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4o-mini',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1-mini',
    input_cost_per_token: 0.0000004,
    output_cost_per_token: 0.0000016,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-4.1-nano',
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-mini',
    input_cost_per_token: 0.00000025,
    output_cost_per_token: 0.000002,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'openai/gpt-5-nano',
    input_cost_per_token: 0.00000005,
    output_cost_per_token: 0.0000004,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-sonnet-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'anthropic/claude-opus-4',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-flash',
    input_cost_per_token: 0.0000003,
    output_cost_per_token: 0.0000025,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'google/gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-4',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'VercelAIGateway',
  },
  {
    model_id: 'xai/grok-code-fast-1',
    input_cost_per_token: 0.0000002,
    output_cost_per_token: 0.0000015,
    provider: 'VercelAIGateway',
  },
];
