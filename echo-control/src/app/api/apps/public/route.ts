import { NextResponse } from 'next/server';
import { bulkGetPublicAppInfo } from '@/lib/echo-apps';

// GET /api/apps/public - List all publicly available Echo apps
export async function GET() {
  try {
    const publicApps = await bulkGetPublicAppInfo();
    return NextResponse.json({ apps: publicApps });
  } catch (error) {
    console.error('Error fetching public Echo apps:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
