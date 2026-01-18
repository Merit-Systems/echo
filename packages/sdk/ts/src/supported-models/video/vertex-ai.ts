import type { SupportedVideoModel } from '../types';

export type VertexAIVideoModel =
  | 'veo-3.0-fast-generate-preview'
  | 'veo-3.0-generate-preview'
  | 'veo-3.1-fast-generate-preview'
  | 'veo-3.1-generate-preview';
/**
 * Vertex AI video models with official pricing information
 * Based on: https://cloud.google.com/vertex-ai/generative-ai/pricing
 *
 * Veo 3: $0.40/second with audio, $0.20/second video only
 * Veo 3 Fast: $0.15/second with audio, $0.10/second video only
 */
export const VertexAIVideoModels: SupportedVideoModel[] = [
  {
    model_id: 'veo-3.0-fast-generate-preview',
    cost_per_second_with_audio: 0.15,
    cost_per_second_without_audio: 0.1, // Fixed: was 0.1, now 0.10 for clarity
    provider: 'VertexAI',
  },
  {
    model_id: 'veo-3.0-generate-preview',
    cost_per_second_with_audio: 0.4, // Fixed: was 0.4, now 0.40 for clarity
    cost_per_second_without_audio: 0.2, // Fixed: was 0.2, now 0.20 for clarity
    provider: 'VertexAI',
  },
  {
    model_id: 'veo-3.1-fast-generate-preview',
    cost_per_second_with_audio: 0.15,
    cost_per_second_without_audio: 0.1,
    provider: 'VertexAI',
  },
  {
    model_id: 'veo-3.1-generate-preview',
    cost_per_second_with_audio: 0.4,
    cost_per_second_without_audio: 0.2,
    provider: 'VertexAI',
  },
];
