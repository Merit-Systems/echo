import {
  createEchoGoogle,
  GeminiModels,
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

const GEMINI_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-2.5-flash-image-preview',
] as const;

describe.concurrent('Gemini generateText with image generation', () => {
  const google = createEchoGoogle(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const model_id of GEMINI_IMAGE_MODELS) {
    it(`Gemini image ${model_id}`, async () => {
      try {
        const result = await generateText({
          model: google(model_id),
          prompt: 'Generate a simple blue circle',
        });

  
        expect(result).toBeDefined();


        const imageFile = result.files?.find(file =>
          file.mediaType?.startsWith('image/')
        );

        expect(imageFile).toBeDefined();
        expect(imageFile?.mediaType).toMatch(/^image\//);
        expect(imageFile?.base64).toBeDefined();
        expect(imageFile?.base64?.length).toBeGreaterThan(0);
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateText with image] Gemini ${model_id} failed: ${details}`
        );
      }
    });
  }
});
