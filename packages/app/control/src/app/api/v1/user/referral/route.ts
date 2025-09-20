import { NextResponse } from 'next/server';
import { setUserReferrerForAppIfExists } from '@/lib/referral-codes';
import { z } from 'zod';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { authRoute } from '../../../../../lib/api/auth-route';

const setUserReferrerForAppSchema = z.object({
  echoAppId: appIdSchema,
  code: z.string(),
});

export const POST = authRoute
  .body(setUserReferrerForAppSchema)
  .handler(async (_, context) => {
    const { echoAppId, code } = context.body;

    const success = await setUserReferrerForAppIfExists(
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
