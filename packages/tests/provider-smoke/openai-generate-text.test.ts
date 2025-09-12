import {
  OpenAIModels,
  createEchoOpenAI,
} from '@merit-systems/echo-typescript-sdk';
import { ToolSet, generateText } from 'ai';
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

describe.concurrent('OpenAI generateText per model', () => {
  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenAIModels) {
    it(`OpenAI ${model_id}`, async () => {
      try {
        const tools = getOpenAITools(openai, model_id);
        const { text } = await generateText({
          model: openai(model_id),
          prompt: 'One-word greeting.',
          tools: tools as ToolSet,
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[generateText] OpenAI ${model_id} failed: ${details}`);
      }
    });
  }
});
