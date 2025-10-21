import { createEchoGroq, GroqModels } from '@merit-systems/echo-typescript-sdk';
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

export const NON_CHAT_MODELS = [
  'meta-llama/llama-prompt-guard-2-22m',
  'meta-llama/llama-prompt-guard-2-86m',
];

describe.concurrent('Groq streamText per model', () => {
  const groq = createEchoGroq({ appId: ECHO_APP_ID!, baseRouterUrl }, getToken);

  for (const { model_id } of GroqModels) {
    if (NON_CHAT_MODELS.includes(model_id)) {
      continue;
    }
    it(`Groq streamText ${model_id}`, async () => {
      try {
        const { textStream } = streamText({
          model: groq(model_id),
          prompt: 'One-word greeting.',
        });
        let streamed = '';
        for await (const d of textStream) streamed += d;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[generateText] Groq ${model_id} failed: ${details}`);
      }
    });
  }
});
