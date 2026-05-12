import { describe, expect, it } from 'vitest';

import { VertexAIVideoModels } from './vertex-ai';

describe('VertexAIVideoModels', () => {
  it('includes Veo 3.1 preview models with current Vertex AI pricing', () => {
    expect(VertexAIVideoModels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          model_id: 'veo-3.1-fast-generate-preview',
          cost_per_second_with_audio: 0.1,
          cost_per_second_without_audio: 0.08,
          provider: 'VertexAI',
        }),
        expect.objectContaining({
          model_id: 'veo-3.1-generate-preview',
          cost_per_second_with_audio: 0.4,
          cost_per_second_without_audio: 0.2,
          provider: 'VertexAI',
        }),
      ])
    );
  });
});
