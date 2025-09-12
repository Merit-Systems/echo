import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { LlmTransactionMetadata } from '../types';
import logger from '../logger';
import { Decimal } from '@prisma/client/runtime/library';

export class OpenAIAudioProvider extends BaseProvider {
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