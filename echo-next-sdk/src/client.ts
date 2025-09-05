import { EchoClient, EchoConfig } from '@merit-systems/echo-typescript-sdk';

export interface EchoClientConfig {
  basePath?: string;
}

/**
 * Sign in to Echo (client-side only)
 */
export function signIn(config?: EchoClientConfig) {
  if (typeof window === 'undefined') {
    console.warn('signIn() can only be called in client components');
    return;
  }

  const basePath = config?.basePath || '/api/echo';
  window.location.href = `${window.location.origin}${basePath}/signin`;
}

/**
 * Create an Echo client for client-side usage (React components, hooks)
 * Uses relative URLs that work in the browser
 */
export function createEchoClient(config?: EchoConfig): EchoClient {
  const proxyPath = config?.basePath
    ? `${config.basePath}/proxy`
    : '/api/echo/proxy';

  return new EchoClient({
    baseUrl: proxyPath,
    // No apiKey needed - proxy handles authentication automatically
    apiKey: 'next-sdk-proxy',
  });
}

/**
 * Pre-configured Echo client for client-side usage
 * Ready to use in React components
 */
export const echoClient = createEchoClient();

/**
 * React hook to get the Echo client
 * Provides a consistent way to access the client in components
 */
export function useEcho(config?: EchoConfig): EchoClient {
  if (config) {
    return createEchoClient(config);
  }
  return echoClient;
}
