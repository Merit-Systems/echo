/**
 * Google Gemini image generation handler
 *
 * Generates images and stores them in Vercel Blob to avoid
 * large base64 payloads in API responses (fixes HTTP 413).
 */

import { google } from '@/echo';
import { generateText } from 'ai';
import { put } from '@vercel/blob';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles Google Gemini image generation
 */
export async function handleGoogleGenerate(prompt: string): Promise<Response> {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt,
    });

    const imageFile = result.files?.find(file =>
      file.mediaType?.startsWith('image/')
    );

    if (!imageFile) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_IMAGE_GENERATED },
        { status: 500 }
      );
    }

    // Convert base64 to buffer and store in Vercel Blob
    const buffer = Buffer.from(imageFile.base64, 'base64');
    const blob = await put(`generated-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: imageFile.mediaType || 'image/png',
    });

    return Response.json({ imageUrl: blob.url });
  } catch (error) {
    console.error('Google image generation error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.NO_IMAGE_GENERATED,
      },
      { status: 500 }
    );
  }
}
