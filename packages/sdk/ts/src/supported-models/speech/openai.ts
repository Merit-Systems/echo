import { SupportedSpeechModel } from '../types';

export type OpenAISpeechModel = 'tts-1' | 'tts-1-hd';

export const OpenAISpeechModels: SupportedSpeechModel[] = [
  {
    model_id: 'tts-1',
    cost_per_character: 0.000015, // $15 per 1M characters
    provider: 'OpenAI',
  },
  {
    model_id: 'tts-1-hd',
    cost_per_character: 0.00003, // $30 per 1M characters
    provider: 'OpenAI',
  },
];
