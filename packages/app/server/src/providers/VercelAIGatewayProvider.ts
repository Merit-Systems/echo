import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken } from '../services/AccountingService';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { parseSSEGPTFormat } from './GPTProvider';
import logger from '../logger';
import { env } from '../env';

interface AIGatewayUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

interface OpenAICompatibleUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface AIGatewayResponseBody {
  id?: string;
  response?: {
    id?: string;
  };
  usage?: AIGatewayUsage | OpenAICompatibleUsage;
}

interface AIGatewayStreamPart {
  type?: string;
  id?: string;
  response?: {
    id?: string;
  };
  usage?: AIGatewayUsage;
}

const ECHO_VERCEL_MODEL_PREFIX = 'vercel/';

function toVercelModelId(model: string): string {
  return model.startsWith(ECHO_VERCEL_MODEL_PREFIX)
    ? model.slice(ECHO_VERCEL_MODEL_PREFIX.length)
    : model;
}

function isAIGatewayUsage(
  usage: AIGatewayUsage | OpenAICompatibleUsage | undefined
): usage is AIGatewayUsage {
  return (
    usage !== undefined &&
    ('inputTokens' in usage ||
      'outputTokens' in usage ||
      'totalTokens' in usage)
  );
}

function parseSSEJsonObjects(data: string): unknown[] {
  const chunks: unknown[] = [];

  for (const event of data.split('\n\n')) {
    const dataLines = event
      .split('\n')
      .filter(line => line.startsWith('data: '))
      .map(line => line.slice(6));

    if (dataLines.length === 0) {
      continue;
    }

    const payload = dataLines.join('\n').trim();
    if (!payload || payload === '[DONE]') {
      continue;
    }

    try {
      chunks.push(JSON.parse(payload));
    } catch (error) {
      logger.error(`Error parsing Vercel AI Gateway SSE chunk: ${error}`);
    }
  }

  return chunks;
}

export class VercelAIGatewayProvider extends BaseProvider {
  private readonly VERCEL_AI_GATEWAY_OPENAI_BASE_URL =
    'https://ai-gateway.vercel.sh/v1';
  private readonly VERCEL_AI_GATEWAY_AI_SDK_BASE_URL =
    'https://ai-gateway.vercel.sh/v1/ai';

  getType(): ProviderType {
    return ProviderType.VERCEL_AI_GATEWAY;
  }

  getBaseUrl(reqPath?: string): string {
    if (
      reqPath?.includes('/language-model') ||
      reqPath?.includes('/embedding-model') ||
      reqPath?.endsWith('/config')
    ) {
      return this.VERCEL_AI_GATEWAY_AI_SDK_BASE_URL;
    }

    return this.VERCEL_AI_GATEWAY_OPENAI_BASE_URL;
  }

  override formatUpstreamUrl(req: { path: string; url: string }): string {
    const query = req.url.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : '';

    if (req.path.endsWith('/language-model')) {
      return `${this.VERCEL_AI_GATEWAY_AI_SDK_BASE_URL}/language-model${query}`;
    }
    if (req.path.endsWith('/embedding-model')) {
      return `${this.VERCEL_AI_GATEWAY_AI_SDK_BASE_URL}/embedding-model${query}`;
    }
    if (req.path.endsWith('/config')) {
      return `${this.VERCEL_AI_GATEWAY_AI_SDK_BASE_URL}/config${query}`;
    }

    return `${this.getBaseUrl(req.path)}${req.path}${query}`;
  }

  getApiKey(): string | undefined {
    return env.AI_GATEWAY_API_KEY;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const formattedHeaders = await super.formatAuthHeaders(headers);

    delete formattedHeaders['AI-Language-Model-Id'];
    delete formattedHeaders['ai-language-model-id'];
    formattedHeaders['ai-language-model-id'] = toVercelModelId(this.getModel());

    return formattedHeaders;
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    if (reqPath.includes('/language-model')) {
      return reqBody;
    }

    return super.ensureStreamUsage(reqBody, reqPath);
  }

  override transformRequestBody(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    if (typeof reqBody.model === 'string') {
      return {
        ...reqBody,
        model: toVercelModelId(reqBody.model),
      };
    }

    return reqBody;
  }

  override supportsStream(): boolean {
    return true;
  }

  private getUsageFromAIResponse(usage: AIGatewayUsage | undefined): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } {
    const promptTokens = usage?.inputTokens ?? 0;
    const completionTokens = usage?.outputTokens ?? 0;
    const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;

    return { promptTokens, completionTokens, totalTokens };
  }

  async handleBody(data: string): Promise<Transaction> {
    try {
      let prompt_tokens = 0;
      let completion_tokens = 0;
      let total_tokens = 0;
      let providerId = 'null';

      if (this.getIsStream()) {
        const chunks = parseSSEJsonObjects(data);

        for (const chunk of chunks) {
          const streamPart = chunk as AIGatewayStreamPart;

          if (streamPart.type === 'finish' && streamPart.usage) {
            const usage = this.getUsageFromAIResponse(streamPart.usage);
            prompt_tokens += usage.promptTokens;
            completion_tokens += usage.completionTokens;
            total_tokens += usage.totalTokens;
          }

          providerId = streamPart.response?.id ?? streamPart.id ?? providerId;
        }

        if (total_tokens === 0) {
          for (const chunk of parseSSEGPTFormat(data)) {
            if (chunk.usage !== null) {
              prompt_tokens += chunk.usage.prompt_tokens;
              completion_tokens += chunk.usage.completion_tokens;
              total_tokens += chunk.usage.total_tokens;
            }
            providerId = chunk.id || providerId;
          }
        }
      } else {
        const parsed = JSON.parse(data) as AIGatewayResponseBody;

        if (isAIGatewayUsage(parsed.usage)) {
          const usage = this.getUsageFromAIResponse(parsed.usage);
          prompt_tokens += usage.promptTokens;
          completion_tokens += usage.completionTokens;
          total_tokens += usage.totalTokens;
          providerId = parsed.response?.id ?? parsed.id ?? 'null';
        } else if (parsed.usage) {
          prompt_tokens += parsed.usage.prompt_tokens ?? 0;
          completion_tokens += parsed.usage.completion_tokens ?? 0;
          total_tokens +=
            parsed.usage.total_tokens ?? prompt_tokens + completion_tokens;
          providerId = parsed.id || 'null';
        } else {
          providerId = parsed.response?.id ?? parsed.id ?? 'null';
        }
      }

      const cost = getCostPerToken(
        this.getModel(),
        prompt_tokens,
        completion_tokens
      );

      const metadata: LlmTransactionMetadata = {
        providerId,
        provider: this.getType(),
        model: this.getModel(),
        inputTokens: prompt_tokens,
        outputTokens: completion_tokens,
        totalTokens: total_tokens,
      };

      return {
        rawTransactionCost: cost,
        metadata,
        status: 'success',
      };
    } catch (error) {
      logger.error(`Error processing data: ${error}`);
      throw error;
    }
  }
}
