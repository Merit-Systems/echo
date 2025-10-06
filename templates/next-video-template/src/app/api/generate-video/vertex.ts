/**
 * Google Gemini Veo video generation handler
 */

import { getEchoToken } from '@/echo';
import { ERROR_MESSAGES } from '@/lib/constants';
import {
  GenerateVideosOperation,
  GenerateVideosParameters,
  GoogleGenAI,
} from '@google/genai';
/**
 * Initiates Google Veo video generation and returns operation immediately
 */
export async function handleGeminiGenerate(
  prompt: string,
  model: 'veo-3.0-fast-generate-preview' | 'veo-3.0-generate-preview',
  durationSeconds: number = 4,
  generateAudio: boolean = false,
  image?: string, // Base64 encoded image or data URL (first frame)
  lastFrame?: string // Base64 encoded image or data URL (last frame)
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
      vertexai: true,
      httpOptions: {
        baseUrl: 'https://echo.router.merit.systems',
        apiVersion: 'v1',
      },
    });

    const generateParams: GenerateVideosParameters = {
      model,
      prompt,
      config: {
        durationSeconds,
        enhancePrompt: true,
        personGeneration: 'allow_all',
        generateAudio,
        outputGcsUri: 'template-v1',
      },
    };

    // Add image if provided
    if (image) {
      // Handle both data URLs and plain base64
      const base64Data = image.startsWith('data:')
        ? image.split(',')[1]
        : image;

      generateParams.image = {
        imageBytes: base64Data,
        mimeType: 'image/jpeg', // Default to JPEG, could be made configurable
      };
    }

    // Add lastFrame if provided (only when there are 2+ images)
    if (lastFrame) {
      // Handle both data URLs and plain base64
      const lastFrameBase64Data = lastFrame.startsWith('data:')
        ? lastFrame.split(',')[1]
        : lastFrame;

      // Ensure config exists before setting lastFrame
      if (!generateParams.config) {
        generateParams.config = {};
      }

      generateParams.config.lastFrame = {
        imageBytes: lastFrameBase64Data,
        mimeType: 'image/jpeg', // Default to JPEG, could be made configurable
      };
    }

    const operation = await ai.models.generateVideos(generateParams);

    // Return the SDK operation directly - no wrapper needed
    return Response.json(operation);
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
 * Can accept either a full operation object or just the operation name
 */
export async function checkGeminiOperationStatus(
  operationOrName: GenerateVideosOperation | string
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
      vertexai: true,
      httpOptions: {
        baseUrl: 'https://echo.router.merit.systems',
        apiVersion: 'v1',
      },
    });

    // Handle both operation object and operation name string
    let operation: GenerateVideosOperation;
    if (typeof operationOrName === 'string') {
      operation = new GenerateVideosOperation();
      operation.name = operationOrName;
    } else {
      operation = operationOrName;
    }

    // Use the SDK method to check operation status
    const updatedOperation = await ai.operations.getVideosOperation({
      operation: operation,
    });

    // Just return the SDK operation response directly
    return Response.json(updatedOperation);
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
