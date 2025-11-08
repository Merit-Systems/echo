import { z } from 'zod';
import { db } from '@/services/db/client';
import { appIdSchema } from './lib/schemas';
import { AppRole } from './permissions/types';

export const registerTemplateReferralSchema = z.object({
  appId: appIdSchema,
  githubUsername: z.string().min(1),
  templateUrl: z.string().url(),
});

export type RegisterTemplateReferralInput = z.infer<
  typeof registerTemplateReferralSchema
>;

export interface RegisterTemplateReferralResult {
  status: 'registered' | 'skipped' | 'not_found';
  reason?: string;
  referrerUsername?: string;
  referralCodeId?: string;
}

export async function registerTemplateReferral(
  userId: string,
  input: RegisterTemplateReferralInput
): Promise<RegisterTemplateReferralResult> {
  const { appId, githubUsername, templateUrl } = input;

  const app = await db.echoApp.findUnique({
    where: { id: appId },
    include: {
      appMemberships: {
        where: {
          userId,
          role: AppRole.OWNER,
        },
      },
    },
  });

  if (!app || app.appMemberships.length === 0) {
    throw new Error('App not found or user is not the owner');
  }

  const membership = await db.appMembership.findUnique({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId: appId,
      },
    },
    select: {
      referrerId: true,
    },
  });

  if (!membership) {
    throw new Error('App membership not found');
  }

  if (membership.referrerId) {
    return {
      status: 'skipped',
      reason: 'existing_referrer',
    };
  }

  const githubLink = await db.githubLink.findFirst({
    where: {
      githubUrl: {
        contains: githubUsername,
      },
      githubType: 'user',
      isArchived: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!githubLink || !githubLink.user) {
    return {
      status: 'not_found',
      reason: 'template_creator_not_on_echo',
    };
  }

  let referralCode = await db.referralCode.findFirst({
    where: {
      userId: githubLink.user.id,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!referralCode) {
    const code = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    referralCode = await db.referralCode.create({
      data: {
        code,
        userId: githubLink.user.id,
        expiresAt,
      },
      select: {
        id: true,
      },
    });
  }

  await db.appMembership.update({
    where: {
      userId_echoAppId: {
        userId,
        echoAppId: appId,
      },
    },
    data: {
      referrerId: referralCode.id,
    },
  });

  return {
    status: 'registered',
    referrerUsername: githubUsername,
    referralCodeId: referralCode.id,
  };
}
