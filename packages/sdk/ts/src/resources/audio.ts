import { HttpClient } from '../http-client';
import { BaseResource } from '../utils/error-handling';
import { SupportedAudioModel } from '../supported-models';

export interface TranscriptionOptions {
  model: SupportedAudioModel;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestamp_granularities?: ('word' | 'segment')[];
}

export interface TranslationOptions {
  model: SupportedAudioModel;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface TranscriptionResponse {
  text: string;
  task?: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    tokens?: number[];
    temperature?: number;
    avg_logprob?: number;
    compression_ratio?: number;
    no_speech_prob?: number;
  }>;
}

export class AudioResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Transcribes audio to text using Whisper API
   * 
   * @param file Audio file to transcribe
   * @param options Transcription options
   * @returns Transcription result
   */
  async transcribe(
    file: File | Blob,
    options: TranscriptionOptions
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', options.model.toString());
    
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString());
    if (options.timestamp_granularities) {
      options.timestamp_granularities.forEach(granularity => {
        formData.append('timestamp_granularities[]', granularity);
      });
    }

    // Use request directly to avoid JSON.stringify on FormData
    const response = await this.http.request('/v1/audio/transcriptions', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary parameter
        'Content-Type': undefined as any,
      }
    });
    
    const data = await response.json();
    return data as TranscriptionResponse;
  }

  /**
   * Translates audio directly to English text using Whisper API
   * 
   * @param file Audio file to translate
   * @param options Translation options
   * @returns Translation result
   */
  async translate(
    file: File | Blob,
    options: TranslationOptions
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', options.model.toString());
    
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString());

    // Use request directly to avoid JSON.stringify on FormData
    const response = await this.http.request('/v1/audio/translations', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary parameter
        'Content-Type': undefined as any,
      }
    });
    
    const data = await response.json();
    return data as TranscriptionResponse;
  }
}