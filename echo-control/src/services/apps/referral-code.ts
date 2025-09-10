import z from 'zod';

import { db } from '@/lib/db';

import { appIdSchema } from './lib/schemas';
import type { UserId } from '@/services/lib/schemas';

import { ReferralCodeType } from '@/lib/referral-codes/types';

export const getAppReferralCodeSchema = appIdSchema;

export const getUserAppReferralCode = async (
  userId: UserId,
  appId: z.infer<typeof appIdSchema>
) => {
  const referralCode = await db.referralCode.findFirst({
    where: { userId, echoAppId: appId, grantType: ReferralCodeType.REFERRAL },
    include: {
      echoApp: {
        select: {
          homepageUrl: true,
        },
      },
    },
  });

  if (!referralCode) {
    return null;
  }

  const referralLinkUrl = getReferralLinkUrl({
    homePage: referralCode.echoApp?.homepageUrl,
    echoAppId: appId,
    code: referralCode.code,
  });

  return {
    referralLinkUrl,
    code: referralCode.code,
    expiresAt: referralCode.expiresAt,
    userId: referralCode.userId,
    echoAppId: referralCode.echoAppId,
  };
};

export const getReferralCodeByCodeSchema = z.uuid();

export const getReferralCodeByCode = async (
  code: z.infer<typeof getReferralCodeByCodeSchema>
) => {
  const referralCode = await db.referralCode.findFirst({
    where: { code, grantType: ReferralCodeType.REFERRAL },
  });

  return referralCode;
};

export const createAppReferralCodeSchema = z.object({
  appId: appIdSchema,
  expiresAt: z
    .date()
    .optional()
    .default(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
});

export const createAppReferralCode = async (
  userId: string,
  input: z.infer<typeof createAppReferralCodeSchema>
) => {
  const code = crypto.randomUUID();

  const referralCode = await db.referralCode.create({
    data: {
      code,
      echoAppId: input.appId,
      userId,
      grantType: ReferralCodeType.REFERRAL,
      reusable: true,
      expiresAt: input.expiresAt,
    },
    include: {
      echoApp: {
        select: {
          homepageUrl: true,
        },
      },
    },
  });

  const referralLinkUrl = getReferralLinkUrl({
    homePage: referralCode.echoApp?.homepageUrl,
    echoAppId: input.appId,
    code: referralCode.code,
  });

  return {
    referralLinkUrl,
    code: referralCode.code,
    expiresAt: referralCode.expiresAt,
    userId: referralCode.userId,
    echoAppId: referralCode.echoAppId,
  };
};

const getReferralLinkUrl = ({
  homePage,
  echoAppId,
  code,
}: {
  homePage: string | null | undefined;
  echoAppId: string;
  code: string;
}) => {
  return `${homePage || `${process.env.ECHO_CONTROL_APP_BASE_URL}/app/${echoAppId}`}?referral_code=${code}`;
};
