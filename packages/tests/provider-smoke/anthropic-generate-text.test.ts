import {
  AnthropicModels,
  createEchoAnthropic,
} from '@merit-systems/echo-typescript-sdk';
import { generateText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('Anthropic generateText per model', () => {
  const anthropic = createEchoAnthropic(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of AnthropicModels) {
    it(`Anthropic ${model_id}`, async () => {
      try {
        const { text } = await generateText({
          model: anthropic(model_id),
          prompt: 'One-word greeting.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateText] Anthropic ${model_id} failed: ${details}`
        );
      }
    });
  }
});
