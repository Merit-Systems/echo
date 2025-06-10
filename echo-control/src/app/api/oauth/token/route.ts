import { db } from '@/lib/db';
import { createApiToken } from '@/lib/jwt-tokens';
import { createHash } from 'crypto';
import { jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

// JWT secret for verifying authorization codes (must match authorize endpoint)
const JWT_SECRET = new TextEncoder().encode(
  process.env.OAUTH_JWT_SECRET || 'your-secret-key-change-in-production'
);

interface AuthCodePayload {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  userId: string;
  state: string; // Add state for CSRF validation
  exp: number;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    /* 1️⃣ Parse the token request - handle both JSON and form-encoded */
    let body: Record<string, string>;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      // Default to JSON
      body = await req.json();
    }

    const { grant_type, code, redirect_uri, client_id, code_verifier } = body;

    // Validate required parameters
    if (grant_type !== 'authorization_code') {
      return NextResponse.json(
        {
          error: 'unsupported_grant_type',
          error_description: 'Only authorization_code grant type is supported',
        },
        { status: 400 }
      );
    }

    if (!code || !redirect_uri || !client_id || !code_verifier) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Validate code verifier length (RFC 7636 Section 4.1)
    // Must be 43-128 characters
    if (code_verifier.length < 43 || code_verifier.length > 128) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'code_verifier must be 43-128 characters long',
        },
        { status: 400 }
      );
    }

    // Validate code verifier format (only unreserved characters)
    if (!/^[A-Za-z0-9._~-]+$/.test(code_verifier)) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'code_verifier contains invalid characters',
        },
        { status: 400 }
      );
    }

    /* 2️⃣ Verify and decode the authorization code JWT */
    let authData: AuthCodePayload;
    try {
      const { payload } = await jwtVerify(code, JWT_SECRET);
      authData = payload as unknown as AuthCodePayload;
    } catch {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid or expired authorization code',
        },
        { status: 400 }
      );
    }

    /* 3️⃣ Validate the authorization code data */
    if (
      authData.clientId !== client_id ||
      authData.redirectUri !== redirect_uri
    ) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description:
            'Authorization code does not match request parameters',
        },
        { status: 400 }
      );
    }

    /* 4️⃣ Verify PKCE code challenge */
    const codeVerifierHash = createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    if (codeVerifierHash !== authData.codeChallenge) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'PKCE verification failed',
        },
        { status: 400 }
      );
    }

    /* 🔒 CSRF Protection: Validate state parameter */
    const storedState = await db.oAuthState.findFirst({
      where: {
        state: authData.state,
        userId: authData.userId,
        clientId: authData.clientId,
        expiresAt: { gt: new Date() }, // Not expired
      },
    });

    if (!storedState) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description:
            'Invalid or expired state parameter - CSRF protection',
        },
        { status: 400 }
      );
    }

    // Delete used state (one-time use)
    await db.oAuthState.delete({
      where: { id: storedState.id },
    });

    // Clean up expired states (fire and forget)
    db.oAuthState
      .deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      })
      .catch(() => {
        // Ignore cleanup errors
      });

    /* 5️⃣ Get user and validate they exist */
    const user = await db.user.findUnique({
      where: { clerkId: authData.userId },
      include: { echoApps: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'User not found',
        },
        { status: 400 }
      );
    }

    /* 6️⃣ Find and validate the Echo app (client) */
    const echoApp = await db.echoApp.findFirst({
      where: {
        id: client_id,
        isActive: true,
      },
    });

    if (!echoApp) {
      return NextResponse.json(
        {
          error: 'invalid_client',
          error_description: 'Invalid or inactive client_id',
        },
        { status: 400 }
      );
    }

    // Validate redirect_uri against authorized callback URLs
    if (!echoApp.authorizedCallbackUrls.includes(redirect_uri)) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'redirect_uri is not authorized for this client',
        },
        { status: 400 }
      );
    }

    // Ensure the user owns this Echo app (from the authorization code)
    if (echoApp.userId !== user.id) {
      return NextResponse.json(
        {
          error: 'invalid_grant',
          error_description: 'Client does not belong to the authenticated user',
        },
        { status: 400 }
      );
    }

    /* 7️⃣ Check for existing API key or create new one */
    let apiKey = await db.apiKey.findFirst({
      where: {
        userId: user.id,
        echoAppId: echoApp.id,
        isActive: true,
        name: 'OAuth Generated',
      },
    });

    if (!apiKey) {
      // Generate new API key
      const keyValue = `echo_${nanoid(40)}`;

      apiKey = await db.apiKey.create({
        data: {
          key: keyValue,
          name: 'OAuth Generated',
          userId: user.id,
          echoAppId: echoApp.id,
          isActive: true,
          metadata: {
            createdVia: 'oauth',
            scope: authData.scope,
            grantedAt: new Date().toISOString(),
          },
        },
      });
    }

    /* 8️⃣ Generate refresh token */
    const refreshTokenValue = `refresh_${nanoid(48)}`;
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    // Deactivate any existing refresh tokens for this app
    await db.refreshToken.updateMany({
      where: {
        userId: user.id,
        echoAppId: echoApp.id,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Create new refresh token
    const refreshToken = await db.refreshToken.create({
      data: {
        token: refreshTokenValue,
        expiresAt: refreshTokenExpiry,
        userId: user.id,
        echoAppId: echoApp.id,
        apiKeyId: apiKey.id,
        scope: authData.scope,
        isActive: true,
      },
    });

    /* 9️⃣ Generate JWT access token for fast validation */
    const jwtToken = await createApiToken({
      userId: user.id,
      appId: echoApp.id,
      apiKeyId: apiKey.id,
      scope: authData.scope,
      keyVersion: 1, // Can be incremented to invalidate old tokens
    });

    /* 🔟 Return the JWT access token response with refresh token */
    const response = NextResponse.json({
      access_token: jwtToken, // JWT instead of raw API key
      token_type: 'Bearer',
      expires_in: 24 * 60 * 60, // JWT expires in 24 hours
      refresh_token: refreshToken.token,
      refresh_token_expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
      scope: authData.scope,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      echo_app: {
        id: echoApp.id,
        name: echoApp.name,
        description: echoApp.description,
      },
      // Include raw API key for admin purposes (optional)
      _internal: {
        api_key_id: apiKey.id,
        api_key_prefix: apiKey.key.slice(0, 10),
      },
    });

    return response;
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error during token exchange',
      },
      { status: 500 }
    );
  }
}
