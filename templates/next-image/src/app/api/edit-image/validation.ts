import { ModelOption } from '@/lib/types';

export type { EditImageRequest } from '@/lib/types';

export interface ValidationError {
  message: string;
  status: number;
}

export type ValidationFailure = {
  isValid: false;
  error: ValidationError;
};

export type ValidationSuccess<TData = undefined> = TData extends undefined
  ? { isValid: true }
  : { isValid: true; data: TData };

export type ValidationResult<TData = undefined> =
  | ValidationFailure
  | ValidationSuccess<TData>;

export interface ParsedMultipartEditImageRequest {
  prompt: string;
  provider: ModelOption;
  imageFiles: File[];
}

const VALID_PROVIDERS: ModelOption[] = ['openai', 'gemini'];

export function validateEditImageRequest(
  body: unknown
): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: { message: 'Invalid request body', status: 400 },
    };
  }

  const { prompt, imageUrls, provider } = body as Record<string, unknown>;

  if (!provider || !VALID_PROVIDERS.includes(provider as ModelOption)) {
    return {
      isValid: false,
      error: {
        message: `Provider must be: ${VALID_PROVIDERS.join(', ')}`,
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
): ValidationResult<ParsedMultipartEditImageRequest> {
  const prompt = formData.get('prompt');
  const provider = formData.get('provider');
  const imageFiles = formData.getAll('imageFiles').filter(
    (entry): entry is File => entry instanceof File
  );

  if (!provider || !VALID_PROVIDERS.includes(provider as ModelOption)) {
    return {
      isValid: false,
      error: {
        message: `Provider must be: ${VALID_PROVIDERS.join(', ')}`,
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
      error: { message: 'At least one image file is required', status: 400 },
    };
  }

  return {
    isValid: true,
    data: {
      prompt: prompt as string,
      provider: provider as ModelOption,
      imageFiles,
    },
  } as ValidationSuccess<ParsedMultipartEditImageRequest>;
}
