import { SupportedAudioModel } from '../types';

export type OpenAIAudioModel = 'whisper-1' | 'whisper-large-v3';

export const OpenAIAudioModels: SupportedAudioModel[] = [
  {
    model_id: 'whisper-1',
    cost_per_minute: 0.006,
    provider: 'OpenAI',
  },
  {
    model_id: 'whisper-large-v3',
    cost_per_minute: 0.006,
    provider: 'OpenAI',
  },
];