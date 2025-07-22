import { NextRequest } from 'next/server';
import { patchApiKey, deleteApiKey } from '@/lib/api-keys/api-keys';

// PATCH /api/api-keys/[id] - Update an API key (rename)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return patchApiKey(request, { params });
}

// DELETE /api/api-keys/[id] - Archive an API key (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return deleteApiKey(request, { params });
}
