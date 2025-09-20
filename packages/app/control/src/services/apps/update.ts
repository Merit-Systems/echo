import z from 'zod';

import { AppId, updateAppSchema } from './lib/schemas';

import { db } from '@/lib/db';

import { AppRole } from '@/lib/permissions';

export const updateApp = async (
  appId: AppId,
  userId: string,
  data: z.infer<typeof updateAppSchema>
) => {
  const validatedData = updateAppSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error(validatedData.error.message);
  }

  return await db.echoApp.update({
    where: {
      id: appId,
      appMemberships: { some: { userId, role: AppRole.OWNER } },
    },
    data: Object.fromEntries(
      Object.entries(validatedData.data).filter(
        ([, value]) => value !== undefined
      )
    ),
  });
};
