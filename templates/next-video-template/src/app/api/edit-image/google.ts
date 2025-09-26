/**
 * Google Gemini image editing handler
 */

import { google } from '@/echo';
import { generateText } from 'ai';
import { getMediaTypeFromDataUrl } from '@/lib/image-utils';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles Google Gemini image editing
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
        image: imageUrl, // Direct data URL - Gemini handles it
        mediaType: getMediaTypeFromDataUrl(imageUrl),
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
