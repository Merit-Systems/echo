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
  shouldSkipModelInTests,
} from './test-helpers';

beforeAll(assertEnv);

const BLACKLISTED_MODELS = new Set([
  'deepseek/deepseek-r1-distill-qwen-14b',
  'qwen/qwen3-30b-a3b',
  'thudm/glm-z1-32b',
  'qwen/qwen3-coder',
]);

describe.concurrent('OpenAI streamText per model', () => {
  const openrouter = createEchoOpenRouter(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenRouterModels) {
    if (shouldSkipModelInTests(model_id)) {
      continue;
    }
    if (BLACKLISTED_MODELS.has(model_id)) {
      console.log('Skipping streamText for blacklisted model', model_id);
      continue;
    }
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
    }); // 45 second timeout per test
  }
});
