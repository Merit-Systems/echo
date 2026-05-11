import { describe, expect, it, vi } from 'vitest';

import { ProviderType } from '../providers/ProviderType';
import { GeminiVeoProvider } from '../providers/GeminiVeoProvider';
import { getProvider } from '../providers/ProviderFactory';
import { VertexAIProvider } from '../providers/VertexAIProvider';

vi.mock('../server', () => ({
  prisma: {},
}));

vi.mock('../services/DbService', () => ({
  EchoDbService: class EchoDbService {
    confirmAccessControl(): Promise<boolean> {
      return Promise.resolve(true);
    }
  },
}));

vi.mock('../providers/OpenAIVideoProvider', () => ({
  OpenAIVideoProvider: class OpenAIVideoProvider {},
}));

describe('getProvider', () => {
  it('routes shared Veo 3.1 preview model IDs by request path', () => {
    expect(
      getProvider(
        'veo-3.1-fast-generate-preview',
        false,
        '/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning'
      )
    ).toBeInstanceOf(GeminiVeoProvider);

    expect(
      getProvider(
        'veo-3.1-fast-generate-preview',
        false,
        '/v1/publishers/google/models/veo-3.1-fast-generate-preview:predictLongRunning'
      )
    ).toBeInstanceOf(VertexAIProvider);
  });

  it('routes Veo 3.1 GA Vertex AI model IDs to the Vertex AI provider', () => {
    expect(
      getProvider(
        'veo-3.1-fast-generate-001',
        false,
        '/v1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning'
      ).getType()
    ).toBe(ProviderType.VERTEX_AI);
  });
});

describe('VertexAIProvider', () => {
  it('normalizes Google SDK publisher paths when formatting upstream URLs', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';

    const provider = new VertexAIProvider(false, 'veo-3.1-fast-generate-001');

    expect(
      provider.formatUpstreamUrl({
        path: '/v1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning',
        url: '/v1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning?alt=json',
      })
    ).toBe(
      'https://aiplatform.googleapis.com/v1/projects/test-project/locations/global/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning?alt=json'
    );
  });
});
