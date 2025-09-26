/**
 * OpenAI image generation handler
 */

import { openai } from '@/echo';
import { experimental_generateImage as generateImage } from 'ai';
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
    return Response.json({
      imageUrl: `data:${imageData.mediaType};base64,${imageData.base64}`,
    });
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
