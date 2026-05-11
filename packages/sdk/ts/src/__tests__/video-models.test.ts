import { VertexAIVideoModels } from '../supported-models/video/vertex-ai';

describe('Vertex AI video models', () => {
  it('includes Veo 3.1 model variants', () => {
    const modelIds = VertexAIVideoModels.map(model => model.model_id);

    expect(modelIds).toContain('veo-3.1-fast-generate-001');
    expect(modelIds).toContain('veo-3.1-generate-001');
    expect(modelIds).toContain('veo-3.1-fast-generate-preview');
    expect(modelIds).toContain('veo-3.1-generate-preview');
  });

  it('uses current Veo 3.1 Vertex AI pricing', () => {
    expect(
      VertexAIVideoModels.find(
        model => model.model_id === 'veo-3.1-fast-generate-001'
      )
    ).toMatchObject({
      cost_per_second_with_audio: 0.12,
      cost_per_second_without_audio: 0.1,
      provider: 'VertexAI',
    });

    expect(
      VertexAIVideoModels.find(
        model => model.model_id === 'veo-3.1-generate-001'
      )
    ).toMatchObject({
      cost_per_second_with_audio: 0.4,
      cost_per_second_without_audio: 0.2,
      provider: 'VertexAI',
    });
  });
});
