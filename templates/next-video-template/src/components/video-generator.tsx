'use client';

import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  GeneratedVideo,
  GenerateVideoRequest,
  VideoModelConfig,
  VideoModelOption,
  VideoResponse,
  VideoOperation,
} from '@/lib/types';
import { videoOperationsStorage } from '@/lib/video-operations';
import { videoHistoryStorage } from '@/lib/video-history';
import { VideoHistory } from './video-history';

/**
 * Available AI models for video generation
 * These models integrate with the Echo SDK to provide different video generation capabilities
 */
const models: VideoModelConfig[] = [{ id: 'veo-3', name: 'Veo 3 Fast' }];

/**
 * API functions for video generation
 * These functions communicate with the Echo SDK backend routes
 */

// ===== API FUNCTIONS =====
async function generateVideo(
  request: GenerateVideoRequest
): Promise<VideoResponse> {
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function checkVideoStatus(operationData: string): Promise<VideoResponse> {
  const response = await fetch('/api/check-video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationData }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Main VideoGenerator component
 *
 * This component demonstrates how to integrate Echo SDK with AI video generation:
 * - Uses PromptInput for unified input handling
 * - Supports text-to-video generation with duration control
 * - Maintains history of all generated videos
 * - Provides seamless model switching between available video models
 */
export default function VideoGenerator() {
  const [model, setModel] = useState<VideoModelOption>('veo-3');
  const [durationSeconds, setDurationSeconds] = useState<number>(4);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideo[]>([]);
  const [activeOperations, setActiveOperations] = useState<Map<string, VideoOperation>>(new Map());
  const promptInputRef = useRef<HTMLFormElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Load existing history on mount
  useEffect(() => {
    const existing = videoHistoryStorage.getAll();
    if (existing.length > 0) {
      setVideoHistory(existing);
    }
  }, []);

  // Persist history on change
  useEffect(() => {
    if (videoHistory.length >= 0) {
      videoHistoryStorage.setAll(videoHistory);
    }
  }, [videoHistory]);


  const clearForm = useCallback(() => {
    promptInputRef.current?.reset();
  }, []);

  // Polling function to check operation status
  const pollOperations = useCallback(async () => {
    const pendingOperations = Array.from(activeOperations.values()).filter(
      op => op.status === 'pending' || op.status === 'processing'
    );

    if (pendingOperations.length === 0) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    for (const operation of pendingOperations) {
      try {
        if (!operation.operationData) {
          console.error(`Missing operationData for operation ${operation.id}`);
          continue;
        }
        const result = await checkVideoStatus(operation.operationData);

        if (result.status === 'completed' && result.videoUrl) {
          // Update operation in storage and state
          const updatedOperation: VideoOperation = {
            ...operation,
            status: 'completed',
            videoUrl: result.videoUrl,
          };

          videoOperationsStorage.update(operation.id, {
            status: 'completed',
            videoUrl: result.videoUrl,
          });

          setActiveOperations(prev => {
            const updated = new Map(prev);
            updated.set(operation.id, updatedOperation);
            return updated;
          });

          // Update video history
          setVideoHistory(prev =>
            prev.map(video =>
              video.id === operation.id
                ? {
                    ...video,
                    videoUrl: result.videoUrl,
                    operationName: operation.operationName,
                    isLoading: false,
                  }
                : video
            )
          );
        } else if (result.status === 'failed') {
          // Handle failed operation
          const updatedOperation: VideoOperation = {
            ...operation,
            status: 'failed',
            error: result.error || 'Video generation failed',
          };

          videoOperationsStorage.update(operation.id, {
            status: 'failed',
            error: result.error || 'Video generation failed',
          });

          setActiveOperations(prev => {
            const updated = new Map(prev);
            updated.set(operation.id, updatedOperation);
            return updated;
          });

          // Update video history with error
          setVideoHistory(prev =>
            prev.map(video =>
              video.id === operation.id
                ? {
                    ...video,
                    isLoading: false,
                    error: result.error || 'Video generation failed',
                  }
                : video
            )
          );
        } else if (result.status === 'processing') {
          // Update status to processing if needed
          if (operation.status !== 'processing') {
            const updatedOperation: VideoOperation = {
              ...operation,
              status: 'processing',
            };

            videoOperationsStorage.update(operation.id, { status: 'processing' });

            setActiveOperations(prev => {
              const updated = new Map(prev);
              updated.set(operation.id, updatedOperation);
              return updated;
            });
          }
        }
      } catch (error) {
        console.error(`Failed to check status for operation ${operation.id}:`, error);
      }
    }
  }, [activeOperations]);

  // Start polling when there are active operations
  useEffect(() => {
    const pendingOps = Array.from(activeOperations.values()).filter(
      op => op.status === 'pending' || op.status === 'processing'
    );

    if (pendingOps.length > 0 && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(pollOperations, 10000); // Poll every 10 seconds
    } else if (pendingOps.length === 0 && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [activeOperations, pollOperations]);

  // Recover operations on mount
  useEffect(() => {
    const savedOperations = videoOperationsStorage.getPending();

    if (savedOperations.length > 0) {
      const operationsMap = new Map<string, VideoOperation>();
      const historyVideos: GeneratedVideo[] = [];

      savedOperations.forEach(operation => {
        operationsMap.set(operation.id, operation);

        // Add to video history as loading
        historyVideos.push({
          id: operation.id,
          prompt: operation.prompt,
          model: operation.model,
          durationSeconds: operation.durationSeconds,
          timestamp: operation.timestamp,
          isLoading: operation.status !== 'completed' && operation.status !== 'failed',
          videoUrl: operation.videoUrl,
          error: operation.error,
          operationName: operation.operationName,
        });
      });

      setActiveOperations(operationsMap);
      setVideoHistory(prev => {
        // Avoid duplicating entries by id
        const existingIds = new Set(prev.map(v => v.id));
        const merged = [...historyVideos.filter(v => !existingIds.has(v.id)), ...prev];
        return merged;
      });
    }
  }, []);

  /**
   * Handles form submission for video generation
   * - Initiates async video generation and starts polling
   */
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());

      // Require text prompt
      if (!hasText) {
        return;
      }

      const prompt = message.text?.trim() || '';

      // Generate unique ID for this request
      const videoId = `vid_${Date.now()}`;

      // Create placeholder entry immediately for optimistic UI
      const placeholderVideo: GeneratedVideo = {
        id: videoId,
        prompt,
        model: model,
        durationSeconds,
        timestamp: new Date(),
        isLoading: true,
      };

      // Add to history immediately for responsive UI
      setVideoHistory(prev => [placeholderVideo, ...prev]);

      try {
        const result = await generateVideo({
          prompt,
          model,
          durationSeconds,
        });

        if (result.status === 'completed' && result.videoUrl) {
          // Video is already complete (unlikely but possible)
          setVideoHistory(prev =>
            prev.map(vid =>
              vid.id === videoId
                ? {
                    ...vid,
                    videoUrl: result.videoUrl,
                    operationName: result.operationName,
                    isLoading: false,
                  }
                : vid
            )
          );
        } else if (result.status === 'failed') {
          // Handle immediate failure
          setVideoHistory(prev =>
            prev.map(vid =>
              vid.id === videoId
                ? {
                    ...vid,
                    isLoading: false,
                    error: result.error || 'Video generation failed',
                  }
                : vid
            )
          );
        } else {
          // Create operation for polling
          const operation: VideoOperation = {
            id: videoId,
            operationName: result.operationName,
            prompt,
            model,
            durationSeconds,
            timestamp: new Date(),
            status: result.status,
            operationData: result.operationData,
          };

          // Store operation in localStorage and state
          videoOperationsStorage.store(operation);
          setActiveOperations(prev => {
            const updated = new Map(prev);
            updated.set(videoId, operation);
            return updated;
          });

          // Update video history with operation name
          setVideoHistory(prev =>
            prev.map(vid =>
              vid.id === videoId
                ? {
                    ...vid,
                    operationName: result.operationName,
                  }
                : vid
            )
          );
        }
      } catch (error) {
        console.error('Error generating video:', error);

        // Update the placeholder entry with error state
        setVideoHistory(prev =>
          prev.map(vid =>
            vid.id === videoId
              ? {
                  ...vid,
                  isLoading: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Failed to generate video',
                }
              : vid
          )
        );
      }
    },
    [model, durationSeconds]
  );

  return (
    <div className="space-y-6">
      <PromptInput
        ref={promptInputRef}
        onSubmit={handleSubmit}
        className="relative"
      >
        <PromptInputBody>
          <PromptInputTextarea placeholder="Describe the video you want to generate..." />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputModelSelect
              onValueChange={value => {
                setModel(value as VideoModelOption);
              }}
              value={model}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map(model => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            <div className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <Label
                htmlFor="duration-slider"
                className="text-sm font-medium whitespace-nowrap"
              >
                Duration: {durationSeconds}s
              </Label>
              <Slider
                id="duration-slider"
                value={[durationSeconds]}
                onValueChange={([value]) => setDurationSeconds(value)}
                min={1}
                max={8}
                step={1}
                className="w-20"
              />
            </div>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearForm}
              className="h-9 w-9 p-0"
            >
              <X size={16} />
            </Button>
            <PromptInputSubmit />
          </div>
        </PromptInputToolbar>
      </PromptInput>

      <VideoHistory
        videoHistory={videoHistory}
        onAppendVideo={video => setVideoHistory(prev => [video, ...prev])}
        onUpdateVideo={(id, updates) =>
          setVideoHistory(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)))
        }
      />
    </div>
  );
}
