import {
  createEchoGoogle,
  GeminiModels,
} from '@merit-systems/echo-typescript-sdk';
import { streamText } from 'ai';
import { BLACKLISTED_MODELS } from 'gemini-generate-text.test';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertEnv,
  baseRouterUrl,
  ECHO_APP_ID,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('Gemini streamText per model', () => {
  const gemini = createEchoGoogle(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of GeminiModels) {
    if (BLACKLISTED_MODELS.has(model_id)) {
      console.log('Skipping generateText for blacklisted model', model_id);
      continue;
    }
    it(`Gemini streamText ${model_id}`, async () => {
      try {
        const { textStream } = streamText({
          model: gemini(model_id),
          prompt: 'One-word greeting.',
        });
        let streamed = '';
        for await (const d of textStream) streamed += d;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[generateText] Gemini ${model_id} failed: ${details}`);
      }
    });
  }
});
