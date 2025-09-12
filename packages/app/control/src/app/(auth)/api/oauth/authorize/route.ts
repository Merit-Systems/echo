import {
  authorizeParamsSchema,
  getAuthorizationRedirect,
  isValidRedirectUri,
} from '@/app/(auth)/_lib/authorize';
import { createZodRoute } from '@/app/api/_utils/create-route';
import { auth } from '@/auth';
import { getApp } from '@/services/apps/get';
import { NextResponse } from 'next/server';
import z from 'zod';

const querySchema = authorizeParamsSchema.extend({
  prompt: z.literal('none').optional(),
  new_user: z.literal('true').optional(),
});

export const GET = createZodRoute()
  .query(querySchema)
  .handler(async (request, { query }) => {
    const app = await getApp(query.client_id);

    if (!app) {
      return NextResponse.json(
        { error: 'not_found', error_description: 'Echo app not found' },
        { status: 404 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      const signInUrl = new URL('/login', request.nextUrl.origin);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl.toString(), 302);
    }

    if (query.prompt === 'none') {
      if (process.env.INTEGRATION_TEST_MODE !== 'true') {
        return NextResponse.json(
          {
            error: 'invalid_request',
            message: 'prompt=none is not supported',
          },
          { status: 400 }
        );
      }

      if (!isValidRedirectUri(query.redirect_uri, app.authorizedCallbackUrls)) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            message: 'redirect_uri is not authorized for this app',
          },
          { status: 400 }
        );
      }

      const redirectUrl = await getAuthorizationRedirect(query);

      if (!redirectUrl) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            error_description: 'User not authenticated',
          },
          { status: 400 }
        );
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
