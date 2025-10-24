import { getEchoToken } from '../auth/token-manager';
import {
  createEchoXAI as createEchoXAIBase,
  EchoConfig,
  XAIProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoXAI(config: EchoConfig): XAIProvider {
  return createEchoXAIBase(config, async () => getEchoToken(config));
}
