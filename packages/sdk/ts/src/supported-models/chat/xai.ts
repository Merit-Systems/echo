import { SupportedModel } from '../types';

// xAI Grok models and pricing (per 1 token). Source: https://docs.x.ai/docs/models
// Prices below are per-token, converted from $ per 1M tokens
export type XAIModel =
  | 'grok-2-vision-1212'
  | 'grok-3'
  | 'grok-3-mini'
  | 'grok-4-0709'
  | 'grok-4-fast-non-reasoning'
  | 'grok-4-fast-reasoning'
  | 'grok-code-fast-1';

export const XAIModels: SupportedModel[] = [
  {
    model_id: 'grok-2-vision-1212',
    input_cost_per_token: 0.000002, // $2.00 / 1M
    output_cost_per_token: 0.00001, // $10.00 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-3',
    input_cost_per_token: 0.000003, // $3.00 / 1M
    output_cost_per_token: 0.000015, // $15.00 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-3-mini',
    input_cost_per_token: 0.0000003, // $0.30 / 1M
    output_cost_per_token: 0.0000005, // $0.50 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-4-0709',
    input_cost_per_token: 0.000003, // $3.00 / 1M
    output_cost_per_token: 0.000015, // $15.00 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-4-fast-non-reasoning',
    input_cost_per_token: 0.0000002, // $0.20 / 1M
    output_cost_per_token: 0.0000005, // $0.50 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-4-fast-reasoning',
    input_cost_per_token: 0.0000002, // $0.20 / 1M
    output_cost_per_token: 0.0000005, // $0.50 / 1M
    provider: 'xAI',
  },
  {
    model_id: 'grok-code-fast-1',
    input_cost_per_token: 0.0000002, // $0.20 / 1M
    output_cost_per_token: 0.0000015, // $1.50 / 1M
    provider: 'xAI',
  },
];
