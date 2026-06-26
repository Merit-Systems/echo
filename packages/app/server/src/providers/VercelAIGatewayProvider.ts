import { LlmTransactionMetadata, Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { getCostPerToken } from '../services/AccountingService';
import logger from '../logger';
import { env } from '../env';

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

const VERCEL_AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1/ai';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const readUsage = (value: unknown): TokenUsage => {
  if (!value || typeof value !== 'object') {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  const record = value as Record<string, unknown>;
  const usage =
    record.usage && typeof record.usage === 'object'
      ? (record.usage as Record<string, unknown>)
      : record;

  const inputTokens =
    toNumber(usage.inputTokens) ||
    toNumber(usage.promptTokens) ||
    toNumber(usage.prompt_tokens) ||
    toNumber(usage.input_tokens);
  const outputTokens =
    toNumber(usage.outputTokens) ||
    toNumber(usage.completionTokens) ||
    toNumber(usage.completion_tokens) ||
    toNumber(usage.output_tokens);
  const totalTokens =
    toNumber(usage.totalTokens) ||
    toNumber(usage.total_tokens) ||
    inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
};

const parseStreamUsage = (data: string): TokenUsage => {
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;

  for (const line of data.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'data: [DONE]') continue;

    const jsonLine = trimmed.startsWith('data: ')
      ? trimmed.slice('data: '.length)
      : trimmed;

    try {
      const parsed = JSON.parse(jsonLine);
      const usage = readUsage(parsed);
      inputTokens += usage.inputTokens;
      outputTokens += usage.outputTokens;
      totalTokens += usage.totalTokens;
    } catch {
      // The AI SDK stream may include non-JSON protocol frames; ignore those.
    }
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens: totalTokens || inputTokens + outputTokens,
  };
};

export class VercelAIGatewayProvider extends BaseProvider {
  getType(): ProviderType {
    return ProviderType.VERCEL_AI_GATEWAY;
  }

  getBaseUrl(): string {
    return VERCEL_AI_GATEWAY_BASE_URL;
  }

  getApiKey(): string | undefined {
    return env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const formattedHeaders = await super.formatAuthHeaders(headers);

    return {
      ...formattedHeaders,
      'ai-gateway-protocol-version':
        headers['ai-gateway-protocol-version'] || '0.0.1',
      'ai-gateway-auth-method': env.AI_GATEWAY_API_KEY ? 'api-key' : 'oidc',
    };
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      const usage = this.getIsStream()
        ? parseStreamUsage(data)
        : readUsage(JSON.parse(data));

      const cost = getCostPerToken(
        this.getModel(),
        usage.inputTokens,
        usage.outputTokens
      );

      const metadata: LlmTransactionMetadata = {
        providerId: 'null',
        provider: this.getType(),
        model: this.getModel(),
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      };

      return {
        metadata,
        rawTransactionCost: cost,
        status: 'success',
      };
    } catch (error) {
      logger.error(`Error processing Vercel AI Gateway data: ${error}`);
      throw error;
    }
  }
}
