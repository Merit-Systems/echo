import { ModelOption } from '@/lib/types';

export type { EditImageRequest } from '@/lib/types';

export interface ValidationResult {
  isValid: boolean;
  error?: { message: string; status: number };
}

export interface ParsedMultipartEditImageRequest {
  prompt: string;
  provider: ModelOption;
  imageFiles: File[];
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

export function validateMultipartEditImageRequest(
  formData: FormData
):
  | (ValidationResult & { data: ParsedMultipartEditImageRequest })
  | ValidationResult {
  const prompt = formData.get('prompt');
  const provider = formData.get('provider');
  const imageFiles = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File);

  const validProviders: ModelOption[] = ['openai', 'gemini'];
  if (!provider || typeof provider !== 'string' || !validProviders.includes(provider as ModelOption)) {
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

  if (imageFiles.length === 0) {
    return {
      isValid: false,
      error: { message: 'At least one image is required', status: 400 },
    };
  }

  if (imageFiles.some(file => !file.type.startsWith('image/'))) {
    return {
      isValid: false,
      error: { message: 'All uploaded files must be images', status: 400 },
    };
  }

  return {
    isValid: true,
    data: {
      prompt,
      provider: provider as ModelOption,
      imageFiles,
    },
  };
}
