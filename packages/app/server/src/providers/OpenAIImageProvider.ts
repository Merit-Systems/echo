import { ImagesResponse } from 'openai/resources/images';
import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '../logger';
import { getImageModelCost } from '../services/AccountingService';
import { Result, ok } from 'neverthrow';

// Use OpenAI SDK's ResponseUsage for non-streaming responses

export const parseSSEImageGenerationFormat = (
  data: string
): Result<ImagesResponse[], Error> => {
  // Split by double newlines to separate complete events
  const eventBlocks = data.split('\n\n');
  const chunks: ImagesResponse[] = [];

  for (const eventBlock of eventBlocks) {
    if (!eventBlock.trim()) continue;

    // Parse event block that may contain multiple lines
    const lines = eventBlock.split('\n');
    let eventType = '';
    let eventData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7); // Remove 'event: ' prefix
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6); // Remove 'data: ' prefix
      }
    }

    // Skip if no data found or if it's a [DONE] marker
    if (!eventData || eventData.trim() === '[DONE]') continue;

    const parseResult = Result.fromThrowable(
      () => JSON.parse(eventData),
      error => new Error(`Error parsing SSE image generation chunk: ${error}`)
    )();

    if (parseResult.isErr()) {
      logger.error(
        'Error parsing SSE image generation chunk:',
        parseResult.error,
        'Event type:',
        eventType,
        'Data:',
        eventData
      );
      // Continue processing other events instead of failing completely
      continue;
    }

    const parsed = parseResult.value;
    // Add the event type to the parsed object for easier identification
    parsed.eventType = eventType;
    chunks.push(parsed);
  }

  return ok(chunks);
};

export class OpenAIImageProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.OPENAI_IMAGES;
  }

  getBaseUrl(reqPath?: string): string {
    if (reqPath && reqPath.startsWith('/v1')) {
      return this.OPENAI_BASE_URL.replace('/v1', '');
    }
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    let input_tokens = 0;
    let output_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';
    let cost = new Decimal(0);

    const parseResult = Result.fromThrowable(
      () => JSON.parse(data) as ImagesResponse,
      error =>
        new Error(`Error parsing OpenAI Image Generation API data: ${error}`)
    )();

    if (parseResult.isErr()) {
      logger.error(`Error processing data: ${parseResult.error.message}`);
      throw parseResult.error;
    }

    const parsed = parseResult.value;

    // Extract usage information if available
    if (parsed.usage) {
      input_tokens = parsed.usage.input_tokens || 0;
      output_tokens = parsed.usage.output_tokens || 0;
      total_tokens = parsed.usage.total_tokens || input_tokens + output_tokens;
    }

    // Use image-specific cost calculation from AccountingService
    if (parsed.usage) {
      const { input_tokens, output_tokens, input_tokens_details } =
        parsed.usage;
      let textTokens = 0;
      let imageInputTokens = 0;
      const imageOutputTokens = output_tokens || 0;

      if (input_tokens_details) {
        // Separate image and text tokens if available
        imageInputTokens = input_tokens_details.image_tokens || 0;
        textTokens = input_tokens_details.text_tokens || 0;
      } else {
        // Fallback: treat all input tokens as image tokens
        imageInputTokens = input_tokens || 0;
      }

      cost = getImageModelCost(
        this.getModel(),
        textTokens,
        imageInputTokens,
        imageOutputTokens
      );
    }

    // Extract provider ID if available
    if (parsed.created) {
      providerId = parsed.created.toString();
    }

    const metadata: LlmTransactionMetadata = {
      model: this.getModel(),
      providerId: providerId,
      provider: this.getType(),
      inputTokens: input_tokens,
      outputTokens: output_tokens,
      totalTokens: total_tokens,
    };

    const transaction: Transaction = {
      metadata: metadata,
      rawTransactionCost: new Decimal(cost),
      status: 'success',
    };

    return transaction;
  }
}
