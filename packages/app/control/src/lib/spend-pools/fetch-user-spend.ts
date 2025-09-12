import { Prisma } from '@/generated/prisma';
import { db } from '../db';
import { UserSpendInfo } from './types';

export async function getGlobalFreeTierSpendPoolInfo(
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<{
  spendPoolBalance: number;
  perUserSpendLimit: number | null;
}> {
  const client = tx ?? db;
  const spendPool = await client.spendPool.findFirst({
    where: {
      echoAppId,
      isArchived: false,
    },
  });

  if (!spendPool) {
    return {
      spendPoolBalance: 0,
      perUserSpendLimit: 0,
    };
  }

  const spendLimit = spendPool.perUserSpendLimit
    ? Number(spendPool.perUserSpendLimit)
    : null;

  return {
    spendPoolBalance:
      Number(spendPool.totalPaid) - Number(spendPool.totalSpent),
    perUserSpendLimit: spendLimit,
  };
}

export async function getGlobalFreeTierSpendPoolInfoBatch(
  echoAppIds: string[],
  tx?: Prisma.TransactionClient
): Promise<
  Map<
    string,
    {
      spendPoolBalance: number;
      perUserSpendLimit: number | null;
    }
  >
> {
  const client = tx ?? db;
  const spendPools = await client.spendPool.findMany({
    where: {
      echoAppId: {
        in: echoAppIds,
      },
      isArchived: false,
    },
  });

  const result = new Map<
    string,
    {
      spendPoolBalance: number;
      perUserSpendLimit: number | null;
    }
  >();

  for (const echoAppId of echoAppIds) {
    const spendPool = spendPools.find(
      spendPool => spendPool.echoAppId === echoAppId
    );
    if (spendPool) {
      result.set(echoAppId, {
        spendPoolBalance:
          Number(spendPool.totalPaid) - Number(spendPool.totalSpent),
        perUserSpendLimit: spendPool.perUserSpendLimit
          ? Number(spendPool.perUserSpendLimit)
          : null,
      });
    }
  }

  return result;
}

export const getCustomerSpendInfoForApp = async (
  userId: string,
  appId: string,
  tx?: Prisma.TransactionClient
): Promise<{
  spendPoolBalance: number;
  userSpendInfo: UserSpendInfo; // A user will only have one spend pool Info for an app
}> => {
  const client = tx ?? db;

  const spendPool = await client.spendPool.findFirst({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    include: {
      userUsage: {
        where: {
          userId,
          isArchived: false,
        },
      },
    },
  });

  if (!spendPool) {
    return {
      spendPoolBalance: 0,
      userSpendInfo: {
        userId,
        echoAppId: appId,
        spendPoolId: null,
        amountSpent: 0,
        spendLimit: null,
        amountLeft: 0,
      },
    };
  }

  const spendLimit = spendPool.perUserSpendLimit
    ? Number(spendPool.perUserSpendLimit)
    : null;

  const spendPoolBalance =
    Number(spendPool.totalPaid) - Number(spendPool.totalSpent);

  const userSpendInfoRow = spendPool.userUsage.find(
    userUsage => userUsage.userId === userId
  );

  // if there is a per user spend limit, and balance > limit, set balance to limit
  const userSpendPoolBalance =
    spendLimit && spendPoolBalance > spendLimit ? spendLimit : spendPoolBalance;

  if (!userSpendInfoRow) {
    return {
      spendPoolBalance: spendPoolBalance,
      userSpendInfo: {
        userId,
        echoAppId: appId,
        spendPoolId: spendPool.id,
        amountSpent: 0,
        spendLimit: spendLimit,
        amountLeft: userSpendPoolBalance,
      },
    };
  }

  const userSpendInfo = {
    userId,
    echoAppId: appId,
    spendPoolId: spendPool.id,
    amountSpent: Number(userSpendInfoRow.totalSpent) || 0,
    spendLimit,
    amountLeft: spendLimit
      ? spendLimit - Number(userSpendInfoRow.totalSpent)
      : spendPoolBalance,
  };

  return {
    spendPoolBalance,
    userSpendInfo,
  };
};

export const getCustomerSpendInfoForAppBatch = async (
  userId: string,
  appIds: string[],
  tx?: Prisma.TransactionClient
): Promise<
  Map<
    string,
    {
      spendPoolBalance: number;
      userSpendInfo: UserSpendInfo;
    }
  >
> => {
  const client = tx ?? db;

  // If no app IDs provided, return empty map
  if (appIds.length === 0) {
    return new Map();
  }

  // Find spend pools for all specified apps with user usage records for this specific user
  const spendPools = await client.spendPool.findMany({
    where: {
      echoAppId: {
        in: appIds,
      },
      isArchived: false,
    },
    include: {
      userUsage: {
        where: {
          userId,
          isArchived: false,
        },
      },
    },
  });

  // Create result map with key format: appId
  const result = new Map<
    string,
    {
      spendPoolBalance: number;
      userSpendInfo: UserSpendInfo;
    }
  >();

  // Initialize empty entries for all apps
  for (const appId of appIds) {
    result.set(appId, {
      spendPoolBalance: 0,
      userSpendInfo: {
        userId,
        echoAppId: appId,
        spendPoolId: null,
        amountSpent: 0,
        spendLimit: null,
        amountLeft: 0,
      },
    });
  }

  // Process each spend pool and update the corresponding entries
  for (const spendPool of spendPools) {
    const spendLimit = spendPool.perUserSpendLimit
      ? Number(spendPool.perUserSpendLimit)
      : null;

    const spendPoolBalance =
      Number(spendPool.totalPaid) - Number(spendPool.totalSpent);

    // Find the user's usage in this spend pool (should be at most one)
    const userUsage = spendPool.userUsage.find(
      usage => usage.userId === userId
    );

    if (userUsage) {
      const amountSpent = Number(userUsage.totalSpent) || 0;
      const amountLeft = spendLimit
        ? spendLimit - amountSpent
        : spendPoolBalance - amountSpent;

      const userSpendInfo: UserSpendInfo = {
        userId,
        echoAppId: spendPool.echoAppId,
        spendPoolId: spendPool.id,
        amountSpent,
        spendLimit,
        amountLeft,
      };

      result.set(spendPool.echoAppId, {
        spendPoolBalance,
        userSpendInfo,
      });
    } else {
      // User has no usage in this spend pool, but the pool exists
      result.set(spendPool.echoAppId, {
        spendPoolBalance,
        userSpendInfo: {
          userId,
          echoAppId: spendPool.echoAppId,
          spendPoolId: spendPool.id,
          amountSpent: 0,
          spendLimit,
          amountLeft: spendLimit ? spendLimit : spendPoolBalance,
        },
      });
    }
  }

  return result;
};

export async function getGlobalUserSpendInfoForApp(
  echoAppId: string,
  tx?: Prisma.TransactionClient
): Promise<{
  spendPoolBalance: number;
  userSpendInfo: UserSpendInfo[];
}> {
  const client = tx ?? db;

  // Find the single spend pool for the app with user usage records
  const spendPool = await client.spendPool.findFirst({
    where: {
      echoAppId,
      isArchived: false,
    },
    include: {
      userUsage: {
        where: {
          isArchived: false,
        },
      },
    },
  });

  // If no spend pool exists, return empty array
  if (!spendPool) {
    return {
      spendPoolBalance: 0,
      userSpendInfo: [],
    };
  }

  const spendLimit = spendPool.perUserSpendLimit
    ? Number(spendPool.perUserSpendLimit)
    : null;

  const spendPoolBalance =
    Number(spendPool.totalPaid) - Number(spendPool.totalSpent);

  // Convert user usage records to UserSpendInfo format
  const userSpendInfo = spendPool.userUsage.map(userUsage => {
    const amountSpent = Number(userUsage.totalSpent);
    const amountLeft = spendLimit
      ? spendLimit - amountSpent
      : spendPoolBalance - amountSpent;

    return {
      userId: userUsage.userId,
      echoAppId,
      spendPoolId: spendPool.id,
      amountSpent,
      spendLimit,
      amountLeft,
    };
  });

  return {
    spendPoolBalance: Number(spendPool.totalSpent),
    userSpendInfo,
  };
}

export async function getGlobalUserSpendInfoForAppBatch(
  echoAppIds: string[],
  tx?: Prisma.TransactionClient
): Promise<
  Map<
    string,
    {
      spendPoolBalance: number;
      userSpendInfo: UserSpendInfo[];
    }
  >
> {
  const client = tx ?? db;

  // If no app IDs provided, return empty map
  if (echoAppIds.length === 0) {
    return new Map();
  }

  // Find spend pools for all specified apps with their user usage records
  const spendPools = await client.spendPool.findMany({
    where: {
      echoAppId: {
        in: echoAppIds,
      },
      isArchived: false,
    },
    include: {
      userUsage: {
        where: {
          isArchived: false,
        },
      },
    },
  });

  // Create result map
  const result = new Map<
    string,
    {
      spendPoolBalance: number;
      userSpendInfo: UserSpendInfo[];
    }
  >();

  // Initialize empty arrays for all requested apps
  for (const echoAppId of echoAppIds) {
    result.set(echoAppId, {
      spendPoolBalance: 0,
      userSpendInfo: [],
    });
  }

  // Process each spend pool (one per app)
  for (const spendPool of spendPools) {
    const spendLimit = spendPool.perUserSpendLimit
      ? Number(spendPool.perUserSpendLimit)
      : null;
    const spendPoolBalance =
      Number(spendPool.totalPaid) - Number(spendPool.totalSpent);
    // Convert user usage records to UserSpendInfo format
    const userSpendInfos = spendPool.userUsage.map(userUsage => {
      const amountSpent = Number(userUsage.totalSpent);
      const amountLeft = spendLimit
        ? spendLimit - amountSpent
        : spendPoolBalance - amountSpent;

      return {
        userId: userUsage.userId,
        echoAppId: spendPool.echoAppId,
        spendPoolId: spendPool.id,
        amountSpent,
        spendLimit,
        amountLeft,
      };
    });

    // Add to result map
    result.set(spendPool.echoAppId, {
      spendPoolBalance,
      userSpendInfo: userSpendInfos,
    });
  }

  return result;
}
