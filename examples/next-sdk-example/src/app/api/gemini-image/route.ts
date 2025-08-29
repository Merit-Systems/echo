import { generateText } from 'ai';

import { google } from '@/echo';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: await google('gemini-2.5-flash-image-preview'),
    providerOptions: {
      google: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    },
    prompt,
  });

  for (const file of result.files) {
    if (file.mediaType.startsWith('image/')) {
      console.log('🔄 Image found in response: ', file.base64);
      return Response.json({
        imageUrl: { base64Data: file.base64, mediaType: file.mediaType },
      });
    }
  }

  return Response.json(
    { error: 'No image found in response' },
    { status: 404 }
  );
}
