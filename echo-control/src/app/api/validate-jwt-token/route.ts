import { authenticateEchoAccessJwtToken } from '@/lib/jwt-tokens';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/logger';

// POST /api/validate-jwt-token - Fast JWT validation without DB lookup
export async function POST(request: NextRequest) {
  try {
    // Use X-Echo-Token header instead of Authorization to avoid middleware conflicts
    const echoTokenHeader = request.headers.get('x-echo-token');
    const authHeader = request.headers.get('authorization');

    const tokenToValidate = echoTokenHeader ?? authHeader;

    if (!tokenToValidate) {
      logger.emit({
        severityText: 'WARN',
        body: 'Missing token header in JWT validation request',
        attributes: {},
      });
      return NextResponse.json(
        {
          valid: false,
          error: 'Missing token header (use Authorization or X-Echo-Token)',
        },
        { status: 400 }
      );
    }

    // remove Bearer if it exists
    const tokenRemovedBearer = tokenToValidate.replace('Bearer ', '');

    // Fast JWT validation (no database lookup)
    try {
      const validationResult =
        await authenticateEchoAccessJwtToken(tokenRemovedBearer);

      logger.emit({
        severityText: 'INFO',
        body: 'JWT token validation successful',
        attributes: {
          userId: validationResult.userId,
          appId: validationResult.appId,
          scope: validationResult.scope,
        },
      });

      return NextResponse.json({
        valid: true,
        userId: validationResult.userId,
        appId: validationResult.appId,
        scope: validationResult.scope,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        logger.emit({
          severityText: 'WARN',
          body: 'Invalid JWT token provided',
          attributes: {
            error: error.message,
          },
        });
        return NextResponse.json(
          { valid: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'JWT token validation error',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Legacy GET support for backward compatibility
export async function GET(request: NextRequest) {
  return POST(request);
}
