/**
 * OpenAI image editing handler
 *
 * Accepts hosted image URLs (stored in Vercel Blob via /api/upload-image),
 * edits them, and stores results back in Vercel Blob to avoid HTTP 413 errors.
 */

import { getEchoToken } from '@/echo';
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Converts a hosted URL to a File object for the OpenAI API
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = await response.arrayBuffer();
  return new File([buffer], filename, { type: contentType });
}

/**
 * Handles OpenAI image editing
 */
export async function handleOpenAIEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  const token = await getEchoToken();

  if (!token) {
    return Response.json(
      { error: ERROR_MESSAGES.AUTH_FAILED },
      { status: 401 }
    );
  }

  // OpenAI editImage API is not supported through Vercel AI SDK, so we must construct
  // a raw TS OpenAI client.
  // https://platform.openai.com/docs/api-reference/images/createEdit
  const openaiClient = new OpenAI({
    apiKey: token,
    baseURL: 'https://echo.router.merit.systems',
  });

  try {
    // Fetch images from hosted URLs (avoids sending base64 through the client→server boundary)
    const imageFiles = await Promise.all(
      imageUrls.map((url, i) => urlToFile(url, `image-${i}.png`))
    );

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

    // Store result in Vercel Blob and return hosted URL
    const b64 = result.data[0]?.b64_json;
    if (!b64) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_EDITED_IMAGE },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(b64, 'base64');
    const blob = await put(`edited-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return Response.json({ imageUrl: blob.url });
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
