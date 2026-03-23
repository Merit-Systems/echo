import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken } from '../services/AccountingService';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { env } from '../env';
import { ResultAsync, fromThrowable } from 'neverthrow';

export interface CompletionStateBody {
  id: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamingChunkBody {
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

export const parseSSEGPTFormat = (data: string): StreamingChunkBody[] => {
  // Split by double newlines to separate events
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];
  const parseJson = fromThrowable(JSON.parse, error => error);

  for (const event of events) {
    if (!event.trim()) continue;

    // Each event should start with 'data: '
    if (event.startsWith('data: ')) {
      const jsonStr = event.slice(6); // Remove 'data: ' prefix

      // Skip [DONE] marker
      if (jsonStr.trim() === '[DONE]') continue;

      const parsedResult = parseJson(jsonStr);
      if (parsedResult.isErr()) {
        logger.error(`Error parsing SSE chunk: ${parsedResult.error}`);
        continue;
      }

      chunks.push(parsedResult.value as StreamingChunkBody);
    }
  }

  return chunks;
};

export class GPTProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.GPT;
  }

  getBaseUrl(): string {
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return env.OPENAI_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    return ResultAsync.fromPromise(
      (async () => {
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

        const transaction: Transaction = {
          rawTransactionCost: cost,
          metadata: metadata,
          status: 'success',
        };

        return transaction;
      })(),
      error => {
        logger.error(`Error processing data: ${error}`);
        return error;
      }
    ).match(
      transaction => transaction,
      error => {
        throw error;
      }
    );
  }
}
