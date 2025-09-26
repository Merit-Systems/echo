import { ModelOption } from '@/lib/types';

export type { EditImageRequest } from '@/lib/types';

export interface ValidationResult {
  isValid: boolean;
  error?: { message: string; status: number };
}

export function validateEditImageRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: { message: 'Invalid request body', status: 400 },
    };
  }

  const { prompt, imageUrls, provider } = body as Record<string, unknown>;

  const validProviders: ModelOption[] = ['openai', 'gemini'];
  if (!provider || !validProviders.includes(provider as ModelOption)) {
    return {
      isValid: false,
      error: {
        message: `Provider must be: ${validProviders.join(', ')}`,
        status: 400,
      },
    };
  }

  if (!prompt || typeof prompt !== 'string') {
    return {
      isValid: false,
      error: { message: 'Prompt is required', status: 400 },
    };
  }

  if (prompt.length < 3 || prompt.length > 1000) {
    return {
      isValid: false,
      error: { message: 'Prompt must be 3-1000 characters', status: 400 },
    };
  }

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return {
      isValid: false,
      error: { message: 'At least one image is required', status: 400 },
    };
  }

  if (!imageUrls.every(url => typeof url === 'string')) {
    return {
      isValid: false,
      error: { message: 'All image URLs must be strings', status: 400 },
    };
  }

  return { isValid: true };
}
