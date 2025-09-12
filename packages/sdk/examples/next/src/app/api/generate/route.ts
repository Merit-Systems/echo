import { openai } from '@/echo';
import { experimental_generateImage as generateImage } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateImage({
    model: openai.image('gpt-image-1'),
    prompt,
  });

  return Response.json({ imageUrl: result.image });
}
