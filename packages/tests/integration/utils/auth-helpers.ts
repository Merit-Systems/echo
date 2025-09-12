import crypto from 'crypto';
import { echoControlApi, TEST_CLIENT_IDS } from './api-client';

// PKCE (Proof Key for Code Exchange) utilities
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(codeVerifier: string): string {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('base64url');
}

// OAuth flow helper
export interface OAuthFlowParams {
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  codeVerifier?: string;
}

export interface OAuthFlowResult {
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  redirectUri: string;
  clientId: string;
  scope: string;
}

export async function startOAuthFlow(
  params: OAuthFlowParams = {}
): Promise<OAuthFlowResult> {
  const clientId = params.clientId || TEST_CLIENT_IDS.primary;
  const redirectUri = params.redirectUri || 'http://localhost:3000/callback';
  const scope = params.scope || 'llm:invoke offline_access';
  const state = params.state || generateState();
  const codeVerifier = params.codeVerifier || generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authorizationUrl = await echoControlApi.getOAuthAuthorizeUrl({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope,
  });

  return {
    authorizationUrl,
    state,
    codeVerifier,
    codeChallenge,
    redirectUri,
    clientId,
    scope,
  };
}

// Simulate user authorization and extract authorization code
export function extractAuthorizationCodeFromUrl(url: string): {
  code: string;
  state: string;
} {
  const urlObj = new URL(url);
  const code = urlObj.searchParams.get('code');
  const state = urlObj.searchParams.get('state');

  if (!code) {
    throw new Error('Authorization code not found in URL');
  }

  if (!state) {
    throw new Error('State parameter not found in URL');
  }

  return { code, state };
}

// Complete OAuth flow by exchanging code for tokens
export async function completeOAuthFlow(
  authorizationCode: string,
  flowResult: OAuthFlowResult
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}> {
  return echoControlApi.exchangeCodeForToken({
    code: authorizationCode,
    client_id: flowResult.clientId,
    redirect_uri: flowResult.redirectUri,
    code_verifier: flowResult.codeVerifier,
  });
}

// Refresh access token using refresh token
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string = TEST_CLIENT_IDS.primary
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}> {
  return echoControlApi.refreshToken({
    refresh_token: refreshToken,
    client_id: clientId,
  });
}

// JWT token utilities
export function decodeJwtPayload(token: string): any {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) {
      throw new Error('Invalid JWT token format - missing payload');
    }
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    throw new Error('Invalid JWT token format');
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function getTokenExpiryTime(token: string): Date {
  const payload = decodeJwtPayload(token);
  return new Date(payload.exp * 1000);
}

// Test authentication helper - creates a full authenticated session
export async function createTestAuthSession(
  params: OAuthFlowParams = {}
): Promise<{
  accessToken: string;
  refreshToken: string | undefined;
  tokenType: string;
  expiresIn: number;
  scope: string;
  flowResult: OAuthFlowResult;
}> {
  // Start OAuth flow
  const flowResult = await startOAuthFlow(params);

  // In a real test, you would simulate user authorization here
  // For now, we'll simulate having received an authorization code
  // This would typically come from a browser automation step
  const mockAuthorizationCode =
    'mock_auth_code_' + crypto.randomBytes(16).toString('hex');

  // Exchange code for tokens
  const tokenResponse = await completeOAuthFlow(
    mockAuthorizationCode,
    flowResult
  );

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token || undefined,
    tokenType: tokenResponse.token_type,
    expiresIn: tokenResponse.expires_in,
    scope: tokenResponse.scope,
    flowResult,
  };
}

// Security test helpers
export interface SecurityTestParams {
  invalidRedirectUri?: string;
  invalidClientId?: string;
  invalidCodeChallenge?: string;
  maliciousState?: string;
}

export async function testOAuthSecurityViolation(
  violation: keyof SecurityTestParams,
  params: SecurityTestParams
): Promise<boolean> {
  try {
    const flowParams: any = {
      client_id: TEST_CLIENT_IDS.primary,
      redirect_uri: 'http://localhost:3000/callback',
      state: generateState(),
      code_challenge: generateCodeChallenge(generateCodeVerifier()),
      code_challenge_method: 'S256',
      scope: 'llm:invoke',
    };

    // Apply security violation
    switch (violation) {
      case 'invalidRedirectUri':
        flowParams.redirect_uri =
          params.invalidRedirectUri || 'http://malicious.com/callback';
        break;
      case 'invalidClientId':
        flowParams.client_id = params.invalidClientId || 'invalid_client_id';
        break;
      case 'invalidCodeChallenge':
        flowParams.code_challenge =
          params.invalidCodeChallenge || 'invalid_challenge';
        break;
      case 'maliciousState':
        flowParams.state =
          params.maliciousState || '<script>alert("xss")</script>';
        break;
    }

    await echoControlApi.getOAuthAuthorizeUrl(flowParams);
    return false; // Should have thrown an error
  } catch {
    return true; // Security violation correctly detected
  }
}
