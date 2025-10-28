import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { getCostPerToken } from '../services/AccountingService';
import logger from '../logger';
import { Result, ok, err } from 'neverthrow';

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

export const parseSSEGPTFormat = (
  data: string
): Result<StreamingChunkBody[], Error> => {
  // Split by double newlines to separate events
  const events = data.split('\n\n');
  const chunks: StreamingChunkBody[] = [];

  for (const event of events) {
    if (!event.trim()) continue;

    // Each event should start with 'data: '
    if (event.startsWith('data: ')) {
      const jsonStr = event.slice(6); // Remove 'data: ' prefix

      // Skip [DONE] marker
      if (jsonStr.trim() === '[DONE]') continue;

      const parseResult = Result.fromThrowable(
        () => JSON.parse(jsonStr),
        error => new Error(`Error parsing SSE chunk: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(parseResult.error.message);
        return err(parseResult.error);
      }

      chunks.push(parseResult.value);
    }
  }

  return ok(chunks);
};

export class OpenRouterProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.OPENROUTER;
  }

  getBaseUrl(): string {
    return this.OPENROUTER_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';

    if (this.getIsStream()) {
      const chunksResult = parseSSEGPTFormat(data);

      if (chunksResult.isErr()) {
        logger.error(`Error parsing SSE data: ${chunksResult.error.message}`);
        throw chunksResult.error;
      }

      const chunks = chunksResult.value;

      for (const chunk of chunks) {
        if (chunk.usage && chunk.usage !== null) {
          prompt_tokens += chunk.usage.prompt_tokens;
          completion_tokens += chunk.usage.completion_tokens;
          total_tokens += chunk.usage.total_tokens;
        }
        providerId = chunk.id || 'null';
      }
    } else {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(data) as CompletionStateBody,
        error => new Error(`Error parsing JSON data: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(`Error processing data: ${parseResult.error.message}`);
        throw parseResult.error;
      }

      const parsed = parseResult.value;
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
      metadata: metadata,
      rawTransactionCost: cost,
      status: 'success',
    };
  }
}
