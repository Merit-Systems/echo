import { SupportedModel } from '../types';

// Union type of all valid Anthropic model IDs
export type AnthropicModel =
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3-haiku-20240307'
  | 'claude-3-opus-20240229'
  | 'claude-opus-4-1-20250805'
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514';

export const AnthropicModels: SupportedModel[] = [
  {
    model_id: 'claude-3-5-haiku-20241022',
    input_cost_per_token: 8e-7,
    output_cost_per_token: 0.000004,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-3-5-sonnet-20240620',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-3-5-sonnet-20241022',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-3-7-sonnet-20250219',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-3-haiku-20240307',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.00000125,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-3-opus-20240229',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-opus-4-1-20250805',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-opus-4-20250514',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    provider: 'Anthropic',
  },
  {
    model_id: 'claude-sonnet-4-20250514',
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    provider: 'Anthropic',
  },
];
