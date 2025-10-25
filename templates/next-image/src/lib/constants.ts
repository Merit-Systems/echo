/**
 * Application constants and error messages
 */

/**
 * Maximum size for image compression before upload (in MB)
 * Adjust this value to tune quality vs. size tradeoff
 * - Lower values (0.5): Smaller files, faster uploads, lower quality
 * - Higher values (1.5): Better quality, slower uploads, may hit API limits
 * - Recommended: 0.75 (good balance for AI image processing)
 */
export const MAX_IMAGE_SIZE_MB = 0.75;

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentication failed. No token available.',
  GENERATION_FAILED: 'Image generation failed. Please try again later.',
  EDITING_FAILED: 'Image editing failed. Please try again later.',
  NO_IMAGE_GENERATED: 'No image was generated. Please try a different prompt.',
  NO_EDITED_IMAGE:
    'No edited image was generated. Please try a different edit prompt.',
} as const;
