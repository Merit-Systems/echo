/**
 * Google Gemini image editing handler
 *
 * Accepts hosted image URLs (stored in Vercel Blob via /api/upload-image),
 * edits them, and stores results back in Vercel Blob to avoid HTTP 413 errors.
 */

import { google } from '@/echo';
import { generateText } from 'ai';
import { put } from '@vercel/blob';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles Google Gemini image editing
 * Gemini accepts regular URLs directly, so no conversion needed for input.
 */
export async function handleGoogleEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  try {
    const content = [
      {
        type: 'text' as const,
        text: prompt,
      },
      ...imageUrls.map(imageUrl => ({
        type: 'image' as const,
        image: imageUrl, // Hosted URL - Gemini handles it directly
      })),
    ];

    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: [
        {
          role: 'user',
          content,
        },
      ],
    });

    const imageFile = result.files?.find(file =>
      file.mediaType?.startsWith('image/')
    );

    if (!imageFile) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_EDITED_IMAGE },
        { status: 500 }
      );
    }

    // Store result in Vercel Blob and return hosted URL
    const buffer = Buffer.from(imageFile.base64, 'base64');
    const blob = await put(`edited-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: imageFile.mediaType || 'image/png',
    });

    return Response.json({ imageUrl: blob.url });
  } catch (error) {
    console.error('Google image editing error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.NO_EDITED_IMAGE,
      },
      { status: 500 }
    );
  }
}
