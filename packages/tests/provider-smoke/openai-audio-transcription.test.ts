import { describe, expect, it, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { experimental_transcribe as transcribe } from 'ai';
import {
  OpenAIAudioModels,
  createEchoOpenAI,
} from '@merit-systems/echo-typescript-sdk';
import {
  ECHO_APP_ID,
  assertEnv,
  baseRouterUrl,
  getApiErrorDetails,
  getToken,
} from './test-helpers';

beforeAll(assertEnv);

describe.concurrent('OpenAI Audio Transcription', () => {
  const testAudioPath = path.join(__dirname, 'test-audio', 'sample.wav');

  beforeAll(() => {
    if (!fs.existsSync(testAudioPath)) {
      throw new Error(`Test audio file not found: ${testAudioPath}`);
    }
  });

  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID!, baseRouterUrl },
    getToken
  );

  // Test transcriptions for all audio models
  for (const { model_id } of OpenAIAudioModels) {
    it(`${model_id} transcription`, async () => {
      try {
        const audioFile = fs.readFileSync(testAudioPath);
        
        const { text } = await transcribe({
          model: openai.transcription(model_id),
          audio: audioFile,
        });

        expect(text).toBeDefined();
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(0);
      } catch (err) {
        const details = getApiErrorDetails(err);
        throw new Error(`[transcription] ${model_id} failed: ${details}`);
      }
    });
  }
});