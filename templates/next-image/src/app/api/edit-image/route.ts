/**
 * API Route: Edit Image
 *
 * This route demonstrates Echo SDK integration with AI image editing:
 * - Uses both Google Gemini and OpenAI for image editing
 * - Supports multipart image uploads and legacy data URL JSON requests
 * - Validates input images and prompts
 * - Returns edited images in appropriate format
 */

import type { EditImageRequest } from './validation';
import {
  MAX_EDIT_IMAGE_BYTES,
  validateEditImageFields,
  validateEditImageRequest,
} from './validation';
import { handleGoogleEdit } from './google';
import { handleOpenAIEdit } from './openai';
import type { ModelOption } from '@/lib/types';

const providers = {
  openai: handleOpenAIEdit,
  gemini: handleGoogleEdit,
};

export const maxDuration = 60;

type ParsedMultipartEditRequest =
  | {
      ok: true;
      prompt: string;
      provider: ModelOption;
      images: File[];
    }
  | {
      ok: false;
      error: { message: string; status: number };
    };

async function parseMultipartEditRequest(
  req: Request
): Promise<ParsedMultipartEditRequest> {
  const formData = await req.formData();
  const prompt = formData.get('prompt');
  const provider = formData.get('provider');
  const imageFiles = formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0);

  const validation = validateEditImageFields({
    prompt,
    provider,
    imageCount: imageFiles.length,
  });

  if (!validation.isValid) {
    return { ok: false, error: validation.error! };
  }

  const totalBytes = imageFiles.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_EDIT_IMAGE_BYTES) {
    return {
      ok: false,
      error: {
        message:
          'Uploaded images are too large. Please use smaller images or fewer attachments.',
        status: 413,
      },
    };
  }

  return {
    ok: true,
    prompt: prompt as string,
    provider: provider as ModelOption,
    images: imageFiles,
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseMultipartEditRequest(req);

      if (!parsed.ok) {
        return Response.json(
          { error: parsed.error.message },
          { status: parsed.error.status }
        );
      }

      const handler = providers[parsed.provider];
      return handler(parsed.prompt, parsed.images);
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
