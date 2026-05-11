import { describe, expect, it } from 'vitest';
import { GeminiVideoModels } from '../supported-models/video/gemini';
import { VertexAIVideoModels } from '../supported-models/video/vertex-ai';

describe('video model support', () => {
  it('includes Veo 3.1 models for Gemini and Vertex AI video generation', () => {
    expect(GeminiVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-generate-preview'
    );
    expect(GeminiVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-fast-generate-preview'
    );
    expect(VertexAIVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-generate-001'
    );
    expect(VertexAIVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-fast-generate-001'
    );
    expect(VertexAIVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-generate-preview'
    );
    expect(VertexAIVideoModels.map(model => model.model_id)).toContain(
      'veo-3.1-fast-generate-preview'
    );
  });
});
