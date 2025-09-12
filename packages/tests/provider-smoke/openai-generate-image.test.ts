import {
  OpenAIImageModels,
  createEchoOpenAI,
} from '@merit-systems/echo-typescript-sdk';
import { experimental_generateImage as generateImage } from 'ai';
import OpenAI, { toFile } from 'openai';
import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('OpenAI generateImage per model', () => {
  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  for (const { model_id } of OpenAIImageModels) {
    it(`OpenAI image ${model_id}`, async () => {
      try {
        const { image } = await generateImage({
          model: openai.image(model_id),
          prompt: 'An incredibly fat cat',
          size: '1024x1024',
          providerOptions: { openai: { quality: 'low' } },
        });
        expect(image).toBeDefined();
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[generateImage] OpenAI ${model_id} failed: ${details}`
        );
      }
    });
  }
});

describe.concurrent('OpenAI editImage per model', () => {
  const testImagePath = path.join(__dirname, 'test-image', 'PNG_Test.png');

  for (const { model_id } of OpenAIImageModels) {
    it(`OpenAI image edit ${model_id}`, async () => {
      try {
        // Verify test image exists
        if (!fs.existsSync(testImagePath)) {
          throw new Error(`Test image not found at: ${testImagePath}`);
        }

        // Initialize OpenAI client pointing to Echo
        const client = new OpenAI({
          apiKey: process.env.ECHO_API_KEY || '',
          baseURL: baseRouterUrl,
        });

        // Create file object for OpenAI
        const imageFile = await toFile(
          fs.createReadStream(testImagePath),
          'test-image.png',
          {
            type: 'image/png',
          }
        );

        // Make image edit request using raw OpenAI API
        const response = await client.images.edit({
          model: model_id,
          image: imageFile,
          prompt: 'Put this T-shirt on a man',
        });

        // Verify response
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBeGreaterThan(0);
        expect(response.data?.[0]).toBeDefined();
        expect(
          response.data?.[0]?.b64_json || response.data?.[0]?.url
        ).toBeDefined();
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[editImage] OpenAI ${model_id} failed: ${details}`);
      }
    });
  }
});
