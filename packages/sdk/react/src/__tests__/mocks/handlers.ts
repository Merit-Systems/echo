import { http, HttpResponse } from 'msw';
import jwt from 'jsonwebtoken';
import {
  createValidJWT,
  createExpiredJWT,
  createTamperedJWT,
} from './jwt-factory';

const TEST_JWT_SECRET =
  'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2';

function validateJWTToken(authHeader: string | null): {
  valid: boolean;
  error?: string;
  payload?: unknown;
} {
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, TEST_JWT_SECRET, {
      algorithms: ['HS256'],
      audience: 'echo-proxy',
      issuer: 'http://localhost:3000',
    });

    return { valid: true, payload };
  } catch (error: unknown) {
    const errorObj = error as { name?: string };
    if (errorObj.name === 'TokenExpiredError') {
      return { valid: false, error: 'token_expired' };
    } else if (errorObj.name === 'JsonWebTokenError') {
      return { valid: false, error: 'invalid_token' };
    } else {
      return { valid: false, error: 'token_validation_failed' };
    }
  }
}

const API_BASE = 'http://localhost:3000/api';

/**
 * Default success handlers for Echo OAuth endpoints
 */
export const handlers = [
  // OAuth Authorization Endpoint
  http.get(`${API_BASE}/oauth/authorize`, ({ request }) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');
    const codeChallenge = url.searchParams.get('code_challenge');
    const codeChallengeMethod = url.searchParams.get('code_challenge_method');
    const responseType = url.searchParams.get('response_type');
    const state = url.searchParams.get('state');
    const prompt = url.searchParams.get('prompt');

    // Validate response_type (only 'code' is supported)
    if (responseType && responseType !== 'code') {
      return HttpResponse.json(
        {
          error: 'unsupported_response_type',
          error_description:
            'Only authorization code flow (response_type=code) is supported',
        },
        { status: 400 }
      );
    }

    // Validate required PKCE parameters
    if (!clientId || !redirectUri || !codeChallenge) {
      return HttpResponse.json(
        {
          error: 'invalid_request',
          error_description:
            'Missing required parameters: client_id, redirect_uri, code_challenge',
        },
        { status: 400 }
      );
    }

    if (codeChallengeMethod !== 'S256') {
      return HttpResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Only code_challenge_method=S256 is supported',
        },
        { status: 400 }
      );
    }

    // Client-specific redirect URI validation for security tests
    const clientRedirectUris: Record<string, string[]> = {
      'client-a': ['https://app-a.com/callback'],
      'client-b': ['https://app-b.com/callback'],
      'test-app-id': [
        'http://localhost:3000/callback',
        'http://localhost:3000',
      ],
      'test-client': ['http://localhost:3000/callback'],
    };

    if (
      clientRedirectUris[clientId] &&
      !clientRedirectUris[clientId].includes(redirectUri)
    ) {
      return HttpResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Redirect URI not allowed for this client',
        },
        { status: 400 }
      );
    }

    // Handle prompt=none for silent authentication
    if (prompt === 'none') {
      // Special test case: if client_id is 'authenticated-client', simulate successful silent auth
      if (clientId === 'authenticated-client') {
        const authCode = `silent_auth_code_${Date.now()}`;
        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set('code', authCode);
        const stateParam = state || crypto.randomUUID();
        callbackUrl.searchParams.set('state', stateParam);

        return HttpResponse.json({
          redirect_url: callbackUrl.toString(),
        });
      }

      // Default: Mock behavior simulates user is NOT authenticated
      // In real implementation, this would check actual session state
      return HttpResponse.json(
        {
          error: 'login_required',
          error_description:
            'Silent authentication failed - user not authenticated',
        },
        { status: 400 }
      );
    }

    // Mock successful authorization - redirect with code
    const authCode = `mock_auth_code_${Date.now()}`;
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', authCode);

    // Handle missing state gracefully
    const stateParam = state || crypto.randomUUID();
    callbackUrl.searchParams.set('state', stateParam);

    return HttpResponse.json({
      redirect_url: callbackUrl.toString(),
    });
  }),

  // OAuth Token Exchange Endpoint
  http.post(`${API_BASE}/oauth/token`, async ({ request }) => {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, string>;

    try {
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        body = Object.fromEntries(new URLSearchParams(text));
      } else {
        const jsonBody = await request.json();
        body = jsonBody as Record<string, string>;
      }
    } catch {
      return HttpResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Malformed request body',
        },
        { status: 400 }
      );
    }

    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      code_verifier,
      refresh_token,
    } = body;

    // Handle authorization code grant
    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri || !client_id || !code_verifier) {
        return HttpResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing required parameters',
          },
          { status: 400 }
        );
      }

      // Mock successful token exchange
      const accessToken = await createValidJWT({
        userId: 'test-user-123',
        appId: client_id,
        scope: 'llm:invoke offline_access',
      });

      return HttpResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 86400, // 24 hours
        refresh_token: 'refresh_mock_token_12345',
        refresh_token_expires_in: 2592000, // 30 days
        scope: 'llm:invoke offline_access',
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        echo_app: {
          id: client_id,
          name: 'Test Echo App',
          description: 'Test application for OAuth',
        },
      });
    }

    // Handle refresh token grant
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return HttpResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing refresh_token parameter',
          },
          { status: 400 }
        );
      }

      // Mock successful token refresh
      const newAccessToken = await createValidJWT({
        userId: 'test-user-123',
        appId: 'test-app-456',
        scope: 'llm:invoke offline_access',
      });

      return HttpResponse.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 86400,
        refresh_token: 'new_refresh_token_67890', // Rotated refresh token
      });
    }

    return HttpResponse.json(
      {
        error: 'unsupported_grant_type',
        error_description:
          'Only authorization_code and refresh_token grant types are supported',
      },
      { status: 400 }
    );
  }),

  // Balance API Endpoint (v1)
  http.get(`${API_BASE}/v1/balance`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    // Mock successful balance response
    return HttpResponse.json({
      totalPaid: 1200,
      totalSpent: 200,
      balance: 1000,
    });
  }),

  // Free Tier Balance API Endpoint (v1)
  http.post(`${API_BASE}/v1/balance/free`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    const requestBody = (await request.json()) as { echoAppId?: string };
    const { echoAppId } = requestBody;

    if (!echoAppId) {
      return HttpResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing echoAppId parameter',
        },
        { status: 400 }
      );
    }

    // Mock successful free tier balance response
    return HttpResponse.json({
      spendPoolBalance: 25.5,
      userSpendInfo: {
        userId: 'test-user-123',
        echoAppId: echoAppId,
        spendPoolId: 'free-tier-pool-123',
        amountSpent: 4.5,
        spendLimit: 30.0,
        amountLeft: 25.5,
      },
    });
  }),

  // OIDC UserInfo Endpoint (OAuth standard) - GET method
  // This endpoint simulates the real security behavior: it returns clean data from the "database"
  // regardless of what malicious data might be in the OAuth profile
  http.get(`${API_BASE}/oauth/userinfo`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    // SECURITY: This endpoint always returns clean, sanitized data from the "database"
    // It ignores any potentially malicious data from OAuth providers
    // This simulates the real userinfo endpoint behavior
    return HttpResponse.json({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferred_username: 'testuser',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
    });
  }),

  // OIDC UserInfo Endpoint (OAuth standard) - POST method (some clients use POST)
  http.post(`${API_BASE}/oauth/userinfo`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    // SECURITY: Same clean data as GET method - ignores OAuth profile data
    return HttpResponse.json({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferred_username: 'testuser',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
    });
  }),

  // User Info API Endpoint (v1) - Keep for backward compatibility
  http.get(`${API_BASE}/v1/user`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    // Mock successful user response
    return HttpResponse.json({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      totalPaid: 1000,
      totalSpent: 200,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    });
  }),

  // Legacy Balance API Endpoint (for backward compatibility)
  http.get(`${API_BASE}/balance`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json(
        {
          error: validation.error,
          error_description: 'Token validation failed',
        },
        { status: 401 }
      );
    }

    // Mock successful balance response
    return HttpResponse.json({
      credits: 1000,
      currency: 'USD',
    });
  }),

  // Payment Link Creation Endpoint
  http.post(`${API_BASE}/v1/stripe/payment-link`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    const validation = validateJWTToken(authHeader);

    if (!validation.valid) {
      return HttpResponse.json({ error: validation.error }, { status: 401 });
    }

    const requestBody = (await request.json()) as { amount?: number };
    const { amount } = requestBody;

    if (!amount || amount <= 0) {
      return HttpResponse.json(
        {
          error: 'invalid_amount',
          error_description: 'Amount must be greater than 0',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      paymentLink: {
        id: `payment-link-${amount}`,
        url: `https://stripe.com/payment-link/mock-${amount}`,
        amount: amount * 100, // Amount in cents
        currency: 'usd',
        description: 'Echo Credits',
      },
    });
  }),
];

/**
 * Error handlers for testing failure scenarios
 */
export const errorHandlers = {
  // Network failure simulation
  networkError: http.all('*', () => HttpResponse.error()),

  // Server error simulation
  serverError: http.all(`${API_BASE}/*`, () =>
    HttpResponse.json({ error: 'internal_server_error' }, { status: 500 })
  ),

  // Invalid client ID
  invalidClient: http.get(`${API_BASE}/oauth/authorize`, () =>
    HttpResponse.json(
      {
        error: 'invalid_client',
        error_description: 'Invalid or inactive client_id',
      },
      { status: 400 }
    )
  ),

  // Invalid client ID for token endpoint
  invalidClientToken: http.post(`${API_BASE}/oauth/token`, () =>
    HttpResponse.json(
      {
        error: 'invalid_client',
        error_description: 'Invalid or inactive client_id',
      },
      { status: 400 }
    )
  ),

  // PKCE verification failure
  pkceFailure: http.post(`${API_BASE}/oauth/token`, () =>
    HttpResponse.json(
      {
        error: 'invalid_grant',
        error_description: 'PKCE verification failed',
      },
      { status: 400 }
    )
  ),

  // Expired authorization code
  expiredAuthCode: http.post(`${API_BASE}/oauth/token`, () =>
    HttpResponse.json(
      {
        error: 'invalid_grant',
        error_description: 'Invalid or expired authorization code',
      },
      { status: 400 }
    )
  ),

  // Expired JWT token response
  expiredToken: http.post(`${API_BASE}/oauth/token`, async () => {
    const expiredToken = await createExpiredJWT();
    return HttpResponse.json({
      access_token: expiredToken,
      token_type: 'Bearer',
      expires_in: -3600, // Already expired
      refresh_token: 'refresh_token_12345',
    });
  }),

  // Tampered JWT token response
  tamperedToken: http.post(`${API_BASE}/oauth/token`, async () => {
    const tamperedToken = await createTamperedJWT();
    return HttpResponse.json({
      access_token: tamperedToken,
      token_type: 'Bearer',
      expires_in: 86400,
      refresh_token: 'refresh_token_12345',
    });
  }),

  // Unauthorized balance request (v1)
  unauthorizedBalance: http.get(`${API_BASE}/v1/balance`, () =>
    HttpResponse.json(
      { error: 'token_expired', error_description: 'Access token has expired' },
      { status: 401 }
    )
  ),

  // Unauthorized OIDC UserInfo request
  unauthorizedUserInfo: http.get(`${API_BASE}/oauth/userinfo`, () =>
    HttpResponse.json(
      { error: 'token_expired', error_description: 'Access token has expired' },
      { status: 401 }
    )
  ),

  // Unauthorized user info request (v1)
  unauthorizedUser: http.get(`${API_BASE}/v1/user`, () =>
    HttpResponse.json(
      { error: 'token_expired', error_description: 'Access token has expired' },
      { status: 401 }
    )
  ),
  // Invalid refresh token
  invalidRefreshToken: http.post(`${API_BASE}/oauth/token`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('grant_type') === 'refresh_token') {
      return HttpResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid or expired refresh token',
        },
        { status: 400 }
      );
    }
    return HttpResponse.json({ error: 'invalid_request' }, { status: 400 });
  }),

  // Malformed JSON response
  malformedResponse: http.post(`${API_BASE}/oauth/token`, () =>
    HttpResponse.text('{ invalid json response }', {
      headers: { 'Content-Type': 'application/json' },
    })
  ),
};
