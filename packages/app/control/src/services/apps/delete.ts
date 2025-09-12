import { z } from 'zod';

import { appIdSchema } from './lib/schemas';
import { db } from '@/lib/db';
import { UserId } from '../lib/schemas';
import { AppRole } from '@/lib/permissions';

export const deleteAppSchema = z.object({
  appId: appIdSchema,
});

export const deleteApp = async (
  userId: UserId,
  input: z.infer<typeof deleteAppSchema>
) => {
  return await db.echoApp.update({
    where: {
      id: input.appId,
      appMemberships: { some: { userId, role: AppRole.OWNER } },
    },
    data: { isArchived: true },
  });
};
