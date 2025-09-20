import { db } from '@/lib/db';
import { User } from '@/generated/prisma';
import { env } from '@/env';

export const acceptLatestTermsAndServices = async (
  userId: string
): Promise<{ updated: boolean; user: User }> => {
  const version = env.LATEST_TERMS_AND_SERVICES_VERSION;

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({ where: { id: userId } });

    if (!existing) {
      throw new Error('User not found');
    }

    if (existing.latestTosVersion?.toNumber() === version) {
      return {
        updated: false,
        user: existing,
      };
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { latestTosVersion: version },
    });

    return {
      updated: true,
      user: updated,
    };
  });
};

export const acceptLatestPrivacyPolicy = async (
  userId: string
): Promise<{ updated: boolean; user: User }> => {
  const version = env.LATEST_PRIVACY_POLICY_VERSION;

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({ where: { id: userId } });

    if (!existing) {
      throw new Error('User not found');
    }

    if (existing.latestPrivacyVersion?.toNumber() === version) {
      return {
        updated: false,
        user: existing,
      };
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { latestPrivacyVersion: version },
    });

    return {
      updated: true,
      user: updated,
    };
  });
};

export const needsLatestTermsAndServices = async (
  userId: string
): Promise<{
  needs: boolean;
  currentVersion: number | undefined;
  latestVersion: number;
}> => {
  const version = env.LATEST_TERMS_AND_SERVICES_VERSION;

  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  const current = existing.latestTosVersion?.toNumber();

  return {
    needs: current !== version,
    currentVersion: current,
    latestVersion: version,
  };
};

export const needsLatestPrivacyPolicy = async (
  userId: string
): Promise<{
  needs: boolean;
  currentVersion: number | undefined;
  latestVersion: number;
}> => {
  const version = env.LATEST_PRIVACY_POLICY_VERSION;

  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  const current = existing.latestPrivacyVersion?.toNumber();

  return {
    needs: current !== version,
    currentVersion: current,
    latestVersion: version,
  };
};
