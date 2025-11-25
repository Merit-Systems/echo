/**
 * Referral API Routes
 *
 * GET /api/v1/user/referral - Retrieves or creates a user's referral code
 * POST /api/v1/user/referral - Applies a referral code to establish referrer relationship
 *
 * See /docs/money/referrals.mdx for full documentation and implementation guide.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { appIdSchema } from '@/services/db/apps/lib/schemas';
import { authRoute } from '../../../../../lib/api/auth-route';
import { setAppMembershipReferrer } from '@/services/db/apps/membership';
import {
  getUserAppReferralCode,
  createAppReferralCode,
} from '@/services/db/apps/referral-code';

const getUserReferralCodeSchema = z.object({
  echoAppId: appIdSchema,
});

const setUserReferrerForAppSchema = z.object({
  echoAppId: appIdSchema,
  code: z.string(),
});

export const GET = authRoute
  .query(getUserReferralCodeSchema)
  .handler(async (_, context) => {
    const { echoAppId } = context.query;
    const userId = context.ctx.userId;

    let referralCode = await getUserAppReferralCode(userId, echoAppId);

    if (!referralCode) {
      referralCode = await createAppReferralCode(userId, {
        appId: echoAppId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      if (!referralCode) {
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to create referral code',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Referral code retrieved successfully',
      code: referralCode.code,
      referralLinkUrl: referralCode.referralLinkUrl,
      expiresAt: referralCode.expiresAt,
    });
  });

export const POST = authRoute
  .body(setUserReferrerForAppSchema)
  .handler(async (_, context) => {
    const { echoAppId, code } = context.body;

    const success = await setAppMembershipReferrer(
      context.ctx.userId,
      echoAppId,
      code
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Referral code applied successfully',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'Referral code could not be applied. It may be invalid, expired, or you may already have a referrer for this app.',
      },
      { status: 400 }
    );
  });
