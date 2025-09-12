import { db } from '@/lib/db';

import { appSelect } from './lib/select';
import { AppId } from './lib/schemas';

import { AppRole } from '@/lib/permissions';

export const getApp = async (appId: AppId) => {
  return await db.echoApp.findUnique({
    where: { id: appId, isArchived: false },
    select: appSelect,
  });
};

export const getAppOwner = async (appId: AppId) => {
  const owner = await db.appMembership.findFirst({
    where: {
      echoAppId: appId,
      role: AppRole.OWNER,
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return owner?.user;
};
