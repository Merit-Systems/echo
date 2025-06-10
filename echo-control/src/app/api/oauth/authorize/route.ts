import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

// TTL for the one-time authorization code (seconds)
const AUTH_CODE_TTL = 300; // 5 minutes

// JWT secret for signing authorization codes (use a proper secret in production)
const JWT_SECRET = new TextEncoder().encode(
  process.env.OAUTH_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ Parse & validate required PKCE / OAuth params */
    const url = new URL(req.url);
    const qs = url.searchParams;

    const clientId = qs.get('client_id'); // Echo app ID
    const redirectUri = qs.get('redirect_uri');
    const codeChallenge = qs.get('code_challenge');
    const codeChallengeMethod = qs.get('code_challenge_method');
    const state = qs.get('state') || nanoid();
    const scope = qs.get('scope') || 'llm:invoke offline_access';
    const responseType = qs.get('response_type') || 'code';
    const prompt = qs.get('prompt');

    if (!clientId || !redirectUri || !codeChallenge) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description:
            'Missing required parameters: client_id, redirect_uri, code_challenge',
        },
        { status: 400 }
      );
    }

    if (responseType !== 'code') {
      return NextResponse.json(
        {
          error: 'unsupported_response_type',
          error_description: 'Only response_type=code is supported',
        },
        { status: 400 }
      );
    }

    // Validate code_challenge_method (required and must be S256)
    if (
      !codeChallengeMethod ||
      codeChallengeMethod === '' ||
      codeChallengeMethod !== 'S256'
    ) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Only code_challenge_method=S256 is supported',
        },
        { status: 400 }
      );
    }

    // Validate code challenge format (RFC 7636 Section 4.2)
    // Must be 43-128 characters, base64url-encoded
    if (
      !codeChallenge ||
      codeChallenge.length < 43 ||
      codeChallenge.length > 128
    ) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'code_challenge must be 43-128 characters long',
        },
        { status: 400 }
      );
    }

    // Validate base64url format (no +, /, or = characters)
    if (!/^[A-Za-z0-9_-]+$/.test(codeChallenge)) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'code_challenge must be base64url encoded',
        },
        { status: 400 }
      );
    }

    /* 2️⃣ Validate client_id (Echo app) and redirect_uri */
    const echoApp = await db.echoApp.findUnique({
      where: { id: clientId, isActive: true },
      select: {
        id: true,
        name: true,
        authorizedCallbackUrls: true,
        userId: true,
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
    if (!echoApp.authorizedCallbackUrls.includes(redirectUri)) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'redirect_uri is not authorized for this client',
        },
        { status: 400 }
      );
    }

    /* 2️⃣ Check if user is authenticated with Clerk */
    const { userId } = await getAuth(req);
    if (!userId) {
      // Handle prompt=none for unauthenticated users - SECURITY FIX
      if (prompt === 'none') {
        return NextResponse.json(
          {
            error: 'login_required',
            error_description:
              'Silent authentication failed - user not authenticated',
          },
          { status: 400 }
        );
      }

      // Normal flow: preserve the original authorize URL so user can return after sign-in
      const currentUrl = req.url;
      const signInUrl = new URL('/sign-in', req.nextUrl.origin);
      signInUrl.searchParams.set('redirect_url', currentUrl);

      return NextResponse.redirect(signInUrl.toString(), 302);
    }

    /* 🔒 CSRF Protection: Store state parameter with user session */
    await db.oAuthState.create({
      data: {
        state,
        userId,
        clientId,
        expiresAt: new Date(Date.now() + AUTH_CODE_TTL * 1000), // 5 minutes
      },
    });

    /* 3️⃣ Handle prompt=none for authenticated users - skip consent page */
    if (prompt === 'none') {
      // Generate authorization code immediately (same logic as POST handler)
      const authCode = nanoid(32);
      const exp = Math.floor(Date.now() / 1000) + AUTH_CODE_TTL;

      const authCodeJwt = await new SignJWT({
        clientId,
        redirectUri,
        codeChallenge,
        codeChallengeMethod: 'S256', // Always S256 since we validated it above
        scope,
        userId,
        state, // Add state for CSRF validation
        exp,
        code: authCode,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(JWT_SECRET);

      // Return direct redirect to callback URL with authorization code
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', authCodeJwt);
      if (state) redirectUrl.searchParams.set('state', state);

      return NextResponse.redirect(redirectUrl.toString(), 302);
    }

    /* 4️⃣ Normal flow: Redirect to consent page with OAuth parameters */
    const consentUrl = new URL('/oauth/authorize', req.nextUrl.origin);
    consentUrl.searchParams.set('client_id', clientId);
    consentUrl.searchParams.set('redirect_uri', redirectUri);
    consentUrl.searchParams.set('code_challenge', codeChallenge);
    consentUrl.searchParams.set('code_challenge_method', 'S256'); // Always S256 since we validated it above
    consentUrl.searchParams.set('scope', scope);
    consentUrl.searchParams.set('response_type', responseType);
    if (state) consentUrl.searchParams.set('state', state);

    return NextResponse.redirect(consentUrl.toString(), 302);
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error during authorization',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    /* Handle authorization approval from consent page */
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized', error_description: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      client_id,
      redirect_uri,
      code_challenge,
      code_challenge_method,
      scope,
      state,
    } = body;

    /* 🔒 CSRF Protection: Verify state exists for this user/client */
    const existingState = await db.oAuthState.findFirst({
      where: {
        state,
        userId,
        clientId: client_id,
        expiresAt: { gt: new Date() }, // Not expired
      },
    });

    if (!existingState) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description:
            'Invalid or expired state parameter - CSRF protection',
        },
        { status: 400 }
      );
    }

    /* Generate authorization code */
    const authCode = nanoid(32);
    const exp = Math.floor(Date.now() / 1000) + AUTH_CODE_TTL;

    const authCodeJwt = await new SignJWT({
      clientId: client_id,
      redirectUri: redirect_uri,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      scope,
      userId,
      state, // Add state for CSRF validation
      exp,
      code: authCode,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(JWT_SECRET);

    /* Return redirect URL for client to use */
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCodeJwt);
    if (state) redirectUrl.searchParams.set('state', state);

    return NextResponse.json({ redirect_url: redirectUrl.toString() });
  } catch (error) {
    console.error('OAuth authorization POST error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error during authorization',
      },
      { status: 500 }
    );
  }
}
