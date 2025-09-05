import { NextRequest, NextResponse } from 'next/server';
import { getEchoToken } from '../auth/token-manager';
import { EchoConfig } from '../types';

/**
 * Proxy requests to Echo service with automatic authentication
 */
export async function handleEchoClientProxy(
  req: NextRequest,
  config: EchoConfig
): Promise<Response> {
  const proxyPath = req.nextUrl.pathname.replace(/^.*\/proxy/, '');
  const baseUrl = config.baseEchoUrl || 'https://echo.merit.systems';
  const targetUrl = `${baseUrl}${proxyPath}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  // Don't ask upstream to compress
  headers.delete('accept-encoding');
  headers.set('accept-encoding', 'identity');

  // Optional: also drop conditional headers to avoid weirdness
  headers.delete('if-none-match');
  headers.delete('if-modified-since');

  // Get valid token using existing function (handles refresh automatically)
  const accessToken = await getEchoToken(config);

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  // Inject the valid token
  headers.set('Authorization', `Bearer ${accessToken}`);
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: req.body }),
    });

    return response;
  } catch (error) {
    console.error('Proxy request failed:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}
