import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken } from '../services/AccountingService';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { Result, ok } from 'neverthrow';

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  id: string;
  model: string;
}

export const parseSSEAnthropicFormat = (
  data: string
): Result<AnthropicUsage | null, Error> => {
  // Split by lines to process each SSE event
  const lines = data.split('\n');
  let currentEvent = '';
  let currentData = '';

  let messageStartUsage: Partial<AnthropicUsage> = {};
  let messageDeltaUsage: Partial<AnthropicUsage> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    if (line.startsWith('event: ')) {
      currentEvent = line.substring(7); // Remove 'event: ' prefix
    } else if (line.startsWith('data: ')) {
      currentData = line.substring(6); // Remove 'data: ' prefix

      const parseResult = Result.fromThrowable(
        () => JSON.parse(currentData),
        error => new Error(`Error parsing Anthropic SSE chunk: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(parseResult.error.message);
        continue;
      }

      const parsed = parseResult.value;

      // Handle message_start event - contains initial usage and model info
      if (parsed.type === 'message_start' && parsed.message) {
        const message = parsed.message;
        if (message.usage && message.id && message.model) {
          messageStartUsage = {
            input_tokens: message.usage.input_tokens || 0,
            output_tokens: message.usage.output_tokens || 0,
            id: message.id,
            model: message.model,
          };
        }
      }

      // Handle message_delta event - contains final output token count
      if (parsed.type === 'message_delta' && parsed.usage) {
        messageDeltaUsage = {
          output_tokens: parsed.usage.output_tokens || 0,
        };
      }

      // Also handle complete message responses (non-streaming)
      if (
        parsed.type === 'message' &&
        parsed.usage &&
        parsed.id &&
        parsed.model
      ) {
        return ok({
          input_tokens: parsed.usage.input_tokens || 0,
          output_tokens: parsed.usage.output_tokens || 0,
          id: parsed.id,
          model: parsed.model,
        });
      }
    }
  }

  // Combine usage data from message_start and message_delta
  if (messageStartUsage.id && messageStartUsage.model) {
    return ok({
      input_tokens: messageStartUsage.input_tokens || 0,
      output_tokens:
        messageDeltaUsage.output_tokens || messageStartUsage.output_tokens || 0,
      id: messageStartUsage.id,
      model: messageStartUsage.model,
    });
  }

  return ok(null);
};

export class AnthropicNativeProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.ANTHROPIC_NATIVE;
  }

  getBaseUrl(reqPath?: string): string {
    if (reqPath && reqPath.startsWith('/v1')) {
      return this.ANTHROPIC_BASE_URL;
    } else {
      return this.ANTHROPIC_BASE_URL + '/v1';
    }
  }

  getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No API key found');
    }
    return {
      ...headers,
      'x-api-key': apiKey,
    };
  }

  override async handleBody(data: string): Promise<Transaction> {
    if (this.getIsStream()) {
      const usageResult = parseSSEAnthropicFormat(data);

      if (usageResult.isErr()) {
        logger.error(`Error parsing SSE data: ${usageResult.error.message}`);
        throw usageResult.error;
      }

      const usage = usageResult.value;

      if (!usage) {
        logger.error('No usage data found');
        throw new Error('No usage data found');
      }

      const model = this.getModel();
      const metadata: LlmTransactionMetadata = {
        model: model,
        providerId: usage.id,
        provider: this.getType(),
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
      };
      const transaction: Transaction = {
        metadata: metadata,
        rawTransactionCost: getCostPerToken(
          model,
          usage.input_tokens,
          usage.output_tokens
        ),
        status: 'success',
      };

      return transaction;
    } else {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(data),
        error => new Error(`Error parsing JSON data: ${error}`)
      )();

      if (parseResult.isErr()) {
        logger.error(`Error processing data: ${parseResult.error.message}`);
        throw parseResult.error;
      }

      const parsed = parseResult.value;

      const inputTokens = parsed.usage.input_tokens || 0;
      const outputTokens = parsed.usage.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;

      logger.info(
        'Usage tokens (input/output/total): ',
        inputTokens,
        outputTokens,
        totalTokens
      );
      logger.info(`Message ID: ${parsed.id}`);

      const metadata: LlmTransactionMetadata = {
        model: this.getModel(),
        providerId: parsed.id,
        provider: this.getType(),
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        totalTokens: totalTokens,
      };

      const transaction: Transaction = {
        metadata: metadata,
        rawTransactionCost: getCostPerToken(
          this.getModel(),
          inputTokens,
          outputTokens
        ),
        status: 'success',
      };

      return transaction;
    }
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    // usage is always included in the response
    return reqBody;
  }
}
