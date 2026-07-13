import { getEchoToken } from '../auth/token-manager';
import {
  createEchoVercelGateway as createEchoVercelGatewayBase,
  EchoConfig,
  GatewayProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoVercelGateway(config: EchoConfig): GatewayProvider {
  return createEchoVercelGatewayBase(config, async () => getEchoToken(config));
}
