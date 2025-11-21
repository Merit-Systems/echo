import { VideoModelOption } from '@/lib/types';

export type { GenerateVideoRequest } from '@/lib/types';

export interface ValidationResult {
  isValid: boolean;
  error?: { message: string; status: number };
}

export function validateGenerateVideoRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: { message: 'Invalid request body', status: 400 },
    };
  }

  const { prompt, model, durationSeconds, generateAudio } = body as Record<
    string,
    unknown
  >;

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

  const validModels: VideoModelOption[] = [
    'veo-3.0-fast-generate-preview',
    'veo-3.0-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.1-generate-preview',
  ];
  if (!model || !validModels.includes(model as VideoModelOption)) {
    return {
      isValid: false,
      error: {
        message: `Model must be: ${validModels.join(', ')}`,
        status: 400,
      },
    };
  }

  if (durationSeconds !== undefined) {
    if (
      typeof durationSeconds !== 'number' ||
      durationSeconds < 1 ||
      durationSeconds > 60
    ) {
      return {
        isValid: false,
        error: {
          message: 'Duration must be between 1 and 60 seconds',
          status: 400,
        },
      };
    }
  }

  if (generateAudio !== undefined && typeof generateAudio !== 'boolean') {
    return {
      isValid: false,
      error: {
        message: 'generateAudio must be a boolean',
        status: 400,
      },
    };
  }

  return { isValid: true };
}
