import { NextResponse } from 'next/server';
import { logger } from '@/logger';
import { authMiddleware } from '@/lib/api/auth-route';
import { getFullUser } from '@/services/user/get';
import { getUnixTime } from 'date-fns';
import { oauthRoute, OAuthRouteError } from '../../../_lib/oauth-route';
import { OAuthErrorType } from '../../../_lib/oauth-error';

export const GET = oauthRoute
  .use(authMiddleware)
  .handler(async (_, { ctx: { userId } }) => {
    const user = await getFullUser(userId);

    if (!user) {
      logger.emit({
        severityText: 'WARN',
        body: 'User not found for valid access token in OAuth userinfo endpoint',
        attributes: {
          userId,
        },
      });
      return OAuthRouteError({
        error: OAuthErrorType.INVALID_REQUEST,
        error_description: 'User not found',
      });
    }

    return NextResponse.json(
      {
        sub: user.id,
        email: user.email,
        email_verified: true,
        name: user.name || user.email,
        preferred_username: user.name || user.email,
        given_name: user.name?.split(' ')[0] || '',
        family_name: user.name?.split(' ').slice(1).join(' ') || '',
        updated_at: getUnixTime(user.updatedAt),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      }
    );
  });

// POST is also allowed for OIDC UserInfo endpoint
export const POST = GET;
