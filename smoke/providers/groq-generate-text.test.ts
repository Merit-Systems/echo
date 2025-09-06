import {
  createEchoGroq,
} from '@merit-systems/echo-typescript-sdk';
import { ToolSet, generateText } from 'ai';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('OpenAI generateText per model', () => {
  const openai = createEchoGroq(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

    it(`Groq`, async () => {
      try {
        const { text } = await generateText({
          model: openai('llama-3.1-8b-instant'),
          prompt: 'One-word greeting.',
        });
        expect(text).toBeDefined();
        expect(text).not.toBe('');
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[generateText] Groq failed: ${details}`);
      }
    });
});
