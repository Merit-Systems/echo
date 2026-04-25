/**
 * OpenAI image editing handler
 */

import { getEchoToken } from '@/echo';
import OpenAI from 'openai';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Fetches a hosted URL and returns a File object.
 * Falls back to treating url as a data URL if it starts with "data:".
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  if (url.startsWith('data:')) {
    // Data URL path
    const [header, base64] = url.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const bytes = atob(base64);
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      array[i] = bytes.charCodeAt(i);
    }
    return new File([array], filename, { type: mime });
  } else {
    // Hosted URL path – fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${url}: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  }
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
    const imageFiles = await Promise.all(
      imageUrls.map((url, i) => urlToFile(url, `image_${i}.png`))
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
