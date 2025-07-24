import { EchoApp, Prisma } from '@/generated/prisma';
import { DbContext, getDbContext } from '../transaction-utils';
import { MembershipStatus } from '../permissions';

// ** OAuth flow functions **

export const findEchoApp = async (
  id: string,
  userId: string,
  tx?: DbContext
): Promise<EchoApp | null> => {
  const dbContext = getDbContext(tx);
  const echoApp = await dbContext.echoApp.findFirst({
    where: {
      id,
      appMemberships: {
        some: {
          userId,
          status: MembershipStatus.ACTIVE,
          isArchived: false,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      profilePictureUrl: true,
      bannerImageUrl: true,
      homepageUrl: true,
      currentMarkupId: true,
      currentMarkup: true,
      githubId: true,
      githubType: true,
      isPublic: true,
      authorizedCallbackUrls: true,
      isArchived: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return echoApp;
};

export const updateEchoApp = async (
  id: string,
  userId: string,
  data: Prisma.EchoAppUpdateInput,
  select?: Prisma.EchoAppSelect,
  tx?: DbContext
): Promise<EchoApp> => {
  const echoApp = await findEchoApp(id, userId, tx);

  if (!echoApp) {
    throw new Error('Echo app not found');
  }

  const dbContext = getDbContext(tx);
  return dbContext.echoApp.update({
    where: { id },
    data,
    select,
  });
};
