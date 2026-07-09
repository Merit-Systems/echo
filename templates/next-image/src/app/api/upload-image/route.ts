import { type NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// IMPORTANT: For local development, ensure you have a .env.local file with:
// BLOB_READ_WRITE_TOKEN="YOUR_VERCEL_BLOB_READ_WRITE_TOKEN"
// You can generate a token in your Vercel project settings under 'Storage' -> 'Blob' -> 'API Keys'.

export const config = {
  // This API route explicitly handles multipart/form-data for file uploads,
  // so we disable Next.js's default body parser to process the file stream manually.
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob storage token not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
  }

  try {
    // Sanitize filename to prevent issues, especially with special characters or path traversals.
    // Appending a timestamp or UUID is also common to ensure uniqueness.
    const filename = `${Date.now()}-${encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'))}`;
    
    // Upload the file to Vercel Blob storage
    const blob = await put(filename, file, {
      access: 'public', // Make the uploaded image publicly accessible via URL
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return the URL of the uploaded blob
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading file to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
