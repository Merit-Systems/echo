import NextAuth from 'next-auth';

import { authConfig } from './config';

export const { auth: middleware } = NextAuth(authConfig);
