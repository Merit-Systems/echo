import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';

import { getUserByEmail } from '@/services/db/user/get';
import { createUser } from '@/services/db/user/create';

import { env } from '@/env';

import type { OAuthProvider } from './types';
import type { EmailConfig, Provider } from 'next-auth/providers';
import type { GoogleProfile } from 'next-auth/providers/google';

export const oauthProviders: OAuthProvider[] = [
  GoogleProvider({
    clientId: env.AUTH_GOOGLE_ID,
    clientSecret: env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    profile: (profile: GoogleProfile) => ({
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    }),
  }),
  GithubProvider({
    clientId: env.AUTH_GITHUB_ID,
    clientSecret: env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
];

export const emailProviders: EmailConfig[] = [
  Resend({
    apiKey: env.AUTH_RESEND_KEY,
    from: 'no-reply@merit.systems',
  }),
];

export const testProviders: Provider[] = [
  Credentials({
    id: 'test-user-1',
    name: 'Test1',
    credentials: {},
    authorize: async () => {
      const existingUser = await getUserByEmail('test@example.com');

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await createUser({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Integration Test User',
        email: 'test@example.com',
        image: 'http://echo.merit.systems/logo/light.svg',
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
  Credentials({
    id: 'test-user-2',
    name: 'Second Test User',
    credentials: {},
    authorize: async () => {
      const existingUser = await getUserByEmail('test2@example.com');

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await createUser({
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Integration Test User',
        email: 'test2@example.com',
        image: 'http://echo.merit.systems/logo/light.svg',
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
  Credentials({
    id: 'test-user-3',
    name: 'Third Test User',
    credentials: {},
    authorize: async () => {
      const existingUser = await getUserByEmail('test3@example.com');

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await createUser({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Third Test User',
        email: 'test3@example.com',
        image: 'http://echo.merit.systems/logo/light.svg',
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
  Credentials({
    id: 'local-user',
    name: 'Local User',
    credentials: {},
    authorize: async () => {
      const existingUser = await getUserByEmail('local@example.com');

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await createUser({
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Local User',
        email: 'local@example.com',
        image: 'http://echo.merit.systems/logo/light.svg',
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];
