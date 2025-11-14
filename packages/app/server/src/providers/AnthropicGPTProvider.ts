import { getCostPerToken } from '../services/AccountingService';
import type { CompletionStateBody, StreamingChunkBody } from './GPTProvider';
import type { LlmTransactionMetadata, Transaction } from '../types';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { env } from '../env';

const parseSSEAnthropicGPTFormat = (data: string): StreamingChunkBody[] => {
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

    try {
      const parsed = JSON.parse(trimmed);
      // Only add valid chunks that have the expected structure
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'choices' in parsed
      ) {
        chunks.push(parsed);
      }
    } catch (error) {
      // Log error but continue processing other events
      logger.warn(`Error parsing SSE chunk: ${error}`);
      continue;
    }
  }

  return chunks;
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
    return env.ANTHROPIC_API_KEY;
  }

  override async handleBody(data: string): Promise<Transaction> {
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';

    if (this.getIsStream()) {
      const chunks = parseSSEAnthropicGPTFormat(data);

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
