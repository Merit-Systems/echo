import {
  AnthropicProvider,
  createEchoAnthropic as createEchoAnthropicBase,
  EchoConfig,
} from '@merit-systems/echo-typescript-sdk';
import { getEchoToken } from '../auth/token-manager';

export function createEchoAnthropic(config: EchoConfig): AnthropicProvider {
  return createEchoAnthropicBase(config, async () => getEchoToken(config));
}
