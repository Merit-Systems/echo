import { TEST_CONFIG } from '../config/index.js';
import { EchoClient } from '@merit-systems/echo-typescript-sdk';

export interface EchoControlApiClient {
  baseUrl: string;
  fetch: typeof fetch;
}

export class EchoControlApiClient {
  private providerId: string;

  constructor(
    baseUrl: string = TEST_CONFIG.services.echoControl,
    providerId: string = 'test-user-1'
  ) {
    this.baseUrl = baseUrl;
    this.providerId = providerId;
    this.fetch = fetch;
  }

  async getCookies(): Promise<string> {
    const response = await this.fetch(
      `${this.baseUrl}/api/auth/callback/${this.providerId}`,
      {
        method: 'POST',
        credentials: 'include',
        redirect: 'manual',
      }
    );

    // Handle multiple Set-Cookie headers
    // Note: Headers.getAll() is not available in all environments, so we'll use a different approach
    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error('No set-cookie header found');
    }

    // Split by ', ' to handle multiple cookies in a single header
    // This handles the case where multiple cookies are concatenated
    const cookieStrings = setCookieHeader.split(', ');

    // Extract just the cookie name=value part from each Set-Cookie header
    const cookies = cookieStrings.map((header: string) => {
      // Set-Cookie format: name=value; Path=/; HttpOnly; SameSite=Lax
      const cookiePart = header.split(';')[0]; // Get just the name=value part
      return cookiePart;
    });

    // Join multiple cookies with '; ' separator
    return cookies.join('; ');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json();
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health');
  }

  // OAuth endpoints
  async getOAuthAuthorizeUrl(params: {
    client_id: string;
    redirect_uri: string;
    state: string;
    code_challenge: string;
    code_challenge_method: string;
    scope?: string;
    prompt?: string;
  }): Promise<string> {
    const searchParams = new URLSearchParams(params);
    return `${this.baseUrl}/api/oauth/authorize?${searchParams.toString()}`;
  }

  // OAuth authorize validation (actually calls the endpoint for validation testing)
  async validateOAuthAuthorizeRequest(params: {
    client_id: string;
    redirect_uri: string;
    state: string;
    code_challenge: string;
    code_challenge_method: string;
    scope?: string;
    prompt?: string;
  }): Promise<string> {
    const searchParams = new URLSearchParams(params);
    const url = `${this.baseUrl}/api/oauth/authorize?${searchParams.toString()}`;

    const headers: Record<string, string> = {};

    headers['cookie'] = await this.getCookies();

    const response = await this.fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      redirect: 'manual', // Don't follow redirects
    });

    // If validation passes, it will redirect (302) or return error JSON (400/500)
    if (response.status === 302) {
      // Validation passed, return the redirect location
      return response.headers.get('location') || url;
    } else if (!response.ok) {
      // Validation failed, throw with error details
      const errorText = await response.text();
      throw new Error(
        `OAuth authorization failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    // For 200 responses (shouldn't happen in this flow)
    return url;
  }

  async exchangeCodeForToken(params: {
    code: string;
    client_id: string;
    redirect_uri: string;
    code_verifier: string;
  }): Promise<{
    access_token: string;
    echo_app: {
      id: string;
    };
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope: string;
  }> {
    return this.request('/api/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        ...params,
      }),
    });
  }

  async refreshToken(params: {
    refresh_token: string;
    client_id: string;
  }): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  }> {
    return this.request('/api/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        ...params,
      }),
    });
  }

  // JWT token validation
  async validateJwtToken(jwtToken: string): Promise<{
    valid: boolean;
    claims?: any;
    error?: string;
    userId?: string;
    appId?: string;
    scope?: string;
  }> {
    const url = `${this.baseUrl}/api/validate-jwt-token`;
    console.log('🔧 Making JWT validation request to:', url);

    // Only send X-Echo-Token header - this endpoint should be public
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Echo-Token': jwtToken, // Our Echo token to validate
    };

    console.log('🔧 Headers being sent:', {
      'Content-Type': headers['Content-Type'],
      'X-Echo-Token': jwtToken.substring(0, 50) + '...',
    });

    const response = await this.fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}), // Empty body to prevent JSON parsing errors
    });

    // For JWT validation, 400/401 with JSON body is a valid response (invalid token)
    if (response.status === 400 || response.status === 401 || response.ok) {
      return response.json();
    }

    const errorText = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Balance endpoint (requires authentication)
  async getBalance(authToken: string) {
    const echoClient = new EchoClient({
      apiKey: authToken,
      baseUrl: this.baseUrl,
    });
    return await echoClient.balance.getBalance();
  }

  // Payment endpoint
  async createPaymentLink(
    authToken: string,
    params: {
      amount: number;
      description?: string;
    }
  ): Promise<{
    payment_url: string;
    payment_id: string;
  }> {
    const echoClient = new EchoClient({
      apiKey: authToken,
      baseUrl: this.baseUrl,
    });
    const response = await echoClient.payments.createPaymentLink({
      amount: params.amount,
      description: params.description ?? '',
    });

    return {
      payment_url: response.paymentLink.url,
      payment_id: response.paymentLink.id,
    };
  }

  async getFreeTierBalance(authToken: string, echoAppId: string) {
    const echoClient = new EchoClient({
      apiKey: authToken,
      baseUrl: this.baseUrl,
    });
    return await echoClient.balance.getFreeBalance(echoAppId);
  }

  // Referral code endpoints
  async getUserReferralCode(
    authToken: string,
    echoAppId: string
  ): Promise<{
    success: boolean;
    message: string;
    code?: string;
    referralLinkUrl?: string;
    expiresAt?: string;
  }> {
    const url = `${this.baseUrl}/api/v1/user/referral?echoAppId=${echoAppId}`;
    const response = await this.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get referral code: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json();
  }

  async applyReferralCode(
    authToken: string,
    echoAppId: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const url = `${this.baseUrl}/api/v1/user/referral`;
    const response = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        echoAppId,
        code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to apply referral code: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json();
  }
}

// Export a default instance with test configuration
export const echoControlApi = new EchoControlApiClient();

// Re-export test IDs from centralized config
export { TEST_CLIENT_IDS, TEST_USER_IDS } from '../config/index.js';
