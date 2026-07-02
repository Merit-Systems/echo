/**
 * Minimal Image Utilities
 *
 * Simple helpers for browser image URLs and file conversion.
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

const DEFAULT_MAX_IMAGE_DIMENSION = 1024;
const DEFAULT_IMAGE_QUALITY = 0.85;
const COMPRESS_SKIP_BYTES = 512 * 1024;

interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

/**
 * Compresses large image files before they are sent to API routes.
 *
 * The next-image template used to send raw base64 in JSON requests. Large
 * source images can exceed platform request limits before the API route runs,
 * so edit requests should send this smaller File via multipart form data.
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_IMAGE_DIMENSION;
  const quality = options.quality ?? DEFAULT_IMAGE_QUALITY;

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;

    if (scale === 1 && file.size <= COMPRESS_SKIP_BYTES) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const filename = file.name.replace(/\.[^.]*$/, '') || 'image';
    return new File([blob], `${filename}.jpg`, {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.warn('Image compression failed, using original file:', error);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
 * Downloads an image from a browser-readable URL.
 */
export function downloadDataUrl(imageUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function imageUrlToBlob(imageUrl: string): Promise<Blob> {
  if (!imageUrl.startsWith('data:')) {
    const response = await fetch(imageUrl);
    return response.blob();
  }

  const [header, base64] = imageUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

export async function imageUrlToFile(
  imageUrl: string,
  filename: string
): Promise<File> {
  const blob = await imageUrlToBlob(imageUrl);
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

/**
 * Copies an image to the clipboard from a browser-readable URL.
 */
export async function copyDataUrlToClipboard(imageUrl: string): Promise<void> {
  const blob = await imageUrlToBlob(imageUrl);
  const mime = blob.type || 'image/png';
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
