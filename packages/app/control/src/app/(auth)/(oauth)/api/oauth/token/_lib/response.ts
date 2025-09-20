import { differenceInSeconds } from 'date-fns';

import { createEchoAccessJwt } from '@/lib/access-token';

import { createRefreshToken } from './refresh';

import type { EchoApp, User } from '@/generated/prisma';

interface TokenResponseParams {
  user: User;
  app: EchoApp;
  accessToken: Awaited<ReturnType<typeof createEchoAccessJwt>>;
  refreshToken: Awaited<ReturnType<typeof createRefreshToken>>;
}

export const tokenResponse = ({
  user,
  app,
  accessToken,
  refreshToken,
}: TokenResponseParams) => ({
  access_token: accessToken.access_token,
  token_type: 'Bearer',
  expires_in: differenceInSeconds(accessToken.access_token_expiry, new Date()),
  refresh_token: refreshToken.token,
  refresh_token_expires_in: differenceInSeconds(
    refreshToken.expiresAt,
    new Date()
  ),
  scope: accessToken.scope,
  user: {
    id: user.id,
    email: user.email,
    name: user.name || '',
  },
  echo_app: {
    id: app.id,
    name: app.name,
    description: app.description || '',
  },
});
