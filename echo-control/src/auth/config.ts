import { oauthProviders, testProviders } from './providers';

import type { DefaultSession, NextAuthConfig } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';
import { skipCSRFCheck } from '@auth/core';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
  }
}

const IS_TEST_MODE = process.env.INTEGRATION_TEST_MODE === 'true';

export const authConfig = {
  providers: IS_TEST_MODE ? testProviders : oauthProviders,
  // Only allow skipCSRFCheck in test mode
  skipCSRFCheck: IS_TEST_MODE ? skipCSRFCheck : undefined,
  pages: {
    signIn: '/login',
    signOut: '/logout',
    verifyRequest: '/verify-email',
    newUser: '/welcome',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id!;
      }

      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  cookies: {
    sessionToken: {
      name: 'echo_session',
    },
    callbackUrl: {
      name: 'echo_callback',
    },
    pkceCodeVerifier: {
      name: 'echo_pkce_code_verifier',
    },
    state: {
      name: 'echo_state',
    },
    nonce: {
      name: 'echo_nonce',
    },
    csrfToken: {
      name: 'echo_csrf_token',
    },
    webauthnChallenge: {
      name: 'echo_webauthn_challenge',
    },
  },
} satisfies NextAuthConfig;
