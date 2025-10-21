import { SupportedModel } from '../types';

// Groq model IDs
// Pricing sourced from: https://console.groq.com/docs/models
// Last updated: 2025-10-17
export type GroqModel =
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile'
  | 'meta-llama/llama-guard-4-12b'
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'meta-llama/llama-4-maverick-17b-128e-instruct'
  | 'meta-llama/llama-4-scout-17b-16e-instruct'
  | 'meta-llama/llama-prompt-guard-2-22m'
  | 'meta-llama/llama-prompt-guard-2-86m'
  | 'moonshotai/kimi-k2-instruct-0905'
  | 'qwen/qwen3-32b';

export const GroqModels: SupportedModel[] = [
  // Production Models
  {
    model_id: 'llama-3.1-8b-instant',
    input_cost_per_token: 0.00000005, // $0.05 per 1M tokens
    output_cost_per_token: 0.00000008, // $0.08 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'llama-3.3-70b-versatile',
    input_cost_per_token: 0.00000059, // $0.59 per 1M tokens
    output_cost_per_token: 0.00000079, // $0.79 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'meta-llama/llama-guard-4-12b',
    input_cost_per_token: 0.0000002, // $0.20 per 1M tokens
    output_cost_per_token: 0.0000002, // $0.20 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'openai/gpt-oss-120b',
    input_cost_per_token: 0.00000015, // $0.15 per 1M tokens
    output_cost_per_token: 0.0000006, // $0.60 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'openai/gpt-oss-20b',
    input_cost_per_token: 0.000000075, // $0.075 per 1M tokens
    output_cost_per_token: 0.0000003, // $0.30 per 1M tokens
    provider: 'Groq',
  },
  // Preview Models
  {
    model_id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    input_cost_per_token: 0.0000002, // $0.20 per 1M tokens
    output_cost_per_token: 0.0000006, // $0.60 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    input_cost_per_token: 0.00000011, // $0.11 per 1M tokens
    output_cost_per_token: 0.00000034, // $0.34 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'meta-llama/llama-prompt-guard-2-22m',
    input_cost_per_token: 0.00000003, // $0.03 per 1M tokens
    output_cost_per_token: 0.00000003, // $0.03 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'meta-llama/llama-prompt-guard-2-86m',
    input_cost_per_token: 0.00000004, // $0.04 per 1M tokens
    output_cost_per_token: 0.00000004, // $0.04 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'moonshotai/kimi-k2-instruct-0905',
    input_cost_per_token: 0.000001, // $1.00 per 1M tokens
    output_cost_per_token: 0.000003, // $3.00 per 1M tokens
    provider: 'Groq',
  },
  {
    model_id: 'qwen/qwen3-32b',
    input_cost_per_token: 0.00000029, // $0.29 per 1M tokens
    output_cost_per_token: 0.00000059, // $0.59 per 1M tokens
    provider: 'Groq',
  },
];
