/**
 * Types for the Next.js Image Generation Template
 * This file consolidates all type definitions used across the application
 */

/**
 * Available AI models for image generation
 */
export type ModelOption = 'openai' | 'gemini';

/**
 * Model configuration with display names
 */
export interface ModelConfig {
  id: ModelOption;
  name: string;
}

/**
 * Complete generated image record with all metadata
 */
export interface GeneratedImage {
  /** Unique identifier for the image */
  id: string;
  /** The actual image as data URL (undefined if still loading or error) */
  imageUrl?: string;
  /** User prompt that generated this image */
  prompt: string;
  /** AI model used for generation */
  model?: ModelOption;
  /** When the image was generated */
  timestamp: Date;
  /** Source images used for editing as data URLs */
  attachments?: string[];
  /** Whether this was an edit operation (vs. new generation) */
  isEdit: boolean;
  /** Whether the image is still being generated */
  isLoading?: boolean;
  /** Error message if generation failed */
  error?: string;
}

/**
 * Request payload for image generation API
 */
export interface GenerateImageRequest {
  prompt: string;
  model: ModelOption;
}

/**
 * Request payload for image editing API
 */
export interface EditImageRequest {
  prompt: string;
  imageUrls: string[]; // Array of data URLs or regular URLs
  provider: ModelOption;
}

/**
 * Response from image generation/editing APIs
 */
export interface ImageResponse {
  imageUrl: string; // data URL
}

/**
 * Error response from APIs
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Props for components that handle image actions
 */
export interface ImageActionHandlers {
  onAddToInput: (files: File[]) => void;
  onImageClick?: (image: GeneratedImage) => void;
}
