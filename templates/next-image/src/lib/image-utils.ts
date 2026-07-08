/**
 * Minimal Image Utilities
 *
 * Simple, clean API with just data URLs. No complex conversions.
 */

/**
 * Maximum dimension (width or height) for resized images before upload.
 * Prevents 413 Request Entity Too Large errors on serverless functions.
 */
const MAX_RESIZE_DIMENSION = 1024;

/**
 * Converts a File to a data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes an image File to fit within MAX_RESIZE_DIMENSION while preserving aspect ratio.
 * Returns a JPEG data URL for smaller payload sizes.
 * If the image is already small enough, returns the original data URL unchanged.
 */
export async function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // If already within limits, just convert to data URL as-is
      if (width <= MAX_RESIZE_DIMENSION && height <= MAX_RESIZE_DIMENSION) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
        return;
      }

      // Scale down preserving aspect ratio
      const scale = MAX_RESIZE_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG at 90% quality for smaller payload
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = url;
  });
}

/**
 * Converts a data URL to a File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  return new File([array], filename, { type: mime });
}

/**
 * Downloads an image from a data URL
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies an image to the clipboard from a data URL
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  const blob = new Blob([array], { type: mime });
  await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]);
}

/**
 * Generates a filename for an image
 */
export function generateFilename(imageId: string): string {
  return `generated-image-${imageId}.png`;
}

/**
 * Extracts media type from a data URL
 */
export function getMediaTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return 'image/jpeg';
  return dataUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
}
