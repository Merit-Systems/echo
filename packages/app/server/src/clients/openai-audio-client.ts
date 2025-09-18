import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { HttpError } from '../errors/http';
import logger from '../logger';
import FormData from 'form-data';

export interface TranscriptionOptions {
  model: 'whisper-1' | 'whisper-large-v3';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestamp_granularities?: ('word' | 'segment')[];
}

export interface TranscriptionResponse {
  text: string;
  [key: string]: any;
}

export class OpenAIAudioClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async transcribe(
    audioBuffer: Buffer,
    options: TranscriptionOptions
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    
    // Add the audio file
    formData.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mp3',
    });
    
    // Add other parameters
    formData.append('model', options.model);
    
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }
    
    if (options.timestamp_granularities) {
      options.timestamp_granularities.forEach(granularity => {
        formData.append('timestamp_granularities[]', granularity);
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // FormData sets its own content-type with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('OpenAI Audio API Error:', errorData);
        throw new HttpError(
          response.status,
          `OpenAI API Error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data as TranscriptionResponse;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error('OpenAI Audio API Error:', error);
      throw new HttpError(
        500,
        `Failed to transcribe audio: ${(error as Error).message}`
      );
    }
  }

  async translate(
    audioBuffer: Buffer,
    options: Omit<TranscriptionOptions, 'language'>
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    
    // Add the audio file
    formData.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mp3',
    });
    
    // Add other parameters
    formData.append('model', options.model);
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/audio/translations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // FormData sets its own content-type with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('OpenAI Audio API Error:', errorData);
        throw new HttpError(
          response.status,
          `OpenAI API Error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data as TranscriptionResponse;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error('OpenAI Audio API Error:', error);
      throw new HttpError(
        500,
        `Failed to translate audio: ${(error as Error).message}`
      );
    }
  }
}