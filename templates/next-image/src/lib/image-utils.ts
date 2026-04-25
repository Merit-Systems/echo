/**
 * Minimal Image Utilities
 *
 * Handles both data URLs (data:...) and hosted URLs (https://...).
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
 * Downloads an image from a URL (data URL or hosted URL)
 */
export async function downloadDataUrl(url: string, filename: string): Promise<void> {
  let href: string;
  let objectUrl: string | undefined;

  if (url.startsWith('data:')) {
    href = url;
  } else {
    // Hosted URL – fetch the image blob to trigger download correctly
    const response = await fetch(url);
    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    href = objectUrl;
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Copies an image to the clipboard from a URL (data URL or hosted URL)
 */
export async function copyDataUrlToClipboard(url: string): Promise<void> {
  let mime: string;
  let blob: Blob;

  if (url.startsWith('data:')) {
    const [header, base64] = url.split(',');
    mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const bytes = atob(base64);
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      array[i] = bytes.charCodeAt(i);
    }
    blob = new Blob([array], { type: mime });
  } else {
    // Hosted URL – fetch the image
    const response = await fetch(url);
    blob = await response.blob();
    mime = blob.type || 'image/png';
  }

  await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]);
}

/**
 * Generates a filename for an image
 */
export function generateFilename(imageId: string): string {
  return `generated-image-${imageId}.png`;
}

/**
 * Extracts media type from a data URL or hosted URL
 */
export function getMediaTypeFromDataUrl(url: string): string {
  if (url.startsWith('data:')) {
    return url.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
  }
  // For hosted URLs, infer from extension or default to jpeg
  const ext = url.split('.').pop()?.toLowerCase();
  const extMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return extMap[ext || ''] || 'image/jpeg';
}
