import {
  createEchoGroq as createEchoGroqBase,
  EchoConfig,
  GroqProvider,
} from '@merit-systems/echo-typescript-sdk';
import { getEchoToken } from '../auth/token-manager';

export function createEchoGroq(config: EchoConfig): GroqProvider {
  return createEchoGroqBase(config, async () => getEchoToken(config));
}
