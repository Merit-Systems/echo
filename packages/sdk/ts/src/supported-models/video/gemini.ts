import { SupportedVideoModel } from 'supported-models/types';

export type GeminiVideoModel =
  | 'veo-3.0-generate-001'
  | 'veo-3.0-fast-generate-001';
// https://ai.google.dev/gemini-api/docs/pricing
export const GeminiVideoModels: SupportedVideoModel[] = [
  {
    model_id: 'veo-3.0-generate-001',
    cost_per_second_with_audio: 0.4,
    cost_per_second_without_audio: 0.2,
    provider: 'Gemini',
  },
  {
    model_id: 'veo-3.0-fast-generate-001',
    cost_per_second_with_audio: 0.15,
    cost_per_second_without_audio: 0.1,
    provider: 'Gemini',
  },
];
