import {
  handleInitialTokenIssuance,
  handleRefreshToken,
} from '@/lib/jwt-tokens';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/logger';

export async function POST(req: NextRequest) {
  try {
    /* 1️⃣ Parse the token request - handle both JSON and form-encoded */
    let body: Record<string, string>;
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      // Default to JSON
      body = (await req.json()) as Record<string, string>;
    }

    const { grant_type, code, redirect_uri, code_verifier } = body;

    // Capture metadata from forwarded headers if present, fallback to standard
    const deviceName = undefined; // derive later from userAgent if desired
    const forwardedUserAgent =
      req.headers.get('x-client-user-agent') ??
      req.headers.get('user-agent') ??
      undefined;
    const forwardedIp =
      req.headers.get('x-client-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      req.headers.get('cf-connecting-ip') ??
      undefined;

    const client_id =
      body.client_id ?? req.nextUrl.searchParams.get('client_id');

    // Validate required parameters
    if (grant_type !== 'authorization_code' && grant_type !== 'refresh_token') {
      logger.emit({
        severityText: 'WARN',
        body: 'Unsupported grant type in OAuth token exchange',
        attributes: {
          grant_type,
        },
      });
      return NextResponse.json(
        {
          error: 'unsupported_grant_type',
          error_description:
            'Error: unsupported grant type. Only authorization_code and refresh_token grant types are supported',
        },
        { status: 400 }
      );
    }

    if (grant_type === 'refresh_token') {
      const { refresh_token } = body;

      if (!refresh_token) {
        logger.emit({
          severityText: 'WARN',
          body: 'Missing refresh_token in OAuth token exchange',
          attributes: {
            grant_type,
          },
        });
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'refresh_token is required',
          },
          { status: 400 }
        );
      }

      const result = await handleRefreshToken(refresh_token, {
        userAgent: forwardedUserAgent,
        ipAddress: forwardedIp,
        deviceName,
      });

      // Check if result is an error
      if ('error' in result) {
        logger.emit({
          severityText: 'WARN',
          body: 'Failed to refresh OAuth token',
          attributes: {
            error: result.error,
            error_description: result.error_description,
          },
        });
        return NextResponse.json(result, { status: 400 });
      }

      logger.emit({
        severityText: 'INFO',
        body: 'Successfully refreshed OAuth token',
        attributes: {
          grant_type: 'refresh_token',
        },
      });

      // Return successful refresh token response
      return NextResponse.json(result);
    }

    if (!code || !redirect_uri || !client_id || !code_verifier) {
      logger.emit({
        severityText: 'WARN',
        body: 'Missing required parameters for authorization_code grant',
        attributes: {
          hasCode: !!code,
          hasRedirectUri: !!redirect_uri,
          hasClientId: !!client_id,
          hasCodeVerifier: !!code_verifier,
        },
      });
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    const result = await handleInitialTokenIssuance({
      code,
      redirect_uri,
      client_id,
      code_verifier,
      deviceName,
      userAgent: forwardedUserAgent,
      ipAddress: forwardedIp,
    });

    // Check if result is an error
    if ('error' in result) {
      logger.emit({
        severityText: 'WARN',
        body: 'Failed to issue OAuth token',
        attributes: {
          error: result.error,
          error_description: result.error_description,
          client_id,
        },
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.emit({
      severityText: 'INFO',
      body: 'Successfully issued OAuth token',
      attributes: {
        client_id,
        grant_type: 'authorization_code',
      },
    });

    // Return successful token response
    return NextResponse.json(result);
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'OAuth token exchange error',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error during token exchange',
      },
      { status: 500 }
    );
  }
}
