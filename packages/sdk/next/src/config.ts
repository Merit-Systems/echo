import { ECHO_BASE_URL } from '@merit-systems/echo-typescript-sdk';
import type { EchoConfig } from './types';

export function resolveEchoBaseUrl(config: EchoConfig): string {
  return config.baseEchoUrl || ECHO_BASE_URL;
}
