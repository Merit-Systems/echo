import { SupportedImageModel } from '../types';

export type OpenAIImageModel = 'gpt-image-1';

export const OpenAIImageModels: SupportedImageModel[] = [
  {
    model_id: 'gpt-image-1',
    image_input_cost_per_token: 10.0 / 1_000_000,
    image_output_cost_per_token: 40.0 / 1_000_000,
    text_input_cost_per_token: 5.0 / 1_000_000,
    provider: 'OpenAI',
  },
];
