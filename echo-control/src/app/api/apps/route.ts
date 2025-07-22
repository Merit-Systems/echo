import { NextRequest } from 'next/server';
import { getApps, createApp } from '@/lib/echo-apps/apps';

// GET /api/apps - List all Echo apps for the authenticated user
export async function GET() {
  return getApps();
}

// POST /api/apps - Create a new Echo app
export async function POST(req: NextRequest) {
  return createApp(req);
}
