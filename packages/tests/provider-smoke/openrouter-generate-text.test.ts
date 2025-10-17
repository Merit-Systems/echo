import {
  OpenRouterModels,
  createEchoOpenRouter,
} from '@merit-systems/echo-typescript-sdk';
import { generateText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getToken,
  shouldSkipModelInTests,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('OpenRouter generateText per model', () => {
  const openrouter = createEchoOpenRouter(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenRouterModels) {
    if (shouldSkipModelInTests(model_id)) {
      continue;
    }

    it(`OpenRouter generateText ${model_id}`, async () => {
      try {
        const { text } = await generateText({
          model: openrouter(model_id),
          prompt: 'One-word greeting.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateText] OpenRouter ${model_id} failed: ${details}`
        );
      }
    }); // 15 second timeout per test
  }
});
