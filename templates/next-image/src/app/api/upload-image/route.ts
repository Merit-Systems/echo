/**
 * API Route: Upload Image
 *
 * Accepts multipart form data with image files and stores them in Vercel Blob.
 * Returns hosted URLs that can be passed to edit-image without triggering 413 errors.
 *
 * Usage:
 *   const form = new FormData();
 *   form.append('file', imageFile);
 *   const { url } = await fetch('/api/upload-image', { method: 'POST', body: form }).then(r => r.json());
 */

import { put } from '@vercel/blob';

// Allow up to 30 seconds for uploads
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'Only image files are supported' },
        { status: 400 }
      );
    }

    // 10MB size limit for uploads
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: 'Image must be smaller than 10MB' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const ext = file.type.split('/')[1] || 'png';
    const blob = await put(`upload-${Date.now()}.${ext}`, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error('Image upload error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image upload failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
