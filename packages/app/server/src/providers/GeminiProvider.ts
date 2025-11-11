import logger from '../logger';
import { getCostPerToken } from '../services/AccountingService';
import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { GeminiImageGenerationToolPricing } from '@merit-systems/echo-typescript-sdk';
import { Decimal } from '@prisma/client/runtime/library';
import { env } from '../env';

interface GeminiUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

interface GeminiCandidate {
  content: {
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string; // base64 encoded
      };
    }>;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata: GeminiUsage;
}

const parseSSEGeminiFormat = (data: string): GeminiUsage | null => {
  try {
    // First, try to parse as a JSON array (actual Gemini streaming format)
    const parsed = JSON.parse(data);

    if (Array.isArray(parsed)) {
      // Handle JSON array format
      let finalUsage: GeminiUsage | null = null;

      for (const chunk of parsed) {
        if (chunk?.usageMetadata) {
          finalUsage = {
            promptTokenCount: chunk.usageMetadata.promptTokenCount || 0,
            candidatesTokenCount: chunk.usageMetadata.candidatesTokenCount || 0,
            totalTokenCount: chunk.usageMetadata.totalTokenCount || 0,
          };
        }
      }

      return finalUsage;
    } else if (parsed?.usageMetadata) {
      // Handle single object format
      return {
        promptTokenCount: parsed.usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: parsed.usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: parsed.usageMetadata.totalTokenCount || 0,
      };
    }
  } catch {
    // Fallback to SSE format parsing if JSON parsing fails
    const lines = data.split('\n');
    let finalUsage: GeminiUsage | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Handle data: lines
      if (trimmedLine.startsWith('data: ')) {
        const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix

        try {
          const parsed = JSON.parse(jsonStr) as GeminiResponse;

          // Store usage metadata if present
          if (parsed.usageMetadata) {
            finalUsage = {
              promptTokenCount: parsed.usageMetadata.promptTokenCount || 0,
              candidatesTokenCount:
                parsed.usageMetadata.candidatesTokenCount || 0,
              totalTokenCount: parsed.usageMetadata.totalTokenCount || 0,
            };
          }
        } catch (error) {
          logger.error(`Error parsing Gemini SSE chunk: ${error}`);
        }
      }
    }

    return finalUsage;
  }

  return null;
};

export class GeminiProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.GEMINI;
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
    return env.GEMINI_API_KEY;
  }

  override supportsStream(): boolean {
    return false;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No Gemini API key found');
    }
    return {
      ...headers,
      'x-goog-api-key': apiKey,
    };
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      let promptTokens = 0;
      let candidatesTokens = 0;
      let totalTokens = 0;
      let providerId = 'gemini-response';
      let imageCost = new Decimal(0);

      if (this.getIsStream()) {
        const usage = parseSSEGeminiFormat(data);

        if (!usage) {
          console.error('No usage data found in streaming response');
          throw new Error('No usage data found in streaming response');
        }

        promptTokens = usage.promptTokenCount;
        candidatesTokens = usage.candidatesTokenCount;
        totalTokens = usage.totalTokenCount;
      } else {
        const parsed = JSON.parse(data) as GeminiResponse;

        if (parsed?.usageMetadata) {
          promptTokens = parsed.usageMetadata.promptTokenCount || 0;
          candidatesTokens = parsed.usageMetadata.candidatesTokenCount || 0;
          totalTokens = parsed.usageMetadata.totalTokenCount || 0;
        }


        if (parsed?.candidates) {
          for (const candidate of parsed.candidates) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
      
                imageCost = imageCost.plus(
                  new Decimal(GeminiImageGenerationToolPricing.cost_per_image)
                );
                logger.info(
                  `Gemini image generation detected: ${part.inlineData.mimeType}`
                );
              }
            }
          }
        }

        // Try to get a unique identifier from the response
        // Gemini doesn't return an ID like OpenAI, so we'll generate one based on content
        if (parsed?.candidates && parsed.candidates.length > 0) {
          const content = parsed.candidates[0]?.content?.parts?.[0]?.text || '';
          providerId = `gemini-${Date.now()}-${content.substring(0, 10).replace(/\s/g, '')}`;
        }
      }

      logger.info(
        `Gemini usage tokens (prompt/candidates/total): ${promptTokens}/${candidatesTokens}/${totalTokens}`
      );

      const metadata: LlmTransactionMetadata = {
        model: this.getModel(),
        providerId: providerId,
        provider: this.getType(),
        inputTokens: promptTokens,
        outputTokens: candidatesTokens,
        totalTokens: totalTokens,
      };

      const transaction: Transaction = {
        metadata: metadata,
        rawTransactionCost: getCostPerToken(
          this.getModel(),
          promptTokens,
          candidatesTokens
        ).plus(imageCost),
        status: 'success',
      };

      return transaction;
    } catch (error) {
      logger.error(`Error processing Gemini response data: ${error}`);
      throw error;
    }
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    // Gemini includes usage metadata in streaming responses by default
    return reqBody;
  }
}
