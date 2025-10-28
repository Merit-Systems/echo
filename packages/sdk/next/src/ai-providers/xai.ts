import { getEchoToken } from '../auth/token-manager';
import {
  createEchoXAI as createEchoXAIBase,
  EchoConfig,
  XaiProvider,
} from '@merit-systems/echo-typescript-sdk';

export function createEchoXAI(config: EchoConfig): XaiProvider {
  return createEchoXAIBase(config, async () => getEchoToken(config));
}
