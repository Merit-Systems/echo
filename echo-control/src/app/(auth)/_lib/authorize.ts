import { z } from 'zod';

import { nanoid } from 'nanoid';

import { auth } from '@/auth';
import { SignJWT } from 'jose';

// TTL for the one-time authorization code (seconds)
const AUTH_CODE_TTL = 300; // 5 minutes

// JWT secret for signing authorization codes (use a proper secret in production)
const JWT_SECRET = new TextEncoder().encode(
  process.env.OAUTH_CODE_SIGNING_JWT_SECRET ??
    'your-secret-key-change-in-production'
);

export const authorizeParamsSchema = z.object({
  client_id: z.uuid('client_id must be a valid UUID'),
  redirect_uri: z.url('redirect_uri must be a valid URL'),
  code_challenge: z
    .string('code_challenge must be a string')
    .min(43, 'code_challenge must be at least 43 characters')
    .max(128, 'code_challenge must be at most 128 characters')
    .regex(/^[A-Za-z0-9_-]+$/, {
      message: 'code_challenge must be base64url encoded',
    }),
  code_challenge_method: z.literal('S256', {
    error: 'Only S256 code challenge method is supported',
  }),
  scope: z.string('missing scope').default('llm:invoke offline_access'),
  response_type: z
    .literal('code', {
      error: 'Only authorization code flow (response_type=code) is supported',
    })
    .default('code'),
  state: z.string().default(nanoid),
  referral_code: z.uuid().optional(),
});

export type AuthorizeParams = z.infer<typeof authorizeParamsSchema>;

export const getAuthorizationRedirect = async ({
  client_id,
  redirect_uri,
  code_challenge,
  code_challenge_method,
  scope,
  state,
}: AuthorizeParams) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  /* Generate authorization code */
  const authCode = nanoid(32);
  const exp = Math.floor(Date.now() / 1000) + AUTH_CODE_TTL;

  const authCodeJwt = await new SignJWT({
    clientId: client_id,
    redirectUri: redirect_uri,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
    scope,
    userId,
    exp,
    code: authCode,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  /* Return redirect URL for client to use */
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', authCodeJwt);
  if (state) redirectUrl.searchParams.set('state', state);

  return redirectUrl.toString();
};

export const isValidRedirectUri = (
  redirectUri: string,
  authorizedCallbackUrls: string[]
) => {
  const isLocalRedirect = redirectUri.startsWith('http://localhost:');
  const redirectWithoutTrailingSlash = redirectUri.replace(/\/$/, '');
  return (
    isLocalRedirect ||
    authorizedCallbackUrls.includes(redirectUri) ||
    authorizedCallbackUrls.includes(redirectWithoutTrailingSlash)
  );
};
