/**
 * API Route: Blob Upload Handler
 * 
 * This route handles client-side blob upload token generation.
 * It's called by @vercel/blob/client's upload() function to generate
 * secure tokens that allow direct client-to-blob uploads.
 * 
 * SECURITY:
 * - Validates file types (images only)
 * - Sets maximum file size (50MB)
 * - Generates temporary tokens
 */

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        // Here you can add authentication/authorization logic
        // For example: verify user session, check quotas, etc.
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
          addRandomSuffix: true, // Prevent filename collisions and add obscurity
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called after successful upload
        // You can add logging, analytics, etc. here
        console.log('Blob upload completed:', blob.pathname);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}

