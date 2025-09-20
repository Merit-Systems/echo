import { NextResponse } from 'next/server';
import { logger } from '@/logger';
import { authRoute } from '../../../../../lib/api/auth-route';
import { z } from 'zod';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { getApp } from '@/services/apps/get';

const paramsSchema = z.object({
  id: appIdSchema,
});

export const GET = authRoute
  .params(paramsSchema)
  .handler(async (_, context) => {
    const { id } = context.params;
    const { appId } = context.ctx;
    if (appId !== id) {
      logger.emit({
        severityText: 'WARN',
        body: 'Access denied: User trying to access different app',
        attributes: {
          requestedAppId: id,
          userAppId: appId,
          userId: context.ctx.userId,
        },
      });
      return NextResponse.json(
        { message: 'Access denied: App not found' },
        { status: 403 }
      );
    }
    const app = await getApp(id);
    if (!app) {
      return NextResponse.json({ message: 'App not found' }, { status: 404 });
    }
    const response = NextResponse.json(app);
    return response;
  });
