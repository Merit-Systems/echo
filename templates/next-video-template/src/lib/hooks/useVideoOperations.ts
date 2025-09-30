import { checkVideoStatus } from '@/lib/api/video-api';
import type { GeneratedVideo } from '@/lib/types';
import { videoOperationsStorage } from '@/lib/video-operations';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface UseVideoOperationsOptions {
  isInitialized: boolean;
  onOperationComplete: (
    operationId: string,
    updates: Partial<GeneratedVideo>
  ) => void;
}

/**
 * Hook to manage video operation polling
 *
 * Smart polling logic:
 * - Polls operations that are not done yet
 * - Re-polls completed operations if their signed URLs have expired (after 1 hour)
 * - Stops polling once operation is done and URL is still valid
 */
export function useVideoOperations({
  isInitialized,
  onOperationComplete,
}: UseVideoOperationsOptions) {
  const queryClient = useQueryClient();
  const pendingOperations = isInitialized
    ? videoOperationsStorage.getPending()
    : [];

  const { data: operationStatuses } = useQuery({
    queryKey: ['video-operations', pendingOperations.map(op => op.id)],
    queryFn: async () => {
      if (pendingOperations.length === 0) {
        return [];
      }

      const results = await Promise.allSettled(
        pendingOperations.map(async op => {
          const result = await checkVideoStatus(op.operation);
          return { operationId: op.id, result };
        })
      );
      return results;
    },
    enabled: isInitialized && pendingOperations.length > 0,
    refetchInterval: 5000,
  });

  // Process operation status updates
  useEffect(() => {
    if (!operationStatuses) return;

    let hasUpdates = false;

    operationStatuses.forEach(result => {
      if (result.status === 'fulfilled') {
        const { operationId, result: opResult } = result.value;

        if (opResult.done) {
          videoOperationsStorage.update(operationId, { operation: opResult });

          const video = opResult.response?.generatedVideos?.[0]?.video;
          if (video && (video.uri || video.videoBytes)) {
            const videoUrl = video.videoBytes
              ? `data:video/mp4;base64,${video.videoBytes}`
              : video.uri || '';

            onOperationComplete(operationId, {
              videoUrl,
              isLoading: false,
              error: undefined,
            });

            // Extract expiresAt if present (added by server when generating signed URLs)
            const videoWithExpiry = video as { expiresAt?: string };
            videoOperationsStorage.update(operationId, {
              videoUrl,
              error: undefined,
              signedUrlExpiresAt: videoWithExpiry.expiresAt,
              operation: opResult,
            });
          } else {
            // Operation done but no video
            const errorMsg = extractErrorMessage(opResult);
            onOperationComplete(operationId, {
              error: errorMsg,
              isLoading: false,
            });
            videoOperationsStorage.update(operationId, {
              error: errorMsg,
              operation: opResult,
            });
          }
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      queryClient.invalidateQueries({ queryKey: ['video-operations'] });
    }
  }, [operationStatuses, queryClient, onOperationComplete]);
}

function extractErrorMessage(opResult: {
  response?: {
    raiMediaFilteredCount?: number;
    raiMediaFilteredReasons?: string[];
  };
  error?: unknown;
}): string {
  if (
    opResult.response?.raiMediaFilteredCount &&
    opResult.response.raiMediaFilteredCount > 0
  ) {
    const filterReasons = opResult.response.raiMediaFilteredReasons || [];
    return filterReasons.length > 0
      ? filterReasons[0]
      : 'Content was filtered by safety policies';
  }

  if (opResult.error) {
    return typeof opResult.error === 'string'
      ? opResult.error
      : 'Video generation failed';
  }

  return 'Video generation failed';
}
