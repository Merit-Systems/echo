import { NextResponse } from 'next/server';
import { authRoute } from '../../../../../lib/api/auth-route';
import {
  registerTemplateReferral,
  registerTemplateReferralSchema,
} from '@/services/db/apps/template-referral';

export const POST = authRoute
  .body(registerTemplateReferralSchema)
  .handler(async (_, context) => {
    const { appId, githubUsername, templateUrl } = context.body;

    try {
      const result = await registerTemplateReferral(context.ctx.userId, {
        appId,
        githubUsername,
        templateUrl,
      });

      if (result.status === 'registered') {
        return NextResponse.json({
          success: true,
          status: 'registered',
          message: `Template creator ${result.referrerUsername} registered as referrer`,
          referrerUsername: result.referrerUsername,
        });
      }

      if (result.status === 'skipped') {
        return NextResponse.json({
          success: true,
          status: 'skipped',
          message: 'App already has a referrer',
          reason: result.reason,
        });
      }
      
      return NextResponse.json({
        success: true,
        status: 'not_found',
        message: 'Template creator not found on Echo',
        reason: result.reason,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }
  });
