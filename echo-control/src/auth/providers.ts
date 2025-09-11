import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';

import { db } from '@/lib/db';

import type { OAuthProvider } from './types';
import type { EmailConfig, Provider } from 'next-auth/providers';
import type { GoogleProfile } from 'next-auth/providers/google';

export const oauthProviders: OAuthProvider[] = [
  GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    profile: (profile: GoogleProfile) => ({
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    }),
  }),
  GithubProvider({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
];

export const emailProviders: EmailConfig[] = [
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY,
    from: 'no-reply@merit.systems',
  }),
];

export const testProviders: Provider[] = [
  Credentials({
    id: 'test-user-1',
    name: 'Test1',
    credentials: {},
    authorize: async () => {
      const existingUser = await db.user.findUnique({
        where: {
          email: 'test@example.com',
        },
      });

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await db.user.create({
        data: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Integration Test User',
          email: 'test@example.com',
          image: 'http://echo.merit.systems/logo/light.svg',
        },
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
      const existingUser = await db.user.findUnique({
        where: {
          email: 'test2@example.com',
        },
      });

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await db.user.create({
        data: {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Integration Test User',
          email: 'test2@example.com',
          image: 'http://echo.merit.systems/logo/light.svg',
        },
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
      const existingUser = await db.user.findUnique({
        where: {
          email: 'test3@example.com',
        },
      });

      if (existingUser) {
        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      }

      const user = await db.user.create({
        data: {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          name: 'Third Test User',
          email: 'test3@example.com',
          image: 'http://echo.merit.systems/logo/light.svg',
        },
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
