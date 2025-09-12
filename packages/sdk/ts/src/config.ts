export interface EchoClientConfig {
  baseUrl: string;
  apiKey?: string;
}

export const defaultConfig: EchoClientConfig = {
  baseUrl:
    (typeof process !== 'undefined' && process.env?.ECHO_BASE_URL) ||
    'https://echo.merit.systems',
};

export function getConfig(
  overrides?: Partial<EchoClientConfig>
): EchoClientConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
}

/**
 * Echo Router base URL for proxying AI model requests
 */
export const ROUTER_BASE_URL = 'https://echo.router.merit.systems';

/**
 * Echo base URL for OAuth and token operations
 */
export const ECHO_BASE_URL = 'https://echo.merit.systems';
