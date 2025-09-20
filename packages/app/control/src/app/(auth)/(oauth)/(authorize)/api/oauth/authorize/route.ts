import z from 'zod';

import {
  authorizeParamsSchema,
  getAuthorizationRedirect,
} from '../../../_lib/authorize';
import { isValidRedirectUri } from '../../../../_lib/redirect-uri';
import { auth } from '@/auth';
import { env } from '@/env';
import { getApp } from '@/services/apps/get';
import { NextResponse } from 'next/server';
import {
  oauthRoute,
  oauthValidationError,
  OAuthRouteError,
} from '@/app/(auth)/(oauth)/_lib/oauth-route';
import { OAuthErrorType } from '@/app/(auth)/(oauth)/_lib/oauth-error';

const querySchema = authorizeParamsSchema.extend({
  response_type: z
    .literal('code', {
      error: oauthValidationError({
        error: OAuthErrorType.UNSUPPORTED_RESPONSE_TYPE,
        error_description:
          'Only authorization code flow (response_type=code) is supported',
      }),
    })
    .default('code'),
  prompt: z
    .literal('none', {
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'Only prompt=none is supported',
      }),
    })
    .optional(),
  new_user: z
    .literal('true', {
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'new_user can only be true',
      }),
    })
    .optional(),
  referral_code: z
    .string({
      error: oauthValidationError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'referral_code can only be a string',
      }),
    })
    .optional(),
});

export const GET = oauthRoute
  .query(querySchema)
  .handler(async (request, { query }) => {
    const app = await getApp(query.client_id);

    if (!app) {
      return OAuthRouteError({
        error: OAuthErrorType.INVALID_CLIENT,
        error_description: 'Echo app not found',
      });
    }

    const session = await auth();
    if (!session?.user) {
      const signInUrl = new URL('/login', request.nextUrl.origin);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl.toString(), 302);
    }

    if (query.prompt === 'none') {
      if (!env.INTEGRATION_TEST_MODE) {
        return OAuthRouteError({
          error: OAuthErrorType.INVALID_REQUEST,
          error_description: 'prompt=none is not supported',
        });
      }

      if (!isValidRedirectUri(query.redirect_uri, app.authorizedCallbackUrls)) {
        return OAuthRouteError({
          error: OAuthErrorType.INVALID_REQUEST,
          error_description: 'redirect_uri is not authorized for this app',
        });
      }

      const redirectUrl = await getAuthorizationRedirect(query);

      if (!redirectUrl) {
        return OAuthRouteError({
          error: OAuthErrorType.INVALID_REQUEST,
          error_description: 'User not authenticated',
        });
      }

      return NextResponse.redirect(redirectUrl.toString(), 302);
    }

    const consentUrl = new URL('/oauth/authorize', request.nextUrl.origin);
    (
      [
        'client_id',
        'redirect_uri',
        'code_challenge',
        'code_challenge_method',
        'scope',
        'response_type',
        'state',
        'referral_code',
        'new_user',
      ] as const
    ).forEach(param => {
      if (query[param]) {
        consentUrl.searchParams.set(param, query[param]);
      }
    });

    return NextResponse.redirect(consentUrl.toString(), 302);
  });
