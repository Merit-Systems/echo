import { cache } from 'react';

import NextAuth from 'next-auth';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { db } from '@/lib/db';

import { authConfig } from './config';
import { emailProviders } from './providers';

export const {
  handlers,
  signIn,
  signOut,
  auth: uncachedAuth,
} = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...emailProviders],
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
});

export const auth = cache(uncachedAuth);
