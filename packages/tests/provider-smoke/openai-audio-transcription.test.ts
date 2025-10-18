import { describe, expect, it, beforeAll } from 'vitest';
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

describe.concurrent('OpenAI Audio Transcription', () => {
  const testAudioPath = path.join(__dirname, 'test-audio', 'sample.wav');

  // Ensure test audio file exists
  beforeAll(() => {
    if (!fs.existsSync(testAudioPath)) {
      throw new Error(`Test audio file not found: ${testAudioPath}`);
    }
  });

  it('whisper-1 transcription', async () => {
    try {
      const audioBuffer = fs.readFileSync(testAudioPath);
      const formData = new FormData();
      
      // Create Blob from buffer for multipart upload
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'sample.wav');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const token = await getToken();
      const response = await fetch(`${baseRouterUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-App-Id': ECHO_APP_ID!,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json() as { text: string; duration?: number };
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    } catch (err) {
      const details = getApiErrorDetails(err);
      throw new Error(`[transcription] whisper-1 failed: ${details}`);
    }
  });

  it('whisper-large-v3 transcription', async () => {
    try {
      const audioBuffer = fs.readFileSync(testAudioPath);
      const formData = new FormData();
      
      // Create Blob from buffer for multipart upload
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'sample.wav');
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');

      const token = await getToken();
      const response = await fetch(`${baseRouterUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-App-Id': ECHO_APP_ID!,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json() as { text: string; duration?: number };
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    } catch (err) {
      const details = getApiErrorDetails(err);
      throw new Error(`[transcription] whisper-large-v3 failed: ${details}`);
    }
  });

  it('whisper-1 translation', async () => {
    try {
      const audioBuffer = fs.readFileSync(testAudioPath);
      const formData = new FormData();
      
      // Create Blob from buffer for multipart upload
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'sample.wav');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const token = await getToken();
      const response = await fetch(`${baseRouterUrl}/audio/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-App-Id': ECHO_APP_ID!,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json() as { text: string; duration?: number };
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    } catch (err) {
      const details = getApiErrorDetails(err);
      throw new Error(`[translation] whisper-1 failed: ${details}`);
    }
  });

  it('whisper-large-v3 translation', async () => {
    try {
      const audioBuffer = fs.readFileSync(testAudioPath);
      const formData = new FormData();
      
      // Create Blob from buffer for multipart upload
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'sample.wav');
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');

      const token = await getToken();
      const response = await fetch(`${baseRouterUrl}/audio/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-App-Id': ECHO_APP_ID!,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json() as { text: string; duration?: number };
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
    } catch (err) {
      const details = getApiErrorDetails(err);
      throw new Error(`[translation] whisper-large-v3 failed: ${details}`);
    }
  });
});