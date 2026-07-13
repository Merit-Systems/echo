import { describe, it, expect } from 'vitest';
import { VercelGatewayModels } from '../src/supported-models/chat/vercel-gateway';

describe('VercelGatewayModels', () => {
  it('should export a non-empty array of models', () => {
    expect(VercelGatewayModels.length).toBeGreaterThan(0);
  });

  it('should have all models with VercelGateway provider', () => {
    for (const model of VercelGatewayModels) {
      expect(model.provider).toBe('VercelGateway');
    }
  });

  it('should have valid pricing for all models', () => {
    for (const model of VercelGatewayModels) {
      expect(model.input_cost_per_token).toBeGreaterThan(0);
      expect(model.output_cost_per_token).toBeGreaterThan(0);
    }
  });

  it('should have prefixed model IDs (provider/model-name)', () => {
    for (const model of VercelGatewayModels) {
      expect(model.model_id).toMatch(/^[a-z]+\/[a-z0-9._-]+$/);
    }
  });

  it('should include key OpenAI models', () => {
    const ids = VercelGatewayModels.map(m => m.model_id);
    expect(ids).toContain('openai/gpt-4o');
    expect(ids).toContain('openai/gpt-4o-mini');
  });

  it('should include key Anthropic models', () => {
    const ids = VercelGatewayModels.map(m => m.model_id);
    expect(ids).toContain('anthropic/claude-sonnet-4');
    expect(ids).toContain('anthropic/claude-3.5-sonnet');
  });

  it('should include key Google models', () => {
    const ids = VercelGatewayModels.map(m => m.model_id);
    expect(ids).toContain('google/gemini-2.5-flash');
    expect(ids).toContain('google/gemini-2.5-pro');
  });
});
