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

export const BLACKLISTED_MODELS = new Set([
  'gpt-4o-search-preview-2025-03-11',
  'gpt-3.5-turbo-instruct',
  'gpt-3.5-turbo-instruct-0914',
  'gpt-5-pro',
  'gpt-5-pro-2025-10-06',
  'o1-pro',
  'o3-deep-research',
  'o3-deep-research-2025-06-26',
  'o3-pro',
  'o3-pro-2025-06-10',
  'o1-mini-2024-09-12',
  'gpt-3.5-turbo-16k',
  'gpt-4o-mini-search-preview',
  'gpt-4o-mini-search-preview-2025-03-11',
  'gpt-4o-search-preview',
  'gpt-5-search-api',
  'gpt-5-search-api-2025-10-14',
  'o1-mini',
  'o1-pro-2025-03-19',
  'o3-2025-04-16',
]);

describe.concurrent('OpenAI generateText per model', () => {
  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenAIModels) {
    if (BLACKLISTED_MODELS.has(model_id)) {
      console.log('Skipping generateText for blacklisted model', model_id);
      continue;
    }
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
