import { NextResponse, NextRequest } from 'next/server';
import {
  registerTemplateReferral,
  registerTemplateReferralSchema,
} from '@/services/db/apps/template-referral';
import { db } from '@/services/db/client';
import { AppRole } from '@/services/db/apps/permissions/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerTemplateReferralSchema.parse(body);
    const { appId, githubUsername, templateUrl } = validatedData;

    const app = await db.echoApp.findUnique({
      where: { id: appId },
      include: {
        appMemberships: {
          where: { role: AppRole.OWNER },
          take: 1,
        },
      },
    });

    if (!app || app.appMemberships.length === 0) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    const userId = app.appMemberships[0].userId;

    const result = await registerTemplateReferral(userId, {
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
        message: result.reason || 'Referral skipped',
        reason: result.reason,
      });
    }

    return NextResponse.json({
      success: true,
      status: 'not_found',
      message: result.reason || 'Template creator not found on Echo',
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
}