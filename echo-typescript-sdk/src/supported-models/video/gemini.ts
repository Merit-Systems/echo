import { SupportedVideoModel } from '../types';

export type GeminiVideoModel = 'veo-3.0-generate-001';

export const GeminiVideoModels: SupportedVideoModel[] = [
  {
    model_id: 'veo-3.0-generate-001',
    input_cost_per_token: 1.5e-7,
    output_cost_per_token: 6e-7,
    provider: 'Gemini',
  },
];
