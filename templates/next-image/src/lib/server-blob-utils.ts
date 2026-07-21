/**
 * Server-side Vercel Blob utilities
 * 
 * This module handles downloading images from Vercel Blob storage on the server
 * and converting them to base64 for AI model consumption.
 */

export function isBlobUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export async function downloadBlobToDataUrl(
  blobUrl: string
): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download blob: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error downloading blob:', error);
    throw new Error(
      `Failed to download image from blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function downloadBlobsToDataUrls(
  blobUrls: string[]
): Promise<string[]> {
  return Promise.all(blobUrls.map(url => downloadBlobToDataUrl(url)));
}

export async function processImageUrls(
  imageUrls: string[]
): Promise<string[]> {
  return Promise.all(
    imageUrls.map(async url => {
      // If it's already a data URL, return as-is
      if (url.startsWith('data:')) {
        return url;
      }
      
      // If it's a blob URL, download and convert
      if (isBlobUrl(url)) {
        return downloadBlobToDataUrl(url);
      }
      
      // For any other URL type, try to download it
      return downloadBlobToDataUrl(url);
    })
  );
}

