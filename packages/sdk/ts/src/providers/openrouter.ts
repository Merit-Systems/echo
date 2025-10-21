import {
  createOpenRouter as createOpenRouterBase,
  OpenRouterProvider,
} from '@openrouter/ai-sdk-provider';
import { ROUTER_BASE_URL } from 'config';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

export function createEchoOpenRouter(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): OpenRouterProvider {
  validateAppId(appId, 'createEchoOpenRouter');

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
