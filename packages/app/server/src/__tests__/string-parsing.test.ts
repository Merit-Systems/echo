import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

import { extractGeminiModelName } from '../utils/gemini/string-parsing';

describe('extractGeminiModelName', () => {
  it('extracts model names from full Vertex AI project paths', () => {
    const req = {
      path: '/v1/projects/test-project/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001:predictLongRunning',
    } as unknown as Request;

    expect(extractGeminiModelName(req)).toBe('veo-3.1-fast-generate-001');
  });
});
