import z from 'zod';

import { AppId } from './lib/schemas';

import { db } from '@/lib/db';

import { AppRole } from '@/lib/permissions';

export const updateAppSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    homepageUrl: z.url().optional(),
    profilePictureUrl: z.url().optional(),
    authorizedCallbackUrls: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(data => Object.values(data).some(value => value !== undefined), {
    message: 'At least one field must be provided',
    path: [],
  });

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
