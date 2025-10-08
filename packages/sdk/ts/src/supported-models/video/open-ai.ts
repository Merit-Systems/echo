import { SupportedVideoModel } from 'supported-models/types';

export type OpenAIVideoModel = 'sora-2' | 'sora-2-pro';

export const OpenAIVideoModels: SupportedVideoModel[] = [
  {
    model_id: 'sora-2',
    cost_per_second_with_audio: 0.1,
    cost_per_second_without_audio: 0.1,
    provider: 'OpenAI',
  },
  {
    model_id: 'sora-2-pro',
    cost_per_second_with_audio: 0.3,
    cost_per_second_without_audio: 0.3,
    provider: 'OpenAI',
  },
];
