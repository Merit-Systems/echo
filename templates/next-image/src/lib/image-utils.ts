/**
 * Image Utilities
 *
 * Data URL helpers and client-side image compression to help avoid
 * "Request Entity Too Large" (HTTP 413) errors when sending base64 payloads
 * to the API routes.
 *
 * Two-layer defence against 413:
 *   1. Server: `next.config.ts` raises the body-size limit to 10 MB via
 *              `experimental.serverActions.bodySizeLimit`.
 *   2. Client: `compressImageDataUrl` (below) shrinks images before upload,
 *              giving a better UX and staying well under any server limit.
 */

// ---------------------------------------------------------------------------
// Compression constants
// ---------------------------------------------------------------------------

/** Max dimension (width or height) before downscaling. */
const MAX_IMAGE_DIMENSION = 1024;

/** JPEG quality used when re-encoding (0–1). */
const COMPRESS_QUALITY = 0.85;

/** Hard cap: if a data URL is already smaller than this, skip re-encoding. */
const COMPRESS_SKIP_THRESHOLD_BYTES = 512 * 1024; // 512 KB

// ---------------------------------------------------------------------------
// Core conversions
// ---------------------------------------------------------------------------

/**
 * Converts a File to a data URL.
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
 * Converts a data URL to a File object.
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

// ---------------------------------------------------------------------------
// Client-side compression
// ---------------------------------------------------------------------------

/**
 * Compresses a data URL so it is suitable for sending as a JSON body.
 *
 * Strategy:
 *   - Skip images that are already small (< COMPRESS_SKIP_THRESHOLD_BYTES).
 *   - Downscale so that neither dimension exceeds MAX_IMAGE_DIMENSION px.
 *   - Re-encode as JPEG at COMPRESS_QUALITY.
 *
 * This is a client-side safety net. The definitive fix for HTTP 413 is the
 * raised body-size limit in `next.config.ts`.
 *
 * @param dataUrl  Source image as a data URL (any format supported by <img>).
 * @returns        Compressed data URL (image/jpeg).
 */
export async function compressImageDataUrl(dataUrl: string): Promise<string> {
  // Fast path: already tiny enough, no need to spin up a canvas.
  if (dataUrl.length < COMPRESS_SKIP_THRESHOLD_BYTES) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Downscale proportionally if either dimension exceeds the limit.
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Canvas unavailable — return original rather than throwing.
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', COMPRESS_QUALITY));
    };

    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Converts a File to a compressed data URL ready for API submission.
 *
 * Combines `fileToDataUrl` + `compressImageDataUrl` into a single call.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const raw = await fileToDataUrl(file);
  return compressImageDataUrl(raw);
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

/**
 * Downloads an image from a data URL.
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
 * Copies an image to the clipboard from a data URL.
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
 * Generates a filename for an image.
 */
export function generateFilename(imageId: string): string {
  return `generated-image-${imageId}.png`;
}

/**
 * Extracts media type from a data URL.
 */
export function getMediaTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return 'image/jpeg';
  return dataUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
}
