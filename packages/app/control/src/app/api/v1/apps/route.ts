import { NextResponse } from 'next/server';
import { logger } from '@/logger';
import { authRoute } from '../../../../lib/api/auth-route';
import { listAppsSchema, listOwnerApps } from '@/services/apps/list';
import { paginationSchema } from '@/services/lib/pagination';

const querySchema = paginationSchema.extend(listAppsSchema.shape);

// GET /api/v1/apps - List all Echo apps for the authenticated user
export const GET = authRoute.query(querySchema).handler(async (_, context) => {
  const paginatedAppsResponse = await listOwnerApps(
    context.ctx.userId,
    listAppsSchema.parse(context.query),
    paginationSchema.parse(context.query)
  );

  logger.emit({
    severityText: 'INFO',
    body: 'Successfully fetched Echo apps',
    attributes: {
      userId: context.ctx.userId,
      appCount: paginatedAppsResponse.total_count,
    },
  });

  return NextResponse.json(paginatedAppsResponse);
});
