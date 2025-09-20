import z from 'zod';

import { mintCreditsToUser } from './mint';

import { db } from '@/lib/db';

import { EnumPaymentSource, Prisma } from '@/generated/prisma';
import { getPublicUser } from '../user/get';

export const creditGrantCodeSchema = z.object({
  code: z.string(),
});

const getCreditGrantCodeWhere = (
  code: string
): Prisma.CreditGrantCodeWhereUniqueInput => ({
  code,
  expiresAt: { gt: new Date() },
  isArchived: false,
  grantAmount: { gt: 0 },
});

export const getCreditGrantCode = async ({
  code,
}: z.infer<typeof creditGrantCodeSchema>) => {
  const creditGrantCode = await db.creditGrantCode.findUnique({
    where: getCreditGrantCodeWhere(code),
  });

  if (!creditGrantCode) {
    return null;
  }

  return {
    ...creditGrantCode,
    grantAmount: Number(creditGrantCode.grantAmount),
  };
};

export const getCreditGrantCodeWithUsages = async (
  userId: string,
  { code }: z.infer<typeof creditGrantCodeSchema>
) => {
  const creditGrantCode = await db.creditGrantCode.findUnique({
    where: getCreditGrantCodeWhere(code),
    include: {
      usages: {
        where: {
          userId,
        },
      },
    },
  });

  if (!creditGrantCode) {
    return null;
  }

  return {
    ...creditGrantCode,
    grantAmount: Number(creditGrantCode.grantAmount),
  };
};

export const redeemCreditGrantCodeSchema = creditGrantCodeSchema.extend({
  freeTier: z.boolean().optional(),
  echoAppId: z.string().optional(),
});

export const redeemCreditGrantCode = async (
  userId: string,
  { code, freeTier, echoAppId }: z.infer<typeof redeemCreditGrantCodeSchema>
) => {
  const user = await getPublicUser(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const creditGrantCode = await getCreditGrantCodeWithUsages(userId, { code });

  if (!creditGrantCode) {
    throw new Error('Credit grant code not found');
  }

  if (
    creditGrantCode.maxUses &&
    creditGrantCode.maxUses <= creditGrantCode.uses
  ) {
    throw new Error('Credit grant code has reached the maximum number of uses');
  }

  if (
    creditGrantCode.maxUsesPerUser &&
    creditGrantCode.maxUsesPerUser <= creditGrantCode.usages.length
  ) {
    throw new Error(
      'The user has reached the maximum number of uses for this credit grant code'
    );
  }

  return await db.$transaction(async tx => {
    await tx.creditGrantCode.update({
      where: { id: creditGrantCode.id },
      data: { uses: creditGrantCode.uses + 1 },
    });

    await tx.creditGrantCodeUsage.create({
      data: {
        userId,
        creditGrantCodeId: creditGrantCode.id,
        grantedAmount: Number(creditGrantCode.grantAmount),
      },
    });

    const {
      userId: userIdFromMintCredits,
      amountInDollars,
      echoAppId: echoAppIdFromReferralCode,
      isFreeTier,
    } = await mintCreditsToUser(
      {
        userId,
        amountInDollars: Number(creditGrantCode.grantAmount),
        options: {
          isFreeTier: freeTier,
          echoAppId,
          source: EnumPaymentSource.admin,
        },
      },
      tx
    );

    return {
      userId: userIdFromMintCredits,
      amountInDollars,
      echoAppId: echoAppIdFromReferralCode,
      isFreeTier,
    };
  });
};
