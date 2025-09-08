import {
  EchoClient,
  EchoConfig,
  User,
} from '@merit-systems/echo-typescript-sdk';
import { cookies as getCookies } from 'next/headers';
import { resolveEchoBaseUrl } from '../config';
import { ECHO_COOKIE, namespacedCookie } from './cookie-names';
import { shouldRefreshToken } from './jwt-utils';

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  echo_app: {
    id: string;
    name: string;
    description: string;
  };
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken - The refresh token to use
 * @param appId - The Echo app ID
 * @returns Promise resolving to the new token data
 */
export async function performTokenRefresh(
  refreshToken: string,
  config: EchoConfig
): Promise<RefreshTokenResponse> {
  return fetch(`${resolveEchoBaseUrl(config)}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.appId,
    }),
  }).then(async r => {
    if (r.ok) {
      const tokenData = (await r.json()) as RefreshTokenResponse;
      return tokenData;
    }
    return Promise.reject(new Error(await r.text()));
  });
}

/**
 * Get a valid Echo token, refreshing if necessary
 * @param appId - The Echo app ID for token refresh
 * @returns Promise resolving to a valid access token or null if authentication failed
 */
export async function getEchoToken(config: EchoConfig): Promise<string | null> {
  const cookies = await getCookies();
  const accessToken = cookies.get(
    namespacedCookie(ECHO_COOKIE.ACCESS_TOKEN, config.appId)
  )?.value;

  // Check if token needs refresh
  if (!accessToken || shouldRefreshToken(accessToken)) {
    const refreshToken = cookies.get(
      namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN, config.appId)
    )?.value;

    if (!refreshToken) {
      console.log('No refresh token found');
      return null;
    }

    try {
      const refreshResult = await performTokenRefresh(refreshToken, config);

      // Set new tokens in cookies
      cookies.set(
        namespacedCookie(ECHO_COOKIE.ACCESS_TOKEN, config.appId),
        refreshResult.access_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: refreshResult.expires_in,
          path: '/',
        }
      );

      cookies.set(
        namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN, config.appId),
        refreshResult.refresh_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: refreshResult.refresh_token_expires_in,
          path: '/',
        }
      );

      // Store refresh token expiry time for checking
      cookies.set(
        namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN_EXPIRES, config.appId),
        String(
          Math.floor(Date.now() / 1000) + refreshResult.refresh_token_expires_in
        ),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: refreshResult.refresh_token_expires_in,
          path: '/',
        }
      );

      return refreshResult.access_token;
    } catch (error) {
      console.error('Token refresh failed:', refreshToken, error);
      return null;
    }
  }

  return accessToken;
}

export async function getUser(config: EchoConfig): Promise<User> {
  const echo = await getEchoClient(config);
  if (!echo) {
    throw new Error('User not signed in');
  }
  return echo.users.getUserInfo();
}

export async function getEchoClient(
  config: EchoConfig
): Promise<EchoClient | null> {
  const token = await getEchoToken(config);
  if (!token) {
    return null;
  }
  return new EchoClient({
    baseUrl: resolveEchoBaseUrl(config),
    apiKey: token,
  });
}
