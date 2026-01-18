import { SupportedTranscriptionModel } from '../types';


export type OpenAITranscriptionModel = 'whisper-1';

export const OpenAITranscriptionModels: SupportedTranscriptionModel[] = [
  {
    model_id: 'whisper-1',
    cost_per_second: 0.0001, // $0.006 per minute = $0.0001 per second
    provider: 'OpenAI',
  },
];
