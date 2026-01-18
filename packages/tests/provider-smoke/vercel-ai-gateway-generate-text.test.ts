import {
  VercelAIGatewayModels,
  createEchoVercelAIGateway,
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

// Vercel AI Gateway models that may have issues or are too slow
export const BLACKLISTED_GATEWAY_MODELS = new Set([
  // Add any problematic Gateway models here
]);

describe.concurrent('Vercel AI Gateway generateText per model', () => {
  const vercelGateway = createEchoVercelAIGateway(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of VercelAIGatewayModels) {
    if (
      BLACKLISTED_GATEWAY_MODELS.has(model_id) ||
      shouldSkipModelInTests(model_id)
    ) {
      console.log(
        'Skipping generateText for blacklisted/slow model',
        model_id
      );
      continue;
    }

    it(`Vercel AI Gateway ${model_id}`, async () => {
      try {
        const { text } = await generateText({
          model: vercelGateway(model_id),
          prompt: 'Say hello in one word.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateText] Vercel AI Gateway ${model_id} failed: ${details}`
        );
      }
    });
  }
});

