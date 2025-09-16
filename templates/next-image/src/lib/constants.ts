/**
 * Application constants and error messages
 */

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentication failed. No token available.',
  GENERATION_FAILED: 'Image generation failed. Please try again later.',
  EDITING_FAILED: 'Image editing failed. Please try again later.',
  NO_IMAGE_GENERATED: 'No image was generated. Please try a different prompt.',
  NO_EDITED_IMAGE:
    'No edited image was generated. Please try a different edit prompt.',
} as const;
