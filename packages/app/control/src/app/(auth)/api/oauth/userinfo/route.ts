import { NextRequest, NextResponse } from 'next/server';
import { authenticateEchoAccessJwtToken } from '@/lib/jwt-tokens';
import { db } from '@/lib/db';
import { logger } from '@/logger';

// GET /api/oauth/userinfo - OIDC UserInfo Endpoint
// https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing or invalid authorization header',
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Authenticate using the OAuth access token (JWT)
    let userId: string;
    try {
      const authResult = await authenticateEchoAccessJwtToken(accessToken);
      userId = authResult.userId;
    } catch (_error) {
      logger.emit({
        severityText: 'WARN',
        body: 'Invalid or expired access token in OAuth userinfo endpoint',
        attributes: {
          error: _error instanceof Error ? _error.message : String(_error),
        },
      });
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Invalid or expired access token',
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.emit({
        severityText: 'WARN',
        body: 'User not found for valid access token in OAuth userinfo endpoint',
        attributes: {
          userId,
        },
      });
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'User not found',
        },
        { status: 401 }
      );
    }

    // Return OIDC UserInfo response
    // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
    const userInfo = {
      sub: user.id, // Subject - unique user identifier
      email: user.email,
      email_verified: user.emailVerified,
      name: user.name || user.email,
      preferred_username: user.name || user.email,
      given_name: user.name?.split(' ')[0] || '',
      family_name: user.name?.split(' ').slice(1).join(' ') || '',
      updated_at: Math.floor(user.updatedAt.getTime() / 1000), // Unix timestamp
    };

    // Remove empty/null values to keep response clean
    const cleanUserInfo = Object.fromEntries(
      Object.entries(userInfo).filter(
        ([, value]) => value !== null && value !== ''
      )
    );

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully returned OAuth userinfo',
      attributes: {
        userId: user.id,
      },
    });

    return NextResponse.json(cleanUserInfo, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'UserInfo endpoint error',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST is also allowed for OIDC UserInfo endpoint
export async function POST(request: NextRequest) {
  return GET(request);
}
