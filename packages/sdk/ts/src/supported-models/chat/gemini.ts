import { SupportedModel } from '../types';

// Union type of all valid Gemini model IDs
export type GeminiModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-001'
  | 'gemini-2.0-flash-exp'
  | 'gemini-2.0-flash-exp-image-generation'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.0-flash-lite-001'
  | 'gemini-2.0-flash-lite-preview'
  | 'gemini-2.0-flash-lite-preview-02-05'
  | 'gemini-2.0-flash-thinking-exp'
  | 'gemini-2.0-flash-thinking-exp-01-21'
  | 'gemini-2.0-flash-thinking-exp-1219'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-image'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash-lite-preview-06-17'
  | 'gemini-2.5-flash-lite-preview-09-2025'
  | 'gemini-2.5-flash-preview-05-20'
  | 'gemini-2.5-flash-preview-09-2025'
  | 'gemini-2.5-flash-preview-tts'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-pro-preview-03-25'
  | 'gemini-2.5-pro-preview-05-06'
  | 'gemini-2.5-pro-preview-06-05'
  | 'gemini-2.5-pro-preview-tts';

export const GeminiModels: SupportedModel[] = [
  {
    model_id: 'gemini-2.0-flash',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-001',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-exp',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-exp-image-generation',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-lite',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-lite-001',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-lite-preview',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-lite-preview-02-05',
    input_cost_per_token: 7.5e-8,
    output_cost_per_token: 3e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-thinking-exp',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-thinking-exp-01-21',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.0-flash-thinking-exp-1219',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-image',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-lite',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-lite-preview-06-17',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-lite-preview-09-2025',
    input_cost_per_token: 1e-7,
    output_cost_per_token: 4e-7,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-preview-05-20',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-preview-09-2025',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-flash-preview-tts',
    input_cost_per_token: 3e-7,
    output_cost_per_token: 0.0000025,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-pro',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-pro-preview-03-25',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-pro-preview-05-06',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-pro-preview-06-05',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Gemini',
  },
  {
    model_id: 'gemini-2.5-pro-preview-tts',
    input_cost_per_token: 0.00000125,
    output_cost_per_token: 0.00001,
    provider: 'Gemini',
  },
];
