/**
 * API Route: Edit Image
 *
 * This route demonstrates Echo SDK integration with AI image editing:
 * - Uses both Google Gemini and OpenAI for image editing
 * - Supports both data URLs (base64) and regular URLs
 * - Validates input images and prompts
 * - Returns edited images in appropriate format
 */

import {
  EditImageRequest,
  validateEditImageRequest,
  validateMultipartEditImageRequest,
} from './validation';
import { handleGoogleEdit, handleGoogleFileEdit } from './google';
import { handleOpenAIEdit, handleOpenAIFileEdit } from './openai';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const validation = validateMultipartEditImageRequest(formData);
      if (!validation.isValid) {
        return Response.json(
          { error: validation.error!.message },
          { status: validation.error!.status }
        );
      }

      const { prompt, imageFiles, provider } = validation.data;

      if (provider === 'openai') {
        return handleOpenAIFileEdit(prompt, imageFiles);
      }

      const googleFiles = await Promise.all(
        imageFiles.map(async (file: File, index: number) => ({
          bytes: new Uint8Array(await file.arrayBuffer()),
          mediaType: file.type || 'image/png',
          filename: file.name || `image-${index}.png`,
        }))
      );

      return handleGoogleFileEdit(prompt, googleFiles);
    }

    const body = await req.json();

    const validation = validateEditImageRequest(body);
    if (!validation.isValid) {
      return Response.json(
        { error: validation.error!.message },
        { status: validation.error!.status }
      );
    }

    const { prompt, imageUrls, provider } = body as EditImageRequest;
    return provider === 'openai'
      ? handleOpenAIEdit(prompt, imageUrls)
      : handleGoogleEdit(prompt, imageUrls);
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
