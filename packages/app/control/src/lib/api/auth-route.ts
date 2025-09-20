import { NextResponse } from 'next/server';

import { createZodRoute } from './create-route';

import { findApiKeyByHash } from '@/services/api-keys';

import { authenticateEchoAccessJwt } from '@/lib/access-token';

import type { MiddlewareFunction } from './types';

type MiddlewareContext = {
  userId: string;
  appId: string;
};

// Create a middleware that checks permissions
export const authMiddleware: MiddlewareFunction<
  Record<string, unknown>,
  MiddlewareContext
> = async ({ next, request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  const isJWT = token.split('.').length === 3;

  if (isJWT) {
    try {
      const { user_id, app_id } = await authenticateEchoAccessJwt(token);
      return next({ ctx: { userId: user_id, appId: app_id } });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  } else {
    try {
      const apiKey = await findApiKeyByHash(token);
      if (!apiKey) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return next({
        ctx: { userId: apiKey.user.id, appId: apiKey.echoApp.id },
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }
};

export const authRoute = createZodRoute().use(authMiddleware);
