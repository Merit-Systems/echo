import { getEchoToken } from '../auth/token-manager';
import {
  createEchoVercelAIGateway as createEchoVercelAIGatewayBase,
  EchoConfig,
  VercelAIGatewayProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoVercelAIGateway(
  config: EchoConfig
): VercelAIGatewayProvider {
  return createEchoVercelAIGatewayBase(config, async () =>
    getEchoToken(config)
  );
}
