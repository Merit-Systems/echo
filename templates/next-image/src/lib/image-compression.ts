/**
 * Image compression utilities
 * Compresses images before upload to reduce payload size and improve performance
 */

import imageCompression from 'browser-image-compression';
import { MAX_IMAGE_SIZE_MB } from './constants';

/**
 * Compresses an image file to the configured maximum size
 * Uses browser-image-compression library with web workers for non-blocking compression
 *
 * @param file - The image file to compress
 * @returns Compressed image file
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_IMAGE_SIZE_MB,
      useWebWorker: true,
      fileType: file.type,
    });

    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails, return original file
    // Better to try with larger file than fail completely
    return file;
  }
}

/**
 * Compresses multiple image files in parallel
 *
 * @param files - Array of image files to compress
 * @returns Array of compressed image files
 */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
