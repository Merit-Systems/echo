import { NextResponse } from 'next/server';
import type { MiddlewareFunction } from '../../_utils/types';
import { authenticateEchoAccessJwtToken } from '@/lib/jwt-tokens';
import { hashApiKey } from '@/lib/crypto';
import { db } from '@/lib/db';

type MiddlewareContext = {
  userId: string;
};

// Create a middleware that checks permissions
export const permissionCheckMiddleware: MiddlewareFunction<
  MiddlewareContext
> = async ({ next, request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  const isJWT = token.split('.').length === 3;

  if (isJWT) {
    try {
      const { userId } = await authenticateEchoAccessJwtToken(token);
      return next({ ctx: { userId } });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    try {
      const keyHash = hashApiKey(token);
      const apiKey = await db.apiKey.findUnique({
        where: {
          keyHash,
        },
        include: {
          user: true,
          echoApp: true,
        },
      });
      if (
        !apiKey ||
        apiKey.isArchived ||
        apiKey.user.isArchived ||
        apiKey.echoApp.isArchived
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return next({ ctx: { userId: apiKey.user.id } });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
};
