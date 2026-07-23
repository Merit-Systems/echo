import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { getCostPerToken } from '../services/AccountingService';
import logger from '../logger';
import { parseSSEGPTFormat, CompletionStateBody } from './GPTProvider';


export class VercelAIGatewayProvider extends BaseProvider {
  protected readonly VERCEL_AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';

  getType(): ProviderType {
    return ProviderType.VERCEL_AI_GATEWAY;
  }

  getBaseUrl(): string {
    return this.VERCEL_AI_GATEWAY_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.AI_GATEWAY_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      let prompt_tokens = 0;
      let completion_tokens = 0;
      let total_tokens = 0;
      let providerId = 'null';

      if (this.getIsStream()) {
        // Parse Server-Sent Events (SSE) format for streaming responses
        const chunks = parseSSEGPTFormat(data);

        for (const chunk of chunks) {
          if (chunk.usage && chunk.usage !== null) {
            prompt_tokens += chunk.usage.prompt_tokens;
            completion_tokens += chunk.usage.completion_tokens;
            total_tokens += chunk.usage.total_tokens;
          }
          providerId = chunk.id || 'null';
        }
      } else {
        // Parse non-streaming response
        const parsed = JSON.parse(data) as CompletionStateBody;
        prompt_tokens += parsed.usage.prompt_tokens;
        completion_tokens += parsed.usage.completion_tokens;
        total_tokens += parsed.usage.total_tokens;
        providerId = parsed.id || 'null';
      }

      // Calculate cost based on token usage
      const cost = getCostPerToken(
        this.getModel(),
        prompt_tokens,
        completion_tokens
      );

      const metadata: LlmTransactionMetadata = {
        providerId: providerId,
        provider: this.getType(),
        model: this.getModel(),
        inputTokens: prompt_tokens,
        outputTokens: completion_tokens,
        totalTokens: total_tokens,
      };

      return {
        metadata: metadata,
        rawTransactionCost: cost,
        status: 'success',
      };
    } catch (error) {
      logger.error(`Error processing Vercel AI Gateway response: ${error}`);
      throw error;
    }
  }
}

