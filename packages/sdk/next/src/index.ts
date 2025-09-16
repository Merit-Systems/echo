import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { EchoConfig, EchoResult } from './types';

import { createEchoAnthropic } from 'ai-providers/anthropic';
import { createEchoGoogle } from 'ai-providers/google';
import { createEchoOpenAI } from 'ai-providers/openai';

import { ECHO_COOKIE, namespacedCookie } from 'auth/cookie-names';
import {
  RefreshTokenResponse,
  getEchoToken as getEchoTokenInternal,
} from 'auth/token-manager';
import { handleEchoClientProxy } from 'proxy';
import {
  handleCallback,
  handleRefresh,
  handleSignIn,
  handleSignOut,
  handleSession,
} from './auth/oauth-handlers';

/**
 * Echo SDK for Next.js
 * Provides OAuth authentication and token management for Echo API integration
 */
export default function Echo(config: EchoConfig): EchoResult {
  /**
   * HTTP handler for OAuth routes (signin and callback)
   */
  const httpHandler = async (req: NextRequest): Promise<Response> => {
    const { pathname } = req.nextUrl;
    const basePath = config.basePath || '/api/echo';
    const path = pathname.replace(basePath, '');

    if (path.startsWith('/proxy')) {
      return handleEchoClientProxy(req, config);
    }

    switch (path) {
      // all the auth stuff
      case '/signin':
        return handleSignIn(req, config);

      case '/signout':
        return handleSignOut(req, config);

      case '/callback':
        return handleCallback(req, config);

      case '/refresh':
        return handleRefresh(req, config);

      case '/session':
        return handleSession(req, config);

      default:
        console.error('Unknown path', path);
        return NextResponse.error();
    }
  };

  /**
   * Get current user info with automatic token refresh
   */
  const getUser = async () => {
    // read only access token, if expired we are fucked
    const cookieStore = await cookies();
    const userInfo = cookieStore.get(
      namespacedCookie(ECHO_COOKIE.USER_INFO, config.appId)
    )?.value;
    if (!userInfo) {
      return null;
    }
    const user = JSON.parse(userInfo) as RefreshTokenResponse['user'];
    return user;
  };

  const isSignedIn = async () => {
    const cookieStore = await cookies();
    const refreshTokenExpiry = cookieStore.get(
      namespacedCookie(ECHO_COOKIE.REFRESH_TOKEN_EXPIRES, config.appId)
    )?.value;

    if (!refreshTokenExpiry) {
      return false; // No expiry stored
    }

    const expiryTime = parseInt(refreshTokenExpiry);
    const now = Math.floor(Date.now() / 1000);

    return expiryTime > now; // True if not expired
  };

  return {
    // HTTP handlers for Next.js API routes
    handlers: {
      GET: httpHandler,
      POST: httpHandler,
    },

    // Authentication utilities (server-side only)
    getUser,
    isSignedIn,
    getEchoToken: () => getEchoTokenInternal(config),

    // AI provider clients
    openai: createEchoOpenAI(config),
    anthropic: createEchoAnthropic(config),
    google: createEchoGoogle(config),
  };
}
