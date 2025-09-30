/**
 * Types for the Next.js Image Generation Template
 * This file consolidates all type definitions used across the application
 */

import { GenerateVideosOperation } from '@google/genai';

/**
 * Available AI models for image generation
 */
export type ModelOption = 'openai' | 'gemini';

/**
 * Available AI models for video generation
 */
export type VideoModelOption =
  | 'veo-3.0-fast-generate-preview'
  | 'veo-3.0-generate-preview';

/**
 * Model configuration with display names
 */
export interface ModelConfig {
  id: ModelOption;
  name: string;
}

/**
 * Video model configuration with display names
 */
export interface VideoModelConfig {
  id: VideoModelOption;
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
 * Complete generated video record with all metadata
 */
export interface GeneratedVideo {
  /** Unique identifier for the video */
  id: string;
  /** The actual video URL (undefined if still loading or error) */
  videoUrl?: string;
  /** User prompt that generated this video */
  prompt: string;
  /** AI model used for generation */
  model: VideoModelOption;
  /** Duration in seconds */
  durationSeconds: number;
  /** When the video was generated */
  timestamp: Date;
  /** Whether the video is still being generated */
  isLoading?: boolean;
  /** Error message if generation failed */
  error?: string;
  /** Optional operation name for tracking */
  operationName?: string;
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
 * Request payload for video generation API
 */
export interface GenerateVideoRequest {
  prompt: string;
  model: VideoModelOption;
  durationSeconds?: number;
  generateAudio?: boolean;
  image?: string; // Base64 encoded image or data URL (first frame)
  lastFrame?: string; // Base64 encoded image or data URL (last frame)
}

/**
 * Video operation tracking - simplified to only contain UI-specific data
 * The SDK operation contains all the provider-specific data
 */
export interface VideoOperation {
  /** Unique identifier for the operation */
  id: string;
  /** User prompt */
  prompt: string;
  /** AI model used */
  model: VideoModelOption;
  /** Duration in seconds */
  durationSeconds: number;
  /** When the operation was started */
  timestamp: Date;
  /** Video URL when completed (derived from SDK operation) */
  videoUrl?: string;
  /** Error message if failed (derived from SDK operation) */
  error?: string;
  /** When the signed URL expires (ISO string) */
  signedUrlExpiresAt?: string;
  /** The actual SDK operation object */
  operation: GenerateVideosOperation;
}

// No need for VideoResponse - just use GenerateVideosOperation directly from the SDK

/**
 * Props for components that handle image actions
 */
export interface ImageActionHandlers {
  onAddToInput: (files: File[]) => void;
  onImageClick?: (image: GeneratedImage) => void;
}
