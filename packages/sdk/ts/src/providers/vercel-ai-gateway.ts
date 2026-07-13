import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from '@ai-sdk/openai-compatible';

import { ROUTER_BASE_URL } from 'config';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

/**
 * Creates a Vercel AI Gateway provider for the AI SDK.
 *
 * Vercel AI Gateway provides a unified API that proxies requests to
 * underlying AI providers (OpenAI, Anthropic, Google, etc.) with
 * built-in observability, rate limiting, and caching.
 *
 * @see https://vercel.com/docs/ai-gateway
 * @see https://sdk.vercel.ai/providers/ai-sdk-providers/vercel
 */
export function createEchoVercelAIGateway(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void,
  options?: {
    /** Custom gateway base URL. Defaults to the Echo router. */
    gatewayBaseURL?: string;
  }
): OpenAICompatibleProvider {
  validateAppId(appId, 'createEchoVercelAIGateway');

  return createOpenAICompatible({
    name: 'vercel-ai-gateway',
    baseURL: options?.gatewayBaseURL ?? baseRouterUrl,
    headers: {
      'x-echo-app-id': appId,
    },
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
