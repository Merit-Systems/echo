import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { OpenAIAudioClient, AudioTranscriptionResponse } from '../clients/openai-audio-client';

export class OpenAIAudioProvider extends BaseProvider {
  private audioClient: OpenAIAudioClient;

  constructor(stream: boolean, model: string) {
    super(stream, model);
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is required for audio provider');
    }
    this.audioClient = new OpenAIAudioClient(apiKey);
  }

  getType(): ProviderType {
    return ProviderType.OPENAI_AUDIO;
  }

  getBaseUrl(): string {
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      const audioResponse: AudioTranscriptionResponse = JSON.parse(data);
      
     
      const duration = audioResponse.duration || 0;
      const durationMinutes = duration / 60;

      // Cost per minute for Whisper models (as per OpenAI pricing)
      const costPerMinute = 0.006;
      const totalCost = new Decimal(durationMinutes * costPerMinute);

      const transaction: Transaction = {
        metadata: {
          providerId: 'openai-audio',
          provider: 'openai',
          model: this.getModel(),
          durationSeconds: durationMinutes * 60,
          generateAudio: false
        },
        rawTransactionCost: totalCost,
        status: 'success',
      };

      logger.info('Audio transcription transaction:', {
        model: this.getModel(),
        cost: totalCost.toNumber(),
        durationMinutes,
        userId: this.getUserId(),
      });

      return transaction;
    } catch (error) {
      logger.error('Error processing audio response:', error);
      throw error;
    }
  }

  override supportsStream(): boolean {
    return false; // Audio transcription doesn't support streaming
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    // Audio endpoints don't support streaming
    return reqBody;
  }

  override transformRequestBody(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    // No transformation needed for audio requests
    return reqBody;
  }
}