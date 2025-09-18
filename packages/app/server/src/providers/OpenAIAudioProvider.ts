import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { LlmTransactionMetadata } from '../types';
import logger from '../logger';
import { Decimal } from '@prisma/client/runtime/library';
import { OpenAIAudioClient, TranscriptionOptions, TranscriptionResponse } from '../clients/openai-audio-client';
import { HttpError } from '../errors/http';
import { EchoControlService } from '../services/EchoControlService';

export class OpenAIAudioProvider extends BaseProvider {
  private audioClient: OpenAIAudioClient;

  constructor(
    echoControlService: EchoControlService,
    stream: boolean,
    model: string
  ) {
    super(echoControlService, stream, model);
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is required for audio transcription');
    }
    this.audioClient = new OpenAIAudioClient(apiKey, this.OPENAI_BASE_URL);
  }

  getType(): ProviderType {
    return ProviderType.OPENAI_AUDIO;
  }

  getBaseUrl(reqPath?: string): string {
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  override formatAuthHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      Authorization: `Bearer ${this.getApiKey()}`,
    };
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    // Audio transcription doesn't use streaming
    return reqBody;
  }
  
  /**
   * Transcribe audio using the OpenAI Whisper API
   * 
   * @param audioBuffer - The audio buffer to transcribe
   * @param options - Transcription options
   * @returns The transcription result
   */
  async transcribeAudio(audioBuffer: Buffer, options: TranscriptionOptions): Promise<TranscriptionResponse> {
    try {
      logger.info(`Transcribing audio with model: ${options.model}`);
      return await this.audioClient.transcribe(audioBuffer, options);
    } catch (error) {
      logger.error('OpenAI Audio transcription error:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, `Failed to transcribe audio: ${(error as Error).message}`);
    }
  }

  /**
   * Translate audio directly to English using the OpenAI Whisper API
   * 
   * @param audioBuffer - The audio buffer to translate
   * @param options - Translation options
   * @returns The translation result
   */
  async translateAudio(audioBuffer: Buffer, options: Omit<TranscriptionOptions, 'language'>): Promise<TranscriptionResponse> {
    try {
      logger.info(`Translating audio with model: ${options.model}`);
      return await this.audioClient.translate(audioBuffer, options);
    } catch (error) {
      logger.error('OpenAI Audio translation error:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, `Failed to translate audio: ${(error as Error).message}`);
    }
  }

  async handleBody(data: string): Promise<{
    metadata: LlmTransactionMetadata;
    rawTransactionCost: Decimal;
    status: string;
  }> {
    try {
      const parsed = JSON.parse(data);
      
      // Calculate cost based on duration (Whisper charges per minute)
      // Default to 1 second if duration is not available
      const durationSeconds = parsed.duration || 1;
      const durationMinutes = durationSeconds / 60;
      
      // Apply the Whisper cost of $0.006 per minute
      const cost = new Decimal(0.006).mul(durationMinutes);

      // Generate a unique provider ID
      const providerId = `openai-audio-${Date.now()}`;

      // Use seconds as a proxy for tokens since audio doesn't use tokens
      const outputTokens = Math.ceil(durationSeconds);

      return {
        metadata: {
          providerId,
          provider: this.getType(),
          model: 'whisper-1',
          inputTokens: 0, // Audio doesn't use input tokens
          outputTokens,
          totalTokens: outputTokens,
          // Include additional metadata as custom properties
          audioData: {
            durationSeconds,
            responseFormat: parsed.format || 'json',
            characterCount: parsed.text?.length || 0,
          },
        },
        rawTransactionCost: cost,
        status: 'success',
      };
    } catch (error) {
      logger.error('Error processing audio response data:', error);
      throw error;
    }
  }
}