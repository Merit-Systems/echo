import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { setUserReferrerForAppIfExists } from '@/lib/referral-codes/user-referral';
import { z } from 'zod';

const setUserReferrerForAppSchema = z.object({
  echoAppId: z.string().uuid(),
  code: z.string(),
});

// POST /api/v1/user/referral - Register a referral code for the authenticated user
export async function POST(request: NextRequest) {
  // Authenticate the user
  const authResult = await getAuthenticatedUser(request).catch(error => {
    console.error('Error authenticating user:', error);
    return null;
  });

  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Validate request body
  const validationResult = setUserReferrerForAppSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        details: validationResult.error.issues,
      },
      { status: 400 }
    );
  }

  const { echoAppId, code } = validationResult.data;

  // Apply the referral code
  const success = await setUserReferrerForAppIfExists(
    authResult.user.id,
    echoAppId,
    code
  ).catch(error => {
    console.error('Error applying referral code:', error);
    return null;
  });

  if (success === null) {
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }

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
    { status: 200 }
  );
}
