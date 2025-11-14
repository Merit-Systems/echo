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
import { env } from '../env';

const parseSSEResponsesFormat = (data: string): ResponseStreamEvent[] => {
  const eventBlocks = data.split('\n\n');
  const chunks: ResponseStreamEvent[] = [];

  for (const eventBlock of eventBlocks) {
    if (!eventBlock.trim()) continue;

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

    if (!eventData || eventData.trim() === '[DONE]') continue;

    try {
      const parsed = JSON.parse(eventData);
      parsed.eventType = eventType;
      chunks.push(parsed);
    } catch (error) {
      logger.error(
        'Error parsing SSE chunk:',
        error,
        'Event type:',
        eventType,
        'Data:',
        eventData
      );
    }
  }

  return chunks;
};

export class OpenAIResponsesProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.OPENAI_RESPONSES;
  }

  getBaseUrl(): string {
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return env.OPENAI_API_KEY;
  }

  async handleBody(data: string): Promise<Transaction> {
    let input_tokens = 0;
    let output_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';
    let tool_cost = new Decimal(0);

    if (this.getIsStream()) {
      const chunks = parseSSEResponsesFormat(data);

      for (const chunk of chunks) {
        if (chunk.type === 'response.completed' && chunk.response?.usage) {
          input_tokens = chunk.response.usage.input_tokens || 0;
          output_tokens = chunk.response.usage.output_tokens || 0;
          total_tokens = chunk.response.usage.total_tokens || 0;
          providerId = chunk.response.id || 'null';

          tool_cost = chunk.response.tools.reduce((acc, tool) => {
            return acc.plus(calculateToolCost(tool));
          }, new Decimal(0));
        }
        else if (chunk && 'response' in chunk && chunk.response?.usage) {
          input_tokens += chunk.response.usage.input_tokens || 0;
          output_tokens += chunk.response.usage.output_tokens || 0;
          total_tokens += chunk.response.usage.total_tokens || 0;
          providerId = chunk.response?.id || 'null';
        }
        else if (chunk && 'response' in chunk && chunk.response?.id) {
          providerId = chunk.response?.id || 'null';
        }
      }
    } else {
      const parsed = JSON.parse(data) as Response;
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

  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    _reqPath: string
  ): Record<string, unknown> {
    return reqBody;
  }
}
