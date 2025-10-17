import { SupportedModel } from '../types';

// Groq model IDs
export type GroqModel =
  | 'llama3-8b-8192'
  | 'llama3-70b-8192'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile'
  | 'llama-4-scout'
  | 'llama-4-maverick'
  | 'llama-guard-4-12b'
  | 'qwen3-32b'
  | 'gpt-oss-20b'
  | 'gpt-oss-120b'
  | 'kimi-k2-0905-1t';

export const GroqModels: SupportedModel[] = [
  {
    model_id: 'llama3-8b-8192',
    input_cost_per_token: 0.00000005,
    output_cost_per_token: 0.00000008,
    provider: 'Groq',
  },
  {
    model_id: 'llama3-70b-8192',
    input_cost_per_token: 0.00000027,
    output_cost_per_token: 0.00000027,
    provider: 'Groq',
  },
  {
    model_id: 'mixtral-8x7b-32768',
    input_cost_per_token: 0.00000027,
    output_cost_per_token: 0.00000027,
    provider: 'Groq',
  },
  {
    model_id: 'gemma2-9b-it',
    input_cost_per_token: 0.00000007,
    output_cost_per_token: 0.00000007,
    provider: 'Groq',
  },
  {
    model_id: 'llama-3.1-8b-instant',
    input_cost_per_token: 0.00000005,
    output_cost_per_token: 0.00000008,
    provider: 'Groq',
  },
  {
    model_id: 'llama-3.3-70b-versatile',
    input_cost_per_token: 0.00000059,
    output_cost_per_token: 0.00000079,
    provider: 'Groq',
  },
  {
    model_id: 'llama-4-scout',
    input_cost_per_token: 0.00000011,
    output_cost_per_token: 0.00000034,
    provider: 'Groq',
  },
  {
    model_id: 'llama-4-maverick',
    input_cost_per_token: 0.0000002,
    output_cost_per_token: 0.0000006,
    provider: 'Groq',
  },
  {
    model_id: 'llama-guard-4-12b',
    input_cost_per_token: 0.0000002,
    output_cost_per_token: 0.0000002,
    provider: 'Groq',
  },
  {
    model_id: 'qwen3-32b',
    input_cost_per_token: 0.00000029,
    output_cost_per_token: 0.00000059,
    provider: 'Groq',
  },
  {
    model_id: 'gpt-oss-20b',
    input_cost_per_token: 0.000000075,
    output_cost_per_token: 0.0000003,
    provider: 'Groq',
  },
  {
    model_id: 'gpt-oss-120b',
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    provider: 'Groq',
  },
  {
    model_id: 'kimi-k2-0905-1t',
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000003,
    provider: 'Groq',
  },
];
