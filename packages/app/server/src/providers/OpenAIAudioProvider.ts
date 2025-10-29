import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import OpenAI from 'openai';

export class OpenAIAudioProvider extends BaseProvider {
  private client: OpenAI;

  constructor(stream: boolean, model: string) {
    super(stream, model);
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is required for audio provider');
    }
    this.client = new OpenAI({ apiKey });
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
      const audioResponse = JSON.parse(data) as {
        text: string;
        duration?: number;
        language?: string;
      };
      
      const durationSeconds = audioResponse.duration || 0;
      const durationMinutes = durationSeconds / 60;
      const costPerMinute = 0.006;
      const totalCost = new Decimal(durationMinutes * costPerMinute);

      const transaction: Transaction = {
        metadata: {
          providerId: 'openai-audio',
          provider: 'openai',
          model: this.getModel(),
          durationSeconds,
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
    // OpenAI supports streaming for audio with verbose_json response format
    return true;
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    return reqBody;
  }

  override transformRequestBody(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    // Force verbose_json format to get duration field for cost calculation
    return {
      ...reqBody,
      response_format: 'verbose_json'
    };
  }
}