import {
  createOpenAI as createOpenAIBase,
  OpenAIProvider,
} from '@ai-sdk/openai';
import { ROUTER_BASE_URL } from 'config';
import { echoFetch } from './index';
import { EchoConfig } from '../types';

export function createEchoOpenAI(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): OpenAIProvider {
  return createOpenAIBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
