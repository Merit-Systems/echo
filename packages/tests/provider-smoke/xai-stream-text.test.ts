import { createEchoXAI, XAIModels } from '@merit-systems/echo-typescript-sdk';
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

export const NON_CHAT_MODELS = [] as string[];

describe.concurrent('xAI (Grok) streamText per model', () => {
  const xai = createEchoXAI({ appId: ECHO_APP_ID!, baseRouterUrl }, getToken);

  for (const { model_id } of XAIModels) {
    if (NON_CHAT_MODELS.includes(model_id)) {
      continue;
    }
    it(`xAI streamText ${model_id}`, async () => {
      try {
        const { textStream } = streamText({
          model: xai(model_id),
          prompt: 'One-word greeting.',
        });
        let streamed = '';
        for await (const d of textStream) streamed += d;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[streamText] xAI ${model_id} failed: ${details}`);
      }
    });
  }

  // Test xAI Live Search with searchParameters (correct approach)
  if (XAIModels.length > 0) {
    const modelId = XAIModels[0]!.model_id;
    it(`xAI streamText with Live Search (searchParameters): ${modelId}`, async () => {
      try {
        const { textStream, sources } = streamText({
          model: xai(modelId),
          prompt: 'What happened in tech news today? (one sentence)',
          providerOptions: {
            xai: {
              searchParameters: {
                mode: 'auto',
                returnCitations: true,
                sources: ['web', 'x'],
              },
            },
          },
        });
        let streamed = '';
        for await (const d of textStream) streamed += d;
        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');

        const resolvedSources = await sources;
        if (resolvedSources && resolvedSources.length > 0) {
          console.log(`✓ Search returned ${resolvedSources.length} sources`);
        }
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[streamText+search] xAI ${modelId} failed: ${details}`
        );
      }
    });
  }
});
