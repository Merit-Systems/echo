/**
 * API Route: Generate Video
 *
 * This route demonstrates Echo SDK integration with AI video generation:
 * - Supports Gemini Veo models
 * - Handles text-to-video generation
 * - Returns video URLs or operation status
 */

import {
  GenerateVideoRequest,
  validateGenerateVideoRequest,
} from './validation';
import { handleGeminiGenerate } from './vertex';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateGenerateVideoRequest(body);
    if (!validation.isValid) {
      return Response.json(
        { error: validation.error!.message },
        { status: validation.error!.status }
      );
    }

    const {
      prompt,
      model,
      durationSeconds = 4,
      generateAudio = false,
      image,
      lastFrame,
    } = body as GenerateVideoRequest;

    return handleGeminiGenerate(
      prompt,
      model,
      durationSeconds,
      generateAudio,
      image,
      lastFrame
    );
  } catch (error) {
    console.error('Video generation error:', error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Video generation failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}
