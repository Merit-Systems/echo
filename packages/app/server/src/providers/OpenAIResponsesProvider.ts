import {
  Response,
  ResponseStreamEvent,
  Tool,
} from 'openai/resources/responses/responses';
import {
  getCostPerToken,
  calculateToolCost,
} from '../services/AccountingService';
import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '../logger';
import { Result, ok, } from 'neverthrow';

export const parseSSEResponsesFormat = (
  data: string
): Result<ResponseStreamEvent[], Error> => {
  // Split by double newlines to separate complete events
  const eventBlocks = data.split('\n\n');
  const chunks: ResponseStreamEvent[] = [];

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
      error => new Error(`Error parsing SSE chunk: ${error}`)
    )();

    if (parseResult.isErr()) {
      logger.error(
        'Error parsing SSE chunk:',
        parseResult.error,
        'Event type:',
        eventType,
        'Data:',
        eventData
      );
      continue;
    }

    const parsed = parseResult.value;
    // Add the event type to the parsed object for easier identification
    parsed.eventType = eventType;
    chunks.push(parsed);
  }

  return ok(chunks);
};

export class OpenAIResponsesProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.OPENAI_RESPONSES;
  }

  getBaseUrl(): string {
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
    let tool_cost = new Decimal(0);

    if (this.getIsStream()) {
      const chunksResult = parseSSEResponsesFormat(data);

      if (chunksResult.isErr()) {
        logger.error(`Error parsing SSE data: ${chunksResult.error.message}`);
        throw chunksResult.error;
      }

      const chunks = chunksResult.value;

      for (const chunk of chunks) {
        // Look for the response.completed event which contains the final usage data
        if (chunk.type === 'response.completed' && chunk.response?.usage) {
          input_tokens = chunk.response.usage.input_tokens || 0;
          output_tokens = chunk.response.usage.output_tokens || 0;
          total_tokens = chunk.response.usage.total_tokens || 0;
          providerId = chunk.response.id || 'null';

          tool_cost = chunk.response.tools.reduce((acc, tool) => {
            return acc.plus(calculateToolCost(tool));
          }, new Decimal(0));
        }
        // Fallback to any chunk with usage data if no completed event found
        else if (chunk && 'response' in chunk && chunk.response?.usage) {
          input_tokens += chunk.response.usage.input_tokens || 0;
          output_tokens += chunk.response.usage.output_tokens || 0;
          total_tokens += chunk.response.usage.total_tokens || 0;
          providerId = chunk.response?.id || 'null';
        }
        // Keep track of providerId from any chunk
        else if (chunk && 'response' in chunk && chunk.response?.id) {
          providerId = chunk.response?.id || 'null';
        }
      }
    } else {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(data) as Response,
        error => new Error(`Error parsing completion data: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(`Error processing data: ${parseResult.error.message}`);
        throw parseResult.error;
      }

      const parsed = parseResult.value;
      input_tokens += parsed.usage?.input_tokens || 0;
      output_tokens += parsed.usage?.output_tokens || 0;
      total_tokens += parsed.usage?.total_tokens || 0;
      providerId = parsed.id || 'null';
      tool_cost = parsed.tools.reduce((acc, tool) => {
        return acc.plus(calculateToolCost(tool));
      }, new Decimal(0));
    }

    const metadata: LlmTransactionMetadata = {
      model: this.getModel(),
      providerId: providerId,
      provider: this.getType(),
      inputTokens: input_tokens,
      outputTokens: output_tokens,
      totalTokens: total_tokens,
      toolCost: tool_cost,
    };

    const transaction: Transaction = {
      metadata: metadata,
      rawTransactionCost: getCostPerToken(
        this.getModel(),
        input_tokens,
        output_tokens
      ).plus(tool_cost),
      status: 'success',
    };

    return transaction;
  }

  // Override ensureStreamUsage since Responses API doesn't use stream_options
  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    _reqPath: string
  ): Record<string, unknown> {
    // Responses API handles usage tracking differently - no need to modify the request
    return reqBody;
  }
}
