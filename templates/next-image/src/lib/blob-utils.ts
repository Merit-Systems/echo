/**
 * Client-side Vercel Blob utilities
 * 
 * This module handles uploading images DIRECTLY to Vercel Blob storage from the client.
 * This bypasses the 4.5MB server request limit entirely!
 */

import { upload } from '@vercel/blob/client';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition: string;
  downloadUrl: string;
}

export async function uploadFileToBlob(file: File): Promise<BlobUploadResult> {
  try {
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/blob/upload-handler',
    });

    return blob;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error(
      `Failed to upload file to blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function uploadFilesToBlob(
  files: File[]
): Promise<BlobUploadResult[]> {
  if (files.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    files.map(file => uploadFileToBlob(file))
  );

  const successful: BlobUploadResult[] = [];
  const failed: { file: File; error: Error }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({
        file: files[index],
        error: result.reason instanceof Error 
          ? result.reason 
          : new Error('Unknown upload error'),
      });
    }
  });

  if (failed.length > 0) {
    console.warn(`${failed.length} of ${files.length} uploads failed:`, failed);
    
    if (successful.length === 0) {
      throw new Error(
        `All ${files.length} file uploads failed. First error: ${failed[0].error.message}`
      );
    }
  }

  return successful;
}

export async function blobUrlToFile(
  blobUrl: string,
  filename: string
): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

