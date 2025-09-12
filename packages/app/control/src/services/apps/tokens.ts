import { db } from '@/lib/db';

import type { AppId } from './lib/schemas';

export const countAppTokens = async (appId: AppId) => {
  return await db.refreshToken.count({
    where: {
      echoAppId: appId,
    },
  });
};
