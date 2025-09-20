import { NextResponse } from 'next/server';

import z from 'zod';

import { handleRefreshToken, handleRefreshTokenSchema } from './_lib/refresh';
import { handleIssueToken, handleIssueTokenSchema } from './_lib/issue';

import {
  oauthRoute,
  OAuthRouteError,
  oauthValidationError,
} from '../../../_lib/oauth-route';

import type { TokenMetadata } from './_lib/types';
import { OAuthError, OAuthErrorType } from '../../../_lib/oauth-error';

const invalidGrantError = oauthValidationError({
  error: OAuthErrorType.UNSUPPORTED_GRANT_TYPE,
  error_description:
    'grant_type can only be authorization_code or refresh_token',
});

const bodySchema = z.discriminatedUnion(
  'grant_type',
  [
    handleIssueTokenSchema.extend({
      grant_type: z.literal('authorization_code', {
        error: invalidGrantError,
      }),
    }),
    handleRefreshTokenSchema.extend({
      grant_type: z.literal('refresh_token', {
        error: invalidGrantError,
      }),
    }),
  ],
  {
    error: oauthValidationError({
      error: OAuthErrorType.INVALID_REQUEST,
      error_description:
        'Must provide a valid grant_type (authorization_code or refresh_token)',
    }),
  }
);

export const POST = oauthRoute
  .body(bodySchema)
  .handler(async (req, { body }) => {
    const metadata: TokenMetadata = {
      deviceName: undefined,
      userAgent:
        req.headers.get('x-client-user-agent') ||
        req.headers.get('user-agent') ||
        undefined,
      ipAddress:
        req.headers.get('x-client-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.headers.get('cf-connecting-ip') ||
        undefined,
    };

    try {
      switch (body.grant_type) {
        case 'authorization_code': {
          const result = await handleIssueToken(body, metadata);
          return NextResponse.json(result);
        }
        case 'refresh_token': {
          const result = await handleRefreshToken(body, metadata);
          return NextResponse.json(result);
        }
      }
    } catch (error) {
      console.log('refresh token error', error);
      if (error instanceof OAuthError) {
        return OAuthRouteError(error.body);
      }

      return OAuthRouteError({
        error: OAuthErrorType.SERVER_ERROR,
        error_description:
          error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
