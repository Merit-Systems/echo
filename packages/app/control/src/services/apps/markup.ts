import z from 'zod';

import { db } from '@/lib/db';

import { updateMarkupSchema } from './lib/schemas';
import { AppRole } from '@/lib/permissions';
import { AppId } from './lib/schemas';

export const getAppMarkup = async (appId: AppId) => {
  return await db.markUp.findUnique({
    where: { echoAppId: appId },
    select: {
      amount: true,
    },
  });
};

export const updateMarkup = async (
  appId: AppId,
  userId: string,
  data: z.infer<typeof updateMarkupSchema>
) => {
  const validatedData = updateMarkupSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error(validatedData.error.message);
  }

  return await db.markUp.upsert({
    where: {
      echoAppId: appId,
      echoApp: {
        appMemberships: { some: { userId, role: AppRole.OWNER } },
      },
    },
    update: {
      amount: data.markup,
    },
    create: {
      echoAppId: appId,
      amount: data.markup,
    },
  });
};
