import {
  OpenAIAudioModels,
  createEchoOpenAI,
} from '@merit-systems/echo-typescript-sdk';
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

describe.concurrent('OpenAI audio transcription per model', () => {
  const testAudioPath = path.join(__dirname, 'test-audio', 'sample.wav');

  for (const { model_id } of OpenAIAudioModels) {
    it(`OpenAI audio transcription ${model_id}`, async () => {
      try {
        // Verify test audio exists
        if (!fs.existsSync(testAudioPath)) {
          throw new Error(`Test audio not found at: ${testAudioPath}`);
        }

        // Initialize OpenAI client pointing to Echo
        const client = new OpenAI({
          apiKey: process.env.ECHO_API_KEY || '',
          baseURL: baseRouterUrl,
        });

        // Create file object for OpenAI
        const audioFile = await toFile(
          fs.createReadStream(testAudioPath),
          'sample.wav',
          {
            type: 'audio/wav',
          }
        );

        // Make transcription request using raw OpenAI API
        const response = await client.audio.transcriptions.create({
          model: model_id,
          file: audioFile,
          response_format: 'json',
        });

        // Verify response
        expect(response).toBeDefined();
        expect(response.text).toBeDefined();
        expect(typeof response.text).toBe('string');
        expect(response.text.length).toBeGreaterThan(0);
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[audioTranscription] OpenAI ${model_id} failed: ${details}`
        );
      }
    });
  }
});

describe.concurrent('OpenAI audio translation per model', () => {
  const testAudioPath = path.join(__dirname, 'test-audio', 'sample.wav');

  for (const { model_id } of OpenAIAudioModels) {
    it(`OpenAI audio translation ${model_id}`, async () => {
      try {
        // Verify test audio exists
        if (!fs.existsSync(testAudioPath)) {
          throw new Error(`Test audio not found at: ${testAudioPath}`);
        }

        // Initialize OpenAI client pointing to Echo
        const client = new OpenAI({
          apiKey: process.env.ECHO_API_KEY || '',
          baseURL: baseRouterUrl,
        });

        // Create file object for OpenAI
        const audioFile = await toFile(
          fs.createReadStream(testAudioPath),
          'sample.wav',
          {
            type: 'audio/wav',
          }
        );

        // Make translation request using raw OpenAI API
        const response = await client.audio.translations.create({
          model: model_id,
          file: audioFile,
          response_format: 'json',
        });

        // Verify response
        expect(response).toBeDefined();
        expect(response.text).toBeDefined();
        expect(typeof response.text).toBe('string');
        expect(response.text.length).toBeGreaterThan(0);
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(
          `[audioTranslation] OpenAI ${model_id} failed: ${details}`
        );
      }
    });
  }
});
