import { createEchoGroq, GroqModels } from '@merit-systems/echo-typescript-sdk';
import { generateText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertEnv,
  baseRouterUrl,
  ECHO_APP_ID,
  getApiErrorDetails,
  getToken,
} from './test-helpers';
import { NON_CHAT_MODELS } from 'groq-stream-text.test';

beforeAll(assertEnv);

describe.concurrent('Groq generateText per model', () => {
  const groq = createEchoGroq({ appId: ECHO_APP_ID!, baseRouterUrl }, getToken);

  for (const { model_id } of GroqModels) {
    if (NON_CHAT_MODELS.includes(model_id)) {
      continue;
    }
    it(`Groq ${model_id}`, async () => {
      try {
        const { text } = await generateText({
          model: groq(model_id),
          prompt: 'One-word greeting.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[generateText] Groq ${model_id} failed: ${details}`);
      }
    });
  }
});
