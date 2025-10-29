import { getCostPerToken } from '../services/AccountingService';
import type { CompletionStateBody, StreamingChunkBody } from './GPTProvider';
import type { LlmTransactionMetadata, Transaction } from '../types';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { Result, ok, err } from 'neverthrow';

export const parseSSEAnthropicGPTFormat = (
  data: string
): Result<StreamingChunkBody[], Error> => {
  // Split by double newlines to separate events
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];

  for (const event of events) {
    if (!event.trim()) continue;

    // Each event should start with 'data: '
    if (!event.startsWith('data: ')) continue;

    const jsonStr = event.slice(6); // Remove 'data: ' prefix
    const trimmed = jsonStr.trim();

    // Skip [DONE] marker
    if (trimmed === '[DONE]') continue;

    // Skip ping events
    if (trimmed.includes('"type": "ping"')) continue;

    const parseResult = Result.fromThrowable(
      () => JSON.parse(trimmed),
      error => new Error(`Error parsing SSE chunk: ${error}`)
    )();

    if (parseResult.isErr()) {
      // Log error but continue processing other events
      logger.warn(parseResult.error.message);
      continue;
    }

    const parsed = parseResult.value;
    // Only add valid chunks that have the expected structure
    if (parsed !== null && typeof parsed === 'object' && 'choices' in parsed) {
      chunks.push(parsed);
    }
  }

  return ok(chunks);
};

export class AnthropicGPTProvider extends GPTProvider {
  override getType(): ProviderType {
    return ProviderType.ANTHROPIC_GPT;
  }

  override getBaseUrl(): string {
    // Anthropic API supports OpenAI API format
    // You just have to add /v1 to the end of the URL
    return `${this.ANTHROPIC_BASE_URL}/v1`;
  }

  override getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  override async handleBody(data: string): Promise<Transaction> {
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';

    if (this.getIsStream()) {
      const chunksResult = parseSSEAnthropicGPTFormat(data);

      if (chunksResult.isErr()) {
        logger.error(`Error parsing SSE data: ${chunksResult.error.message}`);
        throw chunksResult.error;
      }

      const chunks = chunksResult.value;

      for (const chunk of chunks) {
        if (chunk.usage) {
          prompt_tokens += chunk.usage.prompt_tokens;
          completion_tokens += chunk.usage.completion_tokens;
          total_tokens += chunk.usage.total_tokens;
        }
        providerId = chunk.id;
      }
    } else {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(data) as CompletionStateBody,
        error => new Error(`Error parsing completion data: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(`Error processing data: ${parseResult.error.message}`);
        throw parseResult.error;
      }

      const parsed = parseResult.value;
      prompt_tokens += parsed.usage.prompt_tokens;
      completion_tokens += parsed.usage.completion_tokens;
      total_tokens += parsed.usage.total_tokens;
      providerId = parsed.id;
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
  }
}
