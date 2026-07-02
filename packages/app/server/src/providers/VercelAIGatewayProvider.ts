import { env } from '../env';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';

export class VercelAIGatewayProvider extends GPTProvider {
  private readonly VERCEL_AI_GATEWAY_BASE_URL =
    'https://ai-gateway.vercel.sh/v1';
  private readonly MODEL_PREFIX = 'vercel-ai-gateway/';

  override getType(): ProviderType {
    return ProviderType.VERCEL_AI_GATEWAY;
  }

  override getBaseUrl(): string {
    return this.VERCEL_AI_GATEWAY_BASE_URL;
  }

  override getApiKey(): string | undefined {
    return env.AI_GATEWAY_API_KEY ?? env.VERCEL_AI_GATEWAY_API_KEY;
  }

  override transformRequestBody(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    if (
      typeof reqBody.model === 'string' &&
      reqBody.model.startsWith(this.MODEL_PREFIX)
    ) {
      reqBody.model = reqBody.model.slice(this.MODEL_PREFIX.length);
    }

    return reqBody;
  }
}
