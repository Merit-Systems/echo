import {
  createEchoVercelAIGateway as createEchoVercelAIGatewayBase,
  EchoConfig,
} from '@merit-systems/echo-typescript-sdk';
import { getEchoToken } from '../auth/token-manager';


export function createEchoVercelAIGateway(config: EchoConfig) {
  return createEchoVercelAIGatewayBase(config, async () => getEchoToken(config));
}

