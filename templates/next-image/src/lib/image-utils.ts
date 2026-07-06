/**
 * Image Utilities
 *
 * Data URL helpers and client-side image compression to avoid
 * "Request Entity Too Large" (HTTP 413) when sending base64 payloads.
 */

/** Max dimension (width or height) for images sent to the API */
const MAX_IMAGE_DIMENSION = 1024;

/** JPEG quality used when compressing (0-1) */
const COMPRESS_QUALITY = 0.85;

/** Target max size in bytes for a single compressed image (~3MB) */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

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
 * Compresses an image data URL by resizing and converting to JPEG.
 * Falls back to the original if compression fails (e.g. in non-browser envs).
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxDimension: number = MAX_IMAGE_DIMENSION,
  quality: number = COMPRESS_QUALITY
): Promise<string> {
  if (typeof document === 'undefined') return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if either dimension exceeds the limit
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

      // Try JPEG first for smaller size, iteratively reduce quality if needed
      let compressed = canvas.toDataURL('image/jpeg', quality);
      let currentQuality = quality;

      while (estimateBase64Bytes(compressed) > MAX_IMAGE_BYTES && currentQuality > 0.3) {
        currentQuality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Rough estimate of the decoded byte size of a base64 data URL
 */
function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.floor(base64.length * 0.75);
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
