/**
 * Google Gemini image editing handler
 */

import { google } from '@/echo';
import { generateText } from 'ai';
import { getMediaTypeFromDataUrl } from '@/lib/image-utils';
import { ERROR_MESSAGES } from '@/lib/constants';

interface FileInput {
  bytes: Uint8Array;
  mediaType: string;
  filename: string;
}

/**
 * Handles Google Gemini image editing using raw file bytes.
 * This avoids base64 data URL bloat in the request body.
 */
export async function handleGoogleFileEdit(
  prompt: string,
  files: FileInput[]
): Promise<Response> {
  try {
    const content = [
      {
        type: 'text' as const,
        text: prompt,
      },
      ...files.map(file => ({
        type: 'image' as const,
        image: file.bytes,
        mediaType: file.mediaType,
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

    return Response.json({
      imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
    });
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

/**
 * Handles Google Gemini image editing from data URLs (legacy/fallback).
 * Converts data URLs to bytes and delegates to handleGoogleFileEdit.
 */
export async function handleGoogleEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  const files: FileInput[] = imageUrls.map((url, i) => {
    const mediaType = getMediaTypeFromDataUrl(url);
    const base64 = url.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return { bytes, mediaType, filename: `image-${i}.png` };
  });

  return handleGoogleFileEdit(prompt, files);
}
