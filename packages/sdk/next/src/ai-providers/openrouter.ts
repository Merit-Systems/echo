import { getEchoToken } from '../auth/token-manager';
import {
  createEchoOpenRouter as createEchoOpenRouterBase,
  EchoConfig,
  OpenRouterProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoOpenRouter(config: EchoConfig): OpenRouterProvider {
  return createEchoOpenRouterBase(config, async () => getEchoToken(config));
}
