import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken } from '../services/AccountingService';
import type { CompletionStateBody, StreamingChunkBody } from './GPTProvider';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { env } from '../env';
import { ResultAsync, fromThrowable } from 'neverthrow';

const parseSSEGeminiGPTFormat = (data: string): StreamingChunkBody[] => {
  // Split by double newlines to separate events
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];
  const parseJson = fromThrowable(JSON.parse, error => error);

  for (const event of events) {
    if (!event.trim()) continue;

    // Each event should start with 'data: '
    if (!event.startsWith('data: ')) continue;

    const jsonStr = event.slice(6); // Remove 'data: ' prefix
    const trimmed = jsonStr.trim();

    // Skip [DONE] marker
    if (trimmed === '[DONE]') continue;

    // Skip ping events if any
    if (trimmed.includes('"type": "ping"')) continue;

    const parsedResult = parseJson(trimmed);
    if (parsedResult.isErr()) {
      // Log error but continue processing other events
      logger.warn(`Error parsing SSE chunk: ${parsedResult.error}`);
      continue;
    }

    const parsed = parsedResult.value;
    // Only add valid chunks that have the expected structure
    if (parsed !== null && typeof parsed === 'object' && 'choices' in parsed) {
      chunks.push(parsed as StreamingChunkBody);
    }
  }

  return chunks;
};

export class GeminiGPTProvider extends GPTProvider {
  override getType(): ProviderType {
    return ProviderType.GEMINI_GPT;
  }

  override getBaseUrl(): string {
    // Gemini API supports OpenAI API format at this endpoint
    return this.GEMINI_GPT_BASE_URL;
  }

  override getApiKey(): string | undefined {
    return env.GEMINI_API_KEY;
  }

  override async handleBody(data: string): Promise<Transaction> {
    return ResultAsync.fromPromise(
      (async () => {
        let prompt_tokens = 0;
        let completion_tokens = 0;
        let total_tokens = 0;
        let providerId = 'null';

        if (this.getIsStream()) {
          const chunks = parseSSEGeminiGPTFormat(data);

          for (const chunk of chunks) {
            if (chunk.usage) {
              prompt_tokens += chunk.usage.prompt_tokens;
              completion_tokens += chunk.usage.completion_tokens;
              total_tokens += chunk.usage.total_tokens;
            }
            providerId = chunk.id;
          }
        } else {
          const parsed = JSON.parse(data) as CompletionStateBody;
          prompt_tokens += parsed.usage.prompt_tokens;
          completion_tokens += parsed.usage.completion_tokens;
          total_tokens += parsed.usage.total_tokens;
          providerId = parsed.id;
        }

        const metadata: LlmTransactionMetadata = {
          model: this.getModel(),
          providerId: providerId,
          provider: this.getType(),
          inputTokens: prompt_tokens,
          outputTokens: completion_tokens,
          totalTokens: total_tokens,
        };

        const transaction: Transaction = {
          metadata: metadata,
          rawTransactionCost: getCostPerToken(
            this.getModel(),
            prompt_tokens,
            completion_tokens
          ),
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
