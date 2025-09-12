import {
  createOpenRouter as createOpenRouterBase,
  OpenRouterProvider,
} from '@openrouter/ai-sdk-provider';
import { ROUTER_BASE_URL } from 'config';
import { echoFetch } from './index';
import { EchoConfig } from '../types';

export function createEchoOpenRouter(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): OpenRouterProvider {
  return createOpenRouterBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
