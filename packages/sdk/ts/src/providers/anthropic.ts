import {
  AnthropicProvider,
  createAnthropic as createAnthropicBase,
} from '@ai-sdk/anthropic';
import { ROUTER_BASE_URL } from '../config';
import { EchoConfig } from '../types';
import { echoFetch } from './index';

export function createEchoAnthropic(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): AnthropicProvider {
  return createAnthropicBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    headers: {
      // this is safe in Echo because the token is an echo oauth jwt
      // not a long lived anthropic api key
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
