import type { z } from 'zod';

import { db } from '@/lib/db';

import { githubLinkSchema, resolveGithubId } from '../github/link';

export const getGithubLink = async (appId: string) => {
  return await db.githubLink.findUnique({
    where: { echoAppId: appId },
  });
};

export const updateGithubLinkSchema = githubLinkSchema;

export const updateGithubLink = async (
  appId: string,
  data: z.infer<typeof updateGithubLinkSchema>
) => {
  const validatedData = updateGithubLinkSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error(validatedData.error.message);
  }

  const githubId = await resolveGithubId(data);

  return await db.githubLink.upsert({
    where: { echoAppId: appId },
    update: {
      githubId,
      githubType: data.type,
      githubUrl: data.url.toString(),
    },
    create: {
      echoAppId: appId,
      githubId,
      githubType: data.type,
      githubUrl: data.url.toString(),
    },
  });
};
