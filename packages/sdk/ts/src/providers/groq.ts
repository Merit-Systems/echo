import { createGroq as createGroqBase, GroqProvider } from '@ai-sdk/groq';
import { ROUTER_BASE_URL } from 'config';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

export function createEchoGroq(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): GroqProvider {
  validateAppId(appId, 'createEchoGroq');

  return createGroqBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
