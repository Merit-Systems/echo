/**
 * OpenAI image editing handler
 */

import { getEchoToken } from '@/echo';
import OpenAI from 'openai';
import { dataUrlToFile } from '@/lib/image-utils';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles OpenAI image editing using File objects directly.
 * This avoids base64 data URL bloat in the request body.
 */
export async function handleOpenAIFileEdit(
  prompt: string,
  imageFiles: File[]
): Promise<Response> {
  const token = await getEchoToken();

  if (!token) {
    return Response.json(
      { error: ERROR_MESSAGES.AUTH_FAILED },
      { status: 401 }
    );
  }

  const openaiClient = new OpenAI({
    apiKey: token,
    baseURL: 'https://echo.router.merit.systems',
  });

  try {
    const result = await openaiClient.images.edit({
      image: imageFiles,
      prompt,
      n: 1,
      size: '1024x1024',
      model: 'gpt-image-1',
    });

    if (!result.data || result.data.length === 0) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_EDITED_IMAGE },
        { status: 500 }
      );
    }

    return Response.json({
      imageUrl: `data:image/png;base64,${result.data[0]?.b64_json}`,
    });
  } catch (error) {
    console.error('OpenAI image editing error:', error);
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
 * Handles OpenAI image editing from data URLs (legacy/fallback).
 * Converts data URLs to File objects and delegates to handleOpenAIFileEdit.
 */
export async function handleOpenAIEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  const imageFiles = imageUrls.map(url => dataUrlToFile(url, 'image.png'));
  return handleOpenAIFileEdit(prompt, imageFiles);
}
