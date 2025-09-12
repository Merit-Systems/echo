import { db } from '@/lib/db';
import { User } from '@/generated/prisma';

export const acceptLatestTermsAndServices = async (
  userId: string
): Promise<{ updated: boolean; user: User }> => {
  const version = process.env.LATEST_TERMS_AND_SERVICES_VERSION;

  if (!version) {
    throw new Error('LATEST_TERMS_AND_SERVICES_VERSION is not set');
  }

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({ where: { id: userId } });

    if (!existing) {
      throw new Error('User not found');
    }

    const current = existing.latestTosVersion
      ? existing.latestTosVersion.toString()
      : null;

    if (current === version) {
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
  const version = process.env.LATEST_PRIVACY_POLICY_VERSION;

  if (!version) {
    throw new Error('LATEST_PRIVACY_POLICY_VERSION is not set');
  }

  return await db.$transaction(async tx => {
    const existing = await tx.user.findUnique({ where: { id: userId } });

    if (!existing) {
      throw new Error('User not found');
    }

    const current = existing.latestPrivacyVersion
      ? existing.latestPrivacyVersion.toString()
      : null;

    if (current === version) {
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
  currentVersion: string | null;
  latestVersion: string;
}> => {
  const version = process.env.LATEST_TERMS_AND_SERVICES_VERSION;

  if (!version) {
    throw new Error('LATEST_TERMS_AND_SERVICES_VERSION is not set');
  }

  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  const current = existing.latestTosVersion
    ? existing.latestTosVersion.toString()
    : null;

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
  currentVersion: string | null;
  latestVersion: string;
}> => {
  const version = process.env.LATEST_PRIVACY_POLICY_VERSION;

  if (!version) {
    throw new Error('LATEST_PRIVACY_POLICY_VERSION is not set');
  }

  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new Error('User not found');
  }

  const current = existing.latestPrivacyVersion
    ? existing.latestPrivacyVersion.toString()
    : null;

  return {
    needs: current !== version,
    currentVersion: current,
    latestVersion: version,
  };
};
