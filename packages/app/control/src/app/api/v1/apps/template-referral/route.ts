/**
 * Template Referral API
 *
 * POST /api/v1/apps/template-referral
 *
 * Registers a template creator as the referrer for a newly scaffolded app.
 * Called by `echo-start` when a user creates an app from an external GitHub
 * template that includes an `echo.config.json` with a `referralCode` field.
 *
 * No authentication required — the referral code itself identifies the
 * template creator. Only one template referrer can be registered per app
 * (first-come-first-served). Subsequent calls for the same app are idempotent.
 *
 * See /docs/money/referrals.mdx for documentation.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createZodRoute } from '@/lib/api/create-route';
import { appIdSchema } from '@/services/db/apps/lib/schemas';
import { db } from '@/services/db/client';

const publicRoute = createZodRoute();

const templateReferralSchema = z.object({
  echoAppId: appIdSchema,
  referralCode: z.string().min(1).max(128),
});

export const POST = publicRoute
  .body(templateReferralSchema)
  .handler(async (_, context) => {
    const { echoAppId, referralCode } = context.body;

    // Look up the referral code
    const code = await db.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!code || code.isArchived) {
      return NextResponse.json(
        { success: false, message: 'Invalid or unknown referral code' },
        { status: 400 }
      );
    }

    if (code.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Referral code has expired' },
        { status: 400 }
      );
    }

    // Look up the app
    const app = await db.echoApp.findUnique({
      where: { id: echoAppId },
      select: { id: true, templateReferrerCodeId: true },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, message: 'App not found' },
        { status: 404 }
      );
    }

    // Idempotent: if a template referrer is already registered, return success
    if (app.templateReferrerCodeId) {
      return NextResponse.json({
        success: true,
        message: 'Template referrer already registered',
      });
    }

    // Register the template creator as referrer (first-come-first-served)
    await db.echoApp.update({
      where: { id: echoAppId },
      data: { templateReferrerCodeId: code.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template referrer registered successfully',
    });
  });
