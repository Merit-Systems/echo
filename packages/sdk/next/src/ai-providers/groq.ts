import { getEchoToken } from '../auth/token-manager';
import {
  createEchoGroq as createEchoGroqBase,
  EchoConfig,
  GroqProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoGroq(config: EchoConfig): GroqProvider {
  return createEchoGroqBase(config, async () => getEchoToken(config));
}
