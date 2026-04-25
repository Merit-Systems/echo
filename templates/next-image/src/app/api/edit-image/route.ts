/**
 * API Route: Edit Image
 *
 * This route demonstrates Echo SDK integration with AI image editing:
 * - Uses both Google Gemini and OpenAI for image editing
 * - Accepts hosted image URLs (stored via /api/upload-image) instead of base64
 * - Returns hosted image URLs instead of base64 to avoid HTTP 413 errors
 * - Validates input images and prompts
 */

import { EditImageRequest, validateEditImageRequest } from './validation';
import { handleGoogleEdit } from './google';
import { handleOpenAIEdit } from './openai';

const providers = {
  openai: handleOpenAIEdit,
  gemini: handleGoogleEdit,
};

// Allow up to 60 seconds for image editing on Vercel
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateEditImageRequest(body);
    if (!validation.isValid) {
      return Response.json(
        { error: validation.error!.message },
        { status: validation.error!.status }
      );
    }

    const { prompt, imageUrls, provider } = body as EditImageRequest;
    const handler = providers[provider];

    if (!handler) {
      return Response.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    return handler(prompt, imageUrls);
  } catch (error) {
    console.error('Image editing error:', error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image editing failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}
