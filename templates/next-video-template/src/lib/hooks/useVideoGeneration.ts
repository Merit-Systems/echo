import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { generateVideo } from '@/lib/api/video-api';
import { fileToDataUrl } from '@/lib/image-utils';
import type {
  GeneratedVideo,
  VideoModelOption,
  VideoOperation,
} from '@/lib/types';
import { videoOperationsStorage } from '@/lib/video-operations';
import { GenerateVideosOperation } from '@google/genai';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseVideoGenerationOptions {
  model: VideoModelOption;
  durationSeconds: number;
  generateAudio: boolean;
  onVideoAdded: (video: GeneratedVideo) => void;
  onVideoUpdated: (id: string, updates: Partial<GeneratedVideo>) => void;
}

export function useVideoGeneration({
  model,
  durationSeconds,
  generateAudio,
  onVideoAdded,
  onVideoUpdated,
}: UseVideoGenerationOptions) {
  const queryClient = useQueryClient();

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      const prompt = message.text?.trim() || '';
      const videoId = `vid_${Date.now()}`;

      // Process image attachments
      const { imageDataUrl, lastFrameDataUrl } = await processImageAttachments(
        message.files
      );

      // Create placeholder for optimistic UI
      const placeholderVideo: GeneratedVideo = {
        id: videoId,
        prompt,
        model,
        durationSeconds,
        timestamp: new Date(),
        isLoading: true,
      };

      onVideoAdded(placeholderVideo);

      try {
        const result = await generateVideo({
          prompt,
          model,
          durationSeconds,
          generateAudio,
          image: imageDataUrl,
          lastFrame: lastFrameDataUrl,
        });

        if (result.done) {
          handleCompletedOperation(result, videoId, onVideoUpdated);
        } else {
          handlePendingOperation(
            result,
            videoId,
            prompt,
            model,
            durationSeconds,
            queryClient,
            onVideoUpdated
          );
        }
      } catch (error) {
        console.error('Error generating video:', error);
        onVideoUpdated(videoId, {
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to generate video',
        });
      }
    },
    [
      model,
      durationSeconds,
      generateAudio,
      queryClient,
      onVideoAdded,
      onVideoUpdated,
    ]
  );

  return { handleSubmit };
}

// ========== Helper Functions ==========

async function processImageAttachments(
  files?: PromptInputMessage['files']
): Promise<{ imageDataUrl?: string; lastFrameDataUrl?: string }> {
  if (!files || files.length === 0) {
    return {};
  }

  const imageFiles = files.filter(f => f.mediaType?.startsWith('image/'));
  if (imageFiles.length === 0) {
    return {};
  }

  try {
    const imageDataUrl = await fetchAndConvertImage(imageFiles[0]);
    const lastFrameDataUrl =
      imageFiles.length > 1
        ? await fetchAndConvertImage(imageFiles[1])
        : undefined;

    return { imageDataUrl, lastFrameDataUrl };
  } catch (error) {
    console.error('Failed to process image attachments:', error);
    return {};
  }
}

async function fetchAndConvertImage(
  attachment: NonNullable<PromptInputMessage['files']>[number]
): Promise<string> {
  const response = await fetch(attachment.url);
  const blob = await response.blob();
  const file = new File([blob], attachment.filename || 'image', {
    type: attachment.mediaType,
  });
  return fileToDataUrl(file);
}

function handleCompletedOperation(
  result: GenerateVideosOperation,
  videoId: string,
  onVideoUpdated: (id: string, updates: Partial<GeneratedVideo>) => void
) {
  const video = result.response?.generatedVideos?.[0]?.video;

  if (video && (video.uri || video.videoBytes)) {
    const videoUrl = video.videoBytes
      ? `data:video/mp4;base64,${video.videoBytes}`
      : video.uri || '';

    onVideoUpdated(videoId, {
      videoUrl,
      operationName: result.name,
      isLoading: false,
      error: undefined,
    });

    // Store the operation with expiration timestamp if it's a signed URL
    const videoWithExpiry = video as { expiresAt?: string };
    if (videoWithExpiry.expiresAt) {
      const operation = videoOperationsStorage
        .getAll()
        .find(op => op.id === videoId);
      if (operation) {
        videoOperationsStorage.update(videoId, {
          signedUrlExpiresAt: videoWithExpiry.expiresAt,
        });
      }
    }
  } else if (result.error) {
    onVideoUpdated(videoId, {
      isLoading: false,
      error:
        typeof result.error === 'string'
          ? result.error
          : 'Video generation failed',
    });
  }
}

function handlePendingOperation(
  result: GenerateVideosOperation,
  videoId: string,
  prompt: string,
  model: VideoModelOption,
  durationSeconds: number,
  queryClient: ReturnType<typeof useQueryClient>,
  onVideoUpdated: (id: string, updates: Partial<GeneratedVideo>) => void
) {
  const operation: VideoOperation = {
    id: videoId,
    prompt,
    model,
    durationSeconds,
    timestamp: new Date(),
    operation: result,
  };

  videoOperationsStorage.store(operation);
  queryClient.invalidateQueries({ queryKey: ['video-operations'] });
  onVideoUpdated(videoId, { operationName: result.name });
}
