import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken } from '../services/AccountingService';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { env } from '../env';

interface CompletionStateBody {
  id: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StreamingChunkBody {
  id: string;
  choices: {
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

const parseSSEGPTFormat = (data: string): StreamingChunkBody[] => {
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];

  for (const event of events) {
    if (!event.trim()) continue;
    if (event.startsWith('data: ')) {
      const jsonStr = event.slice(6);
      if (jsonStr.trim() === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        chunks.push(parsed);
      } catch (error) {
        logger.error(`Error parsing SSE chunk: ${error}`);
      }
    }
  }

  return chunks;
};

export class VercelGatewayProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.VERCEL_GATEWAY;
  }

  getBaseUrl(): string {
    return env.VERCEL_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1/ai';
  }

  getApiKey(): string | undefined {
    return env.VERCEL_GATEWAY_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      let prompt_tokens = 0;
      let completion_tokens = 0;
      let total_tokens = 0;
      let providerId = 'null';

      if (this.getIsStream()) {
        const chunks = parseSSEGPTFormat(data);
        for (const chunk of chunks) {
          if (chunk.usage !== null) {
            prompt_tokens += chunk.usage.prompt_tokens;
            completion_tokens += chunk.usage.completion_tokens;
            total_tokens += chunk.usage.total_tokens;
          }
          providerId = chunk.id || 'null';
        }
      } else {
        const parsed = JSON.parse(data) as CompletionStateBody;
        prompt_tokens += parsed.usage.prompt_tokens;
        completion_tokens += parsed.usage.completion_tokens;
        total_tokens += parsed.usage.total_tokens;
        providerId = parsed.id || 'null';
      }

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
        rawTransactionCost: cost,
        metadata: metadata,
        status: 'success',
      };
    } catch (error) {
      logger.error(`Error processing data: ${error}`);
      throw error;
    }
  }
}
