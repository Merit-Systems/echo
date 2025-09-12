import {
  createGoogleGenerativeAI as createGoogleBase,
  GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import { ROUTER_BASE_URL } from 'config';
import { EchoConfig } from '../types';
import { echoFetch } from './index';

export function createEchoGoogle(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): GoogleGenerativeAIProvider {
  return createGoogleBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
