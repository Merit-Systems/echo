import { EchoConfig } from '@merit-systems/echo-typescript-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { resolveEchoBaseUrl } from '../config';
import { ECHO_COOKIE, namespacedCookie } from './cookie-names';
import { getEchoToken, RefreshTokenResponse } from './token-manager';

/**
 * Generate PKCE code challenge and verifier
 * @returns Object containing code verifier and challenge
 */
async function generateCodeChallenge(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const encoder = new TextEncoder();
  const codeChallengeBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(codeVerifier)
  );

  const codeChallenge = btoa(
    String.fromCharCode(...new Uint8Array(codeChallengeBuffer))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Handle OAuth signin request - redirect to Echo authorization server
 * @param req - The incoming Next.js request
 * @param config - Echo configuration
 * @returns NextResponse with redirect to authorization server
 */
export async function handleSignIn(
  req: NextRequest,
  config: EchoConfig
): Promise<NextResponse> {
  const { origin } = req.nextUrl;
  const basePath = config.basePath || '/api/echo';

  const baseUrl = resolveEchoBaseUrl(config);

  const redirectUrl = new URL(`${baseUrl}/api/oauth/authorize`);
  redirectUrl.searchParams.set('client_id', config.appId);
  redirectUrl.searchParams.set('redirect_uri', `${origin}${basePath}/callback`);
  redirectUrl.searchParams.set('response_type', 'code');

  const { codeVerifier, codeChallenge } = await generateCodeChallenge();

  redirectUrl.searchParams.set('code_challenge', codeChallenge);
  redirectUrl.searchParams.set('code_challenge_method', 'S256');

  // Create response with redirect and set cookie for code verifier
  const response = NextResponse.redirect(redirectUrl.toString());

  // Set the code verifier in a secure cookie that will be available during callback
  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.CODE_VERIFIER, config.appId),
    codeVerifier,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes - same as auth code TTL
      path: '/',
    }
  );

  return response;
}

/**
 * Handle OAuth signout request - redirect to home page and clear cookies
 * @param req - The incoming Next.js request
 * @param config - Echo configuration
 * @returns NextResponse with redirect to home page and cookies cleared
 */
export async function handleSignOut(
  req: NextRequest,
  config: EchoConfig
): Promise<NextResponse> {
  const { origin } = req.nextUrl;
  const response = NextResponse.redirect(`${origin}`);

  response.cookies.delete(
    namespacedCookie(ECHO_COOKIE.ACCESS_TOKEN, config.appId)
  );
  response.cookies.delete(
    namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN, config.appId)
  );
  response.cookies.delete(
    namespacedCookie(ECHO_COOKIE.USER_INFO, config.appId)
  );
  response.cookies.delete(
    namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN_EXPIRES, config.appId)
  );

  return response;
}

/**
 * Handle OAuth callback - exchange authorization code for tokens
 * @param req - The incoming Next.js request
 * @param config - Echo configuration

  response.cookies.set('echo_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
 * @returns NextResponse with redirect to home page and tokens set as cookies
 */
export async function handleCallback(
  req: NextRequest,
  config: EchoConfig
): Promise<NextResponse> {
  const { origin } = req.nextUrl;
  const basePath = config.basePath || '/api/echo';

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Retrieve the code verifier from the cookie
  const codeVerifier = req.cookies.get(
    namespacedCookie(ECHO_COOKIE.CODE_VERIFIER, config.appId)
  )?.value;

  if (!codeVerifier) {
    return NextResponse.json(
      { error: 'Code verifier not found. Please try signing in again.' },
      { status: 400 }
    );
  }

  // Exchange the code for a token from the token endpoint
  const tokenEndpoint = `${resolveEchoBaseUrl(config)}/api/oauth/token`;

  const params = new URLSearchParams();
  params.set('grant_type', 'authorization_code');
  params.set('code', code);
  params.set('redirect_uri', `${origin}${basePath}/callback`);
  params.set('client_id', config.appId);
  params.set('code_verifier', codeVerifier);

  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-client-user-agent': req.headers.get('user-agent') || '',
      'x-client-ip':
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    },
    body: params.toString(),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 500 }
    );
  }

  const tokenData = (await tokenResponse.json()) as RefreshTokenResponse;

  const response = NextResponse.redirect(`${origin}`);

  // Clear the code verifier cookie after successful token exchange
  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.CODE_VERIFIER, config.appId),
    '',
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    }
  );

  // Set the access token as a cookie
  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.ACCESS_TOKEN, config.appId),
    tokenData.access_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in, // expires_in is typically in seconds
      path: '/',
    }
  );

  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN, config.appId),
    tokenData.refresh_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.refresh_token_expires_in,
      path: '/',
    }
  );

  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.USER_INFO, config.appId),
    JSON.stringify(tokenData.user),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.refresh_token_expires_in,
      path: '/',
    }
  );

  // Store refresh token expiry time for checking
  response.cookies.set(
    namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN_EXPIRES, config.appId),
    String(Math.floor(Date.now() / 1000) + tokenData.refresh_token_expires_in),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.refresh_token_expires_in,
      path: '/',
    }
  );

  return response;
}

export async function handleRefresh(
  req: NextRequest,
  config: EchoConfig
): Promise<NextResponse> {
  try {
    const token = await getEchoToken(config);
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Error refreshing token' },
      { status: 500 }
    );
  }
}
