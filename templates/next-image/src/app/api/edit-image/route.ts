/**
 * API Route: Edit Image
 *
 * This route handles AI image editing via Echo SDK:
 * - Supports multipart/form-data (File objects, preferred) and JSON (data URLs, fallback)
 * - Uses both Google Gemini and OpenAI for image editing
 * - Validates input images and prompts
 * - Returns edited images as base64 data URLs
 *
 * The multipart path avoids base64 encoding of images in the request body,
 * which prevents HTTP 413 (Entity Too Large) errors with large images.
 */

import {
  EditImageRequest,
  validateEditImageRequest,
  validateMultipartEditImageRequest,
} from './validation';
import { handleGoogleEdit, handleGoogleFileEdit } from './google';
import { handleOpenAIEdit, handleOpenAIFileEdit } from './openai';

export const maxDuration = 120;

const providers = {
  openai: handleOpenAIEdit,
  gemini: handleGoogleEdit,
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Multipart form data path: uses File objects directly (no base64 bloat)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const validation = validateMultipartEditImageRequest(formData);

      if (!validation.isValid) {
        return Response.json(
          { error: validation.error!.message },
          { status: validation.error!.status }
        );
      }

      const { prompt, provider, imageFiles } = (
        validation as { isValid: true; data: { prompt: string; provider: 'openai' | 'gemini'; imageFiles: File[] } }
      ).data;

      if (provider === 'openai') {
        return handleOpenAIFileEdit(prompt, imageFiles);
      }

      // Google/Gemini: convert File objects to bytes
      const files = await Promise.all(
        imageFiles.map(async (file, i) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            bytes: new Uint8Array(arrayBuffer),
            mediaType: file.type || 'image/png',
            filename: file.name || `image-${i}.png`,
          };
        })
      );
      return handleGoogleFileEdit(prompt, files);
    }

    // JSON path: legacy data URL approach (fallback)
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
