import {
  VercelAIGatewayModels,
  createEchoVercelAIGateway,
} from '@merit-systems/echo-typescript-sdk';
import { streamText } from 'ai';
import { BLACKLISTED_GATEWAY_MODELS } from './vercel-ai-gateway-generate-text.test';
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

describe.concurrent('Vercel AI Gateway streamText per model', () => {
  const vercelGateway = createEchoVercelAIGateway(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of VercelAIGatewayModels) {
    if (
      BLACKLISTED_GATEWAY_MODELS.has(model_id) ||
      shouldSkipModelInTests(model_id)
    ) {
      console.log('Skipping streamText for blacklisted/slow model', model_id);
      continue;
    }

    it(`Vercel AI Gateway stream ${model_id}`, async () => {
      try {
        const { textStream } = streamText({
          model: vercelGateway(model_id),
          prompt: 'Say hello in one word.',
        });

        let streamed = '';
        for await (const delta of textStream) {
          streamed += delta;
        }

        expect(streamed).toBeDefined();
        expect(streamed).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[streamText] Vercel AI Gateway ${model_id} failed: ${details}`
        );
      }
    });
  }
});

