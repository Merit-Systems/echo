import { SignJWT, jwtVerify } from 'jose';

import z from 'zod';

import { nanoid } from 'nanoid';

import { addSeconds, getUnixTime } from 'date-fns';

import { env } from '@/env';
import { logger } from '@/logger';

const API_ECHO_ACCESS_JWT_SECRET = new TextEncoder().encode(
  env.API_ECHO_ACCESS_JWT_SECRET
);

const accessTokenInputSchema = z.object({
  user_id: z.uuid(),
  app_id: z.uuid(),
  session_id: z.uuid(),
  scope: z.string().default('llm:invoke offline_access'),
  key_version: z.number().default(1),
});

export const createEchoAccessJwt = async (
  params: z.input<typeof accessTokenInputSchema>
) => {
  const { user_id, app_id, scope, key_version, session_id } =
    accessTokenInputSchema.parse(params);

  const expiry = createEchoAccessJwtExpiry();

  const access_token = await new SignJWT({
    user_id,
    app_id,
    scope,
    key_version,
    ...(session_id ? { session_id } : {}),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user_id)
    .setAudience(app_id)
    .setJti(nanoid(16))
    .setIssuedAt(getUnixTime(new Date()))
    .setExpirationTime(getUnixTime(expiry))
    .sign(API_ECHO_ACCESS_JWT_SECRET);

  return {
    access_token,
    scope,
    access_token_expiry: expiry,
  };
};

const createEchoAccessJwtExpiry = (): Date => {
  const expiry = addSeconds(new Date(), env.OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS);
  logger.emit({
    severityText: 'DEBUG',
    body: 'Echo access token expiry calculated',
    attributes: {
      expiryTime: expiry.toISOString(),
      function: 'createEchoAccessTokenExpiry',
    },
  });
  return expiry;
};

const accessTokenPayloadSchema = accessTokenInputSchema.extend({
  sub: z.uuid(),
  aud: z.uuid(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
});

export const authenticateEchoAccessJwt = async (jwtToken: string) => {
  const { payload } = await jwtVerify(jwtToken, API_ECHO_ACCESS_JWT_SECRET, {
    clockTolerance: 5, // 5 seconds clock skew tolerance
  });

  // Type assertion with validation
  const parsedPayload = accessTokenPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error('Invalid JWT token');
  }

  if (parsedPayload.data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT token has expired');
  }

  return parsedPayload.data;
};
