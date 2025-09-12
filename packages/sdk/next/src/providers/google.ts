import {
  createEchoGoogle as createEchoGoogleBase,
  EchoConfig,
  GoogleGenerativeAIProvider,
} from '@merit-systems/echo-typescript-sdk';
import { getEchoToken } from '../auth/token-manager';

export function createEchoGoogle(
  config: EchoConfig
): GoogleGenerativeAIProvider {
  return createEchoGoogleBase(config, async () => getEchoToken(config));
}
