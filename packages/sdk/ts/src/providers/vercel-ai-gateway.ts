import { createOpenAI } from '@ai-sdk/openai';
import { ROUTER_BASE_URL } from '../config';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

export function createEchoVercelAIGateway(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
) {
  validateAppId(appId, 'createEchoVercelAIGateway');

  return createOpenAI({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
