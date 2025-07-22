import { NextRequest } from 'next/server';
import { getApp, updateApp, deleteApp } from '@/lib/echo-apps/apps';

// GET /api/apps/[id] - Get detailed app information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return getApp(request, { params });
}

// PUT /api/apps/[id] - Update an existing Echo app
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateApp(req, { params });
}

// DELETE /api/apps/[id] - Archive an echo app (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return deleteApp(request, { params });
}
