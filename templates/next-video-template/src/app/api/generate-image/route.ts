/**
 * API Route: Generate Image
 *
 * This route demonstrates Echo SDK integration with AI image generation:
 * - Supports both OpenAI and Gemini models
 * - Handles text-to-image generation
 * - Returns base64 encoded images for consistent handling
 */

import {
  GenerateImageRequest,
  validateGenerateImageRequest,
} from './validation';
import { handleGoogleGenerate } from './google';
import { handleOpenAIGenerate } from './openai';

const providers = {
  openai: handleOpenAIGenerate,
  gemini: handleGoogleGenerate,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateGenerateImageRequest(body);
    if (!validation.isValid) {
      return Response.json(
        { error: validation.error!.message },
        { status: validation.error!.status }
      );
    }

    const { prompt, model } = body as GenerateImageRequest;
    const handler = providers[model];

    if (!handler) {
      return Response.json(
        { error: `Unsupported model: ${model}` },
        { status: 400 }
      );
    }

    return handler(prompt);
  } catch (error) {
    console.error('Image generation error:', error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image generation failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}
