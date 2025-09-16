/**
 * Google Gemini image generation handler
 */

import { google } from '@/echo';
import { generateText } from 'ai';
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

    return Response.json({
      imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
    });
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
