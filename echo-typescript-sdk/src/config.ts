export interface EchoConfig {
  baseUrl: string;
  apiKey?: string;
}

export const defaultConfig: EchoConfig = {
  baseUrl: process.env.ECHO_BASE_URL || 'http://localhost:3000',
};

export function getConfig(overrides?: Partial<EchoConfig>): EchoConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
} 