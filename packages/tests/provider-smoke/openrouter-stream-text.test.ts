import {
  OpenRouterModels,
  createEchoOpenRouter,
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

describe.concurrent('OpenAI streamText per model', () => {
  const openrouter = createEchoOpenRouter(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenRouterModels) {
    it(`OpenRouter stream ${model_id}`, async () => {
      try {
        const { textStream } = streamText({
          model: openrouter(model_id),
          prompt: 'One-word greeting.',
        });

        let streamed = '';
        for await (const delta of textStream) streamed += delta;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[streamText] OpenRouter ${model_id} failed: ${details}`
        );
      }
    });
  }
});
