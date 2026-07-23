/**
 * Template Referral API
 *
 * POST /api/v1/apps/template-referral - Register a template creator as the referrer for an app.
 * Called by echo-start when scaffolding from an external template that includes a referral code.
 * No auth required — the referral code itself authenticates the template creator.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createZodRoute } from '@/lib/api/create-route';
import { appIdSchema } from '@/services/db/apps/lib/schemas';
import { db } from '@/services/db/client';

const publicRoute = createZodRoute();

const templateReferralSchema = z.object({
  echoAppId: appIdSchema,
  referralCode: z.string().min(1),
});

export const POST = publicRoute
  .body(templateReferralSchema)
  .handler(async (_, context) => {
    const { echoAppId, referralCode } = context.body;

    const code = await db.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!code || code.isArchived) {
      return NextResponse.json(
        { success: false, message: 'Invalid referral code' },
        { status: 400 }
      );
    }

    if (code.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Referral code has expired' },
        { status: 400 }
      );
    }

    const app = await db.echoApp.findUnique({
      where: { id: echoAppId },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    // Only set template referrer if not already set (first-come-first-served)
    if (app.templateReferrerCodeId) {
      return NextResponse.json({
        success: true,
        message: 'Template referrer already registered',
      });
    }

    await db.echoApp.update({
      where: { id: echoAppId },
      data: { templateReferrerCodeId: code.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template referrer registered successfully',
    });
  });
