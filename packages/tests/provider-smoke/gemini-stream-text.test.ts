import {
  createEchoGoogle,
  GeminiModels,
} from '@merit-systems/echo-typescript-sdk';
import { streamText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
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
