import {
  createEchoGoogle,
  GeminiModels,
} from '@merit-systems/echo-typescript-sdk';
import { generateText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertEnv,
  baseRouterUrl,
  ECHO_APP_ID,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('Gemini generateText per model', () => {
  const gemini = createEchoGoogle(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of GeminiModels) {
    it(`Gemini ${model_id}`, async () => {
      try {
        const { text } = await generateText({
          model: gemini(model_id),
          prompt: 'One-word greeting.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateText] Anthropic ${model_id} failed: ${details}`
        );
      }
    });
  }
});
