import { cookies, headers } from 'next/headers';
import { EchoConfig } from '../types';

/**
 * Create an absolute URL for Echo actions (similar to NextAuth's createActionURL)
 */
export async function createActionURL(
  action: string,
  config: EchoConfig
): Promise<URL> {
  const headersList = await headers();

  const detectedHost =
    headersList.get('x-forwarded-host') ?? headersList.get('host');
  const detectedProtocol = headersList.get('x-forwarded-proto') ?? 'https';
  const protocol = detectedProtocol.endsWith(':')
    ? detectedProtocol
    : detectedProtocol + ':';

  const basePath = config.basePath || '/api/echo';
  const sanitizedBasePath = basePath.replace(/(^\/|\/$)/g, '');

  return new URL(`${protocol}//${detectedHost}/${sanitizedBasePath}/${action}`);
}

/**
 * Make an authenticated fetch request to an Echo action endpoint
 */
export async function fetchEchoAction(
  action: string,
  config: EchoConfig,
  options?: RequestInit
): Promise<{ response: Response }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = await createActionURL(action, config);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: cookieHeader, // Forward cookies
    },
  });

  return { response };
}
