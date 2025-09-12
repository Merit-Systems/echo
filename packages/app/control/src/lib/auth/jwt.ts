import { env } from '@/env';
import { jwtVerify } from 'jose/jwt/verify';
import z from 'zod';

const API_ECHO_ACCESS_JWT_SECRET = new TextEncoder().encode(
  env.API_ECHO_ACCESS_JWT_SECRET
);

const jwtPayloadSchema = z.object({
  user_id: z.string(),
  app_id: z.string(),
  scope: z.string(),
  key_version: z.number(),
  sid: z.string().optional(),
  sub: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
});

export const authenticateEchoAccessJwt = async (jwtToken: string) => {
  const { payload } = await jwtVerify(jwtToken, API_ECHO_ACCESS_JWT_SECRET, {
    clockTolerance: 5, // 5 seconds clock skew tolerance
  });

  // Type assertion with validation
  const parsedPayload = jwtPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error('Invalid JWT token');
  }

  if (parsedPayload.data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT token has expired');
  }

  return parsedPayload.data;
};
