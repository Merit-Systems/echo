/**
 * Minimal Image Utilities
 *
 * Simple, clean API with just data URLs. No complex conversions.
 */

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

/**
 * Compresses an image to reduce payload size before sending to the API.
 * Prevents HTTP 413 (Request Entity Too Large) when images are sent as
 * base64 data URLs in JSON request bodies.
 *
 * @param dataUrl - The source image as a data URL
 * @param maxDimension - Maximum width or height in pixels (default: 2048)
 * @param quality - JPEG compression quality 0-1 (default: 0.85)
 * @returns Compressed image as a data URL
 */
export async function compressImage(
  dataUrl: string,
  maxDimension = 2048,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if exceeding max dimension, preserving aspect ratio
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Keep PNG for images that may have transparency, use JPEG otherwise
      const mediaType = getMediaTypeFromDataUrl(dataUrl);
      const outputType = mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(outputType, quality));
    };
    img.onerror = () =>
      reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}
