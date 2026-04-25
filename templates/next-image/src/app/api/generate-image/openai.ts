/**
 * OpenAI image generation handler
 *
 * Generates images and stores them in Vercel Blob to avoid
 * large base64 payloads in API responses (fixes HTTP 413).
 */

import { openai } from '@/echo';
import { experimental_generateImage as generateImage } from 'ai';
import { put } from '@vercel/blob';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles OpenAI image generation
 */
export async function handleOpenAIGenerate(prompt: string): Promise<Response> {
  try {
    const result = await generateImage({
      model: openai.image('gpt-image-1'),
      prompt,
    });

    const imageData = result.image;

    // Convert base64 to buffer and store in Vercel Blob
    const buffer = Buffer.from(imageData.base64, 'base64');
    const blob = await put(`generated-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: imageData.mediaType || 'image/png',
    });

    return Response.json({ imageUrl: blob.url });
  } catch (error) {
    console.error('OpenAI image generation error:', error);
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
