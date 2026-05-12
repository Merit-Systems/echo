import { describe, expect, it } from 'vitest';

import { VercelAIGatewayProvider } from '../providers/VercelAIGatewayProvider';
import { ProviderType } from '../providers/ProviderType';
import { getModelPrice } from '../services/AccountingService';

describe('VercelAIGatewayProvider', () => {
  it('routes Echo-scoped Vercel model IDs to the Vercel AI Gateway API', () => {
    const provider = new VercelAIGatewayProvider(
      false,
      'vercel-ai-gateway/openai/gpt-5-mini'
    );

    const transformedBody = provider.transformRequestBody({
      model: 'vercel-ai-gateway/openai/gpt-5-mini',
    });

    expect(provider.getType()).toBe(ProviderType.VERCEL_AI_GATEWAY);
    expect(provider.getBaseUrl()).toBe('https://ai-gateway.vercel.sh/v1');
    expect(transformedBody.model).toBe('openai/gpt-5-mini');
  });

  it('exposes Vercel AI Gateway pricing under a non-conflicting Echo model ID', () => {
    expect(getModelPrice('vercel-ai-gateway/openai/gpt-5-mini')).toMatchObject({
      provider: 'Vercel',
      model: 'vercel-ai-gateway/openai/gpt-5-mini',
    });
  });
});
