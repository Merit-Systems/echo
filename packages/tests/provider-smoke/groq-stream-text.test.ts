import {
  createEchoGoogle,
  createEchoGroq,
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

export const NON_CHAT_MODELS = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-thinking-exp',
];

describe.concurrent('Groq streamText per model', () => {
  const groq = createEchoGroq({ appId: ECHO_APP_ID!, baseRouterUrl }, getToken);

  for (const { model_id } of GeminiModels) {
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
