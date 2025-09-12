import { z } from 'zod';

import { db } from '@/lib/db';

import { githubLinkSchema, resolveGithubId } from '../github/link';

export const getGithubLinkForUser = async (userId: string) => {
  return await db.githubLink.findUnique({
    where: { userId },
  });
};

export const updateUserGithubLinkSchema = githubLinkSchema;

export const updateGithubLinkForUser = async (
  userId: string,
  data: z.infer<typeof updateUserGithubLinkSchema>
) => {
  const validatedData = updateUserGithubLinkSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error(validatedData.error.message);
  }

  const githubId = await resolveGithubId(data);

  const githubLink = await db.githubLink.upsert({
    where: { userId },
    update: {
      githubId,
      githubType: data.type,
      githubUrl: data.url.toString(),
      isArchived: false,
      archivedAt: null,
    },
    create: {
      userId,
      githubId,
      githubType: data.type,
      githubUrl: data.url.toString(),
      isArchived: false,
    },
  });

  await db.user.update({
    where: { id: userId },
    data: { referralGithubUserId: githubLink.id },
  });

  return githubLink;
};
