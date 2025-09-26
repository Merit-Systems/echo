/**
 * Google Gemini Veo video generation handler
 */

import { getEchoToken } from '@/echo';
import { ERROR_MESSAGES } from '@/lib/constants';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
/**
 * Initiates Google Veo video generation and returns operation immediately
 */
export async function handleGeminiGenerate(
  prompt: string,
  durationSeconds: number = 4
): Promise<Response> {
  try {
    const apiKey = await getEchoToken();

    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        baseUrl: 'https://echo-staging.up.railway.app',
      },
    });

    const operation = await ai.models.generateVideos({
      model: 'veo-3.0-fast-generate-001',
      prompt,
      config: {
        durationSeconds,
      },
    });

    // Store the complete operation object as serialized JSON for later use
    const operationData = JSON.stringify(operation);

    // Return operation info immediately without polling
    return Response.json({
      operationName: operation.name,
      operationId: operation.name, // Use Gemini's operation name as ID
      status: operation.done ? 'completed' : 'pending',
      videoUrl: undefined, // Will be set when operation completes
      operationData, // Pass the operation data to client
    });
  } catch (error) {
    console.error('Gemini video generation error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.NO_VIDEO_GENERATED,
      },
      { status: 500 }
    );
  }
}

/**
 * Checks the status of a video generation operation
 * We need to pass the serialized operation object that was returned from generateVideos
 */
export async function checkGeminiOperationStatus(
  operationData: string
): Promise<Response> {
  try {
    const apiKey = await getEchoToken();

    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        baseUrl: 'https://echo-staging.up.railway.app',
      },
    });

    // Deserialize the operation object
    const operationObj = JSON.parse(operationData);

    // Use the SDK method with the actual operation object
    const operation = await ai.operations.getVideosOperation({
      operation: operationObj,
    });

    if (operation.done) {
      const video = operation.response?.generatedVideos?.[0]?.video;

      if (!video || !video.uri) {
        return Response.json({
          status: 'failed',
          error: ERROR_MESSAGES.NO_VIDEO_GENERATED,
        });
      }

      // Return a proxied URL so the player can access the protected video via server-side auth
      const proxiedUrl = `/api/proxy-video?uri=${encodeURIComponent(video.uri)}`;
      return Response.json({
        status: 'completed',
        videoUrl: proxiedUrl,
      });
    }

    return Response.json({
      status: 'processing',
    });
  } catch (error) {
    console.error('Error checking operation status:', error);
    return Response.json(
      {
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check operation status',
      },
      { status: 500 }
    );
  }
}

/**
 * Checks the status of a video generation operation by operation name only
 */
export async function checkGeminiOperationStatusByName(
  operationName: string
): Promise<Response> {
  try {
    const apiKey = await getEchoToken();

    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        baseUrl: 'https://echo-staging.up.railway.app',
      },
    });

    const newOperation = new GenerateVideosOperation();

    newOperation.name = operationName

    // Build a minimal operation object using only the name
    const operation = await ai.operations.getVideosOperation({
      operation: newOperation,
    });

    if (operation.done) {
      const video = operation.response?.generatedVideos?.[0]?.video;

      if (!video || !video.uri) {
        return Response.json({
          status: 'failed',
          error: ERROR_MESSAGES.NO_VIDEO_GENERATED,
        });
      }

      const proxiedUrl = `/api/proxy-video?uri=${encodeURIComponent(video.uri)}`;
      return Response.json({
        status: 'completed',
        videoUrl: proxiedUrl,
      });
    }

    return Response.json({ status: 'processing' });
  } catch (error) {
    console.error('Error checking operation status by name:', error);
    return Response.json(
      {
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check operation status',
      },
      { status: 500 }
    );
  }
}
