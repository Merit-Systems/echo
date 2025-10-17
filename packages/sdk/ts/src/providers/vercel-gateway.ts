import {
  createGateway as createGatewayBase,
  GatewayProvider,
} from '@ai-sdk/gateway';
import { ROUTER_BASE_URL } from 'config';
import { EchoConfig } from '../types';
import { validateAppId } from '../utils/validation';
import { echoFetch } from './index';

export function createEchoVercelGateway(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): GatewayProvider {
  validateAppId(appId, 'createEchoVercelGateway');

  return createGatewayBase({
    baseURL: baseRouterUrl,
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: echoFetch(
      fetch,
      async () => await getTokenFn(appId),
      onInsufficientFunds
    ),
  });
}
