import { getEchoToken } from '../auth/token-manager';
import {
  createEchoOpenAI as createEchoOpenAIBase,
  EchoConfig,
  OpenAIProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoOpenAI(config: EchoConfig): OpenAIProvider {
  return createEchoOpenAIBase(config, async () => getEchoToken(config));
}
