import { ModelOption } from '@/lib/types';

export type { GenerateImageRequest } from '@/lib/types';

export interface ValidationResult {
  isValid: boolean;
  error?: { message: string; status: number };
}

export function validateGenerateImageRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: { message: 'Invalid request body', status: 400 },
    };
  }

  const { prompt, model } = body as Record<string, unknown>;

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

  const validModels: ModelOption[] = ['openai', 'gemini'];
  if (!model || !validModels.includes(model as ModelOption)) {
    return {
      isValid: false,
      error: {
        message: `Model must be: ${validModels.join(', ')}`,
        status: 400,
      },
    };
  }

  return { isValid: true };
}
