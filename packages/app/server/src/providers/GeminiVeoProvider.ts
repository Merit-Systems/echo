import { Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { Decimal } from '@prisma/client/runtime/library';

export interface VeoUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface VeoResponse {
  usage?: VeoUsage;
  id?: string;
  // Add other Veo3 response fields as needed
}

export class GeminiVeoProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.GEMINI_VEO;
  }

  getBaseUrl(reqPath?: string): string {
    // For Gemini native API, we use the Google AI API endpoint
    if (reqPath && reqPath.startsWith('/v1beta')) {
      return 'https://generativelanguage.googleapis.com';
    } else {
      return 'https://generativelanguage.googleapis.com/v1beta';
    }
  }

  getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  override supportsStream(): boolean {
    // Veo3 video generation is typically async/long-running, not streaming
    return true;
  }

  override formatAuthHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No Gemini API key found for Veo3');
    }

    // Veo3 uses Google's API key format, not Bearer token
    return {
      ...headers,
      'x-goog-api-key': apiKey,
    };
  }

  async handleBody(data: string): Promise<Transaction> {
    // Left unimplemented as requested
    return {
      metadata: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        model: this.getModel(),
        providerId: 'null',
        provider: this.getType(),
      },
      rawTransactionCost: new Decimal(0),
      status: 'success',
    };
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    // Veo3 doesn't use streaming, so no special stream usage handling needed
    return reqBody;
  }
}
