import { SupportedModel } from '../types';

// Union type of all valid OpenAI model IDs
export type OpenAIModel =
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-4'
  | 'gpt-4-0125-preview'
  | 'gpt-4-0613'
  | 'gpt-4-1106-preview'
  | 'gpt-4-turbo'
  | 'gpt-4-turbo-2024-04-09'
  | 'gpt-4-turbo-preview'
  | 'gpt-4.1'
  | 'gpt-4.1-2025-04-14'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-mini-2025-04-14'
  | 'gpt-4.1-nano'
  | 'gpt-4.1-nano-2025-04-14'
  | 'gpt-4o'
  | 'gpt-4o-2024-05-13'
  | 'gpt-4o-2024-08-06'
  | 'gpt-4o-2024-11-20'
  | 'gpt-4o-mini'
  | 'gpt-4o-mini-2024-07-18'
  | 'gpt-5'
  | 'gpt-5-2025-08-07'
  | 'gpt-5-chat-latest'
  | 'gpt-5-mini'
  | 'gpt-5-mini-2025-08-07'
  | 'gpt-5-nano'
  | 'gpt-5-nano-2025-08-07'
  | 'o1'
  | 'o1-2024-12-17'
  | 'o1-pro'
  | 'o1-pro-2025-03-19'
  | 'o3'
  | 'o3-2025-04-16'
  | 'o3-deep-research'
  | 'o3-deep-research-2025-06-26'
  | 'o3-mini'
  | 'o3-mini-2025-01-31'
  | 'o3-pro'
  | 'o3-pro-2025-06-10';

export const OpenAIModels: SupportedModel[] = [
  {
    model_id: 'gpt-3.5-turbo',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-3.5-turbo-0125',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-3.5-turbo-1106',
    input_cost_per_token: 5e-7,
    output_cost_per_token: 0.0000015,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-0125-preview',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-0613',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-1106-preview',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-turbo',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-turbo-2024-04-09',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4-turbo-preview',
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00003,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1-2025-04-14',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1-mini',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1-mini-2025-04-14',
    input_cost_per_token: 4e-7,
    output_cost_per_token: 0.0000016,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1-nano',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4.1-nano-2025-04-14',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o-2024-05-13',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o-2024-08-06',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o-2024-11-20',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o-mini',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-4o-mini-2024-07-18',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-2025-08-07',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-chat-latest',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-mini',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-mini-2025-08-07',
    input_cost_per_token: 2.5e-7,
    output_cost_per_token: 0.000002,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-nano',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'gpt-5-nano-2025-08-07',
    input_cost_per_token: 5e-8,
    output_cost_per_token: 4e-7,
    provider: 'OpenAI',
  },
  {
    model_id: 'o1',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'OpenAI',
  },
  {
    model_id: 'o1-2024-12-17',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'OpenAI',
  },
  {
    model_id: 'o1-pro',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'OpenAI',
  },
  {
    model_id: 'o1-pro-2025-03-19',
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.00006,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-2025-04-16',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-deep-research',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-deep-research-2025-06-26',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-mini',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-mini-2025-01-31',
    input_cost_per_token: 0.0000011,
    output_cost_per_token: 0.0000044,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-pro',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
  {
    model_id: 'o3-pro-2025-06-10',
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    provider: 'OpenAI',
  },
];
