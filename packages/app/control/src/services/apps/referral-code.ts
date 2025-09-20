import z from 'zod';

import { db } from '@/lib/db';

import { appIdSchema } from './lib/schemas';
import { UserId } from '@/services/lib/schemas';

import { env } from '@/env';

export const getAppReferralCodeSchema = appIdSchema;

export const getUserAppReferralCode = async (
  userId: UserId,
  appId: z.infer<typeof appIdSchema>
) => {
  const referralCode = await db.referralCode.findFirst({
    where: { userId },
  });

  if (!referralCode) {
    return null;
  }

  const echoApp = await db.echoApp.findUnique({
    where: { id: appId },
  });

  if (!echoApp) {
    throw new Error('Echo app not found');
  }

  const referralLinkUrl = getReferralLinkUrl({
    homePage: echoApp.homepageUrl,
    echoAppId: appId,
    code: referralCode.code,
  });

  return {
    referralLinkUrl,
    code: referralCode.code,
    expiresAt: referralCode.expiresAt,
    userId: referralCode.userId,
    echoAppId: appId,
  };
};

export const getReferralCodeByCodeSchema = z.string();

export const getReferralCodeByCode = async (
  code: z.infer<typeof getReferralCodeByCodeSchema>
) => {
  const referralCode = await db.referralCode.findFirst({
    where: { code },
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
      userId,
      expiresAt: input.expiresAt,
    },
  });

  const echoApp = await db.echoApp.findUnique({
    where: { id: input.appId },
  });

  if (!echoApp) {
    throw new Error('Echo app not found');
  }

  const referralLinkUrl = getReferralLinkUrl({
    homePage: echoApp.homepageUrl,
    echoAppId: input.appId,
    code: referralCode.code,
  });

  return {
    referralLinkUrl,
    code: referralCode.code,
    expiresAt: referralCode.expiresAt,
    userId: referralCode.userId,
    echoAppId: input.appId,
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
  return `${homePage || `${env.NEXT_PUBLIC_APP_URL}/app/${echoAppId}`}?referral_code=${code}`;
};
