import { describe, expect, it } from 'vitest';

import { VertexAIVideoModels } from './vertex-ai';

describe('VertexAIVideoModels', () => {
  it('includes Veo 3.1 preview models with pricing metadata', () => {
    expect(VertexAIVideoModels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cost_per_second_with_audio: 0.15,
          cost_per_second_without_audio: 0.1,
          model_id: 'veo-3.1-fast-generate-preview',
          provider: 'VertexAI',
        }),
        expect.objectContaining({
          cost_per_second_with_audio: 0.4,
          cost_per_second_without_audio: 0.2,
          model_id: 'veo-3.1-generate-preview',
          provider: 'VertexAI',
        }),
      ]),
    );
  });
});
