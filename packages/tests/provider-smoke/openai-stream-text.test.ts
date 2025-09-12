import {
  OpenAIModels,
  createEchoOpenAI,
} from '@merit-systems/echo-typescript-sdk';
import { ToolSet, streamText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getOpenAITools,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('OpenAI streamText per model', () => {
  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenAIModels) {
    it(`OpenAI stream ${model_id}`, async () => {
      try {
        const tools = getOpenAITools(openai, model_id);
        const { textStream } = streamText({
          model: openai(model_id),
          prompt: 'One-word greeting.',
          tools: tools as ToolSet,
        });

        let streamed = '';
        for await (const delta of textStream) streamed += delta;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[streamText] OpenAI ${model_id} failed: ${details}`);
      }
    });
  }
});
