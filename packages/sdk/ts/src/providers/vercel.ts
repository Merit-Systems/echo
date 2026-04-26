import {
  createGateway,
  GatewayLanguageModelEntry,
  GatewayProvider,
  GatewayProviderSettings,
} from '@ai-sdk/gateway';
import { ROUTER_BASE_URL } from 'config';
import { VercelAIGatewayModels } from '../supported-models/chat/vercel';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

export const ECHO_VERCEL_AI_GATEWAY_MODEL_PREFIX = 'vercel/';

export function toEchoVercelAIGatewayModelId(modelId: string): string {
  return modelId.startsWith(ECHO_VERCEL_AI_GATEWAY_MODEL_PREFIX)
    ? modelId
    : `${ECHO_VERCEL_AI_GATEWAY_MODEL_PREFIX}${modelId}`;
}

function toGatewayBaseUrl(baseRouterUrl: string): string {
  const normalized = baseRouterUrl.replace(/\/+$/, '');
  return normalized.endsWith('/v1/ai') ? normalized : `${normalized}/v1/ai`;
}

function toGatewayModelEntry(modelId: string): GatewayLanguageModelEntry {
  const model = VercelAIGatewayModels.find(m => m.model_id === modelId);
  return {
    id: modelId,
    name: modelId.replace(ECHO_VERCEL_AI_GATEWAY_MODEL_PREFIX, ''),
    pricing: model
      ? {
          input: String(model.input_cost_per_token),
          output: String(model.output_cost_per_token),
        }
      : null,
    specification: {
      specificationVersion: 'v2',
      provider: 'gateway',
      modelId,
    },
    modelType: 'language',
  };
}

export function createEchoVercelAIGateway(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void,
  settings: Omit<GatewayProviderSettings, 'baseURL' | 'apiKey' | 'fetch'> = {}
): GatewayProvider {
  validateAppId(appId, 'createEchoVercelAIGateway');

  const gateway = createGateway({
    ...settings,
    baseURL: toGatewayBaseUrl(baseRouterUrl),
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });

  const echoGateway = ((modelId: string) =>
    gateway(toEchoVercelAIGatewayModelId(modelId))) as GatewayProvider;

  Object.assign(echoGateway, gateway, {
    languageModel: (modelId: string) =>
      gateway.languageModel(toEchoVercelAIGatewayModelId(modelId)),
    getAvailableModels: async () => ({
      models: VercelAIGatewayModels.map(model =>
        toGatewayModelEntry(model.model_id)
      ),
    }),
  });

  return echoGateway;
}
