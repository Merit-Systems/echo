import FormData from 'form-data';
import { File } from 'buffer';
import fetch from 'node-fetch';

export interface TranscriptionOptions {
  model: 'whisper-1' | 'whisper-large-v3';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface TranslationOptions {
  model: 'whisper-1' | 'whisper-large-v3';
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface AudioTranscriptionResponse {
  text: string;
  task?: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}

export class OpenAIAudioClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribe(
    audioBuffer: Buffer,
    filename: string,
    options: TranscriptionOptions
  ): Promise<AudioTranscriptionResponse> {
    const formData = new FormData();
    
    // Create File from buffer for multipart upload
    const file = new File([audioBuffer], filename, { type: 'audio/wav' });
    formData.append('file', file.stream(), {
      filename: filename,
      contentType: 'audio/wav',
    });
    
    formData.append('model', options.model);
    
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString());

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Audio API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<AudioTranscriptionResponse>;
  }

  /**
   * Translate audio to English using OpenAI Whisper API
   */
  async translate(
    audioBuffer: Buffer,
    filename: string,
    options: TranslationOptions
  ): Promise<AudioTranscriptionResponse> {
    const formData = new FormData();
    
    // Create File from buffer for multipart upload
    const file = new File([audioBuffer], filename, { type: 'audio/wav' });
    formData.append('file', file.stream(), {
      filename: filename,
      contentType: 'audio/wav',
    });
    
    formData.append('model', options.model);
    
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString());

    const response = await fetch(`${this.baseUrl}/audio/translations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Audio API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<AudioTranscriptionResponse>;
  }
}