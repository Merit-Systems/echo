/**
 * Shared image action handlers for download, copy, and file conversion operations
 * Used by both ImageHistoryItem and ImageDetailsDialog components
 */

import {
  downloadDataUrl,
  copyDataUrlToClipboard,
  generateFilename,
  imageUrlToFile,
} from './image-utils';
import type { GeneratedImage } from './types';

/**
 * Downloads an image to the user's device
 */
export function handleImageDownload(imageUrl: string, imageId: string): void {
  const filename = generateFilename(imageId);
  downloadDataUrl(imageUrl, filename);
}

/**
 * Copies an image to the system clipboard
 */
export async function handleImageCopy(imageUrl: string): Promise<void> {
  await copyDataUrlToClipboard(imageUrl);
}

/**
 * Converts image data to a File object for adding to input
 */
export async function handleImageToFile(
  imageUrl: string,
  imageId: string
): Promise<File> {
  const filename = generateFilename(imageId);
  return imageUrlToFile(imageUrl, filename);
}

/**
 * Checks if an image is available for actions
 */
export function isImageActionable(image: GeneratedImage): boolean {
  return !!image.imageUrl;
}

/**
 * Gets the display text for a model
 */
export function getModelDisplayName(model?: string): string {
  const modelMap = {
    openai: 'GPT Image',
    gemini: 'Gemini Flash Image',
  };
  return modelMap[model as keyof typeof modelMap] || 'Unknown Model';
}
