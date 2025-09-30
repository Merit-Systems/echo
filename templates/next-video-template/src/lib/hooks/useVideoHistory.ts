import type { GeneratedVideo } from '@/lib/types';
import { videoHistoryStorage } from '@/lib/video-history';
import { videoOperationsStorage } from '@/lib/video-operations';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVideoHistory() {
  const [videoHistory, setVideoHistory] = useState<GeneratedVideo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isFirstRender = useRef(true);

  // Load existing history on mount
  useEffect(() => {
    const existing = videoHistoryStorage.getAll();
    setVideoHistory(existing);
    setIsInitialized(true);
  }, []);

  // Persist history on change (skip first render to avoid overwriting during load)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    videoHistoryStorage.setAll(videoHistory);
  }, [videoHistory]);

  // Recover pending operations on mount
  useEffect(() => {
    if (!isInitialized) return;

    const savedOperations = videoOperationsStorage.getPending();
    if (savedOperations.length === 0) return;

    const historyVideos: GeneratedVideo[] = savedOperations.map(operation => ({
      id: operation.id,
      prompt: operation.prompt,
      model: operation.model,
      durationSeconds: operation.durationSeconds,
      timestamp: operation.timestamp,
      isLoading: !operation.operation.done,
      videoUrl: operation.videoUrl,
      error: operation.error,
      operationName: operation.operation.name,
    }));

    setVideoHistory(prev => {
      const existingIds = new Set(prev.map(v => v.id));
      const merged = [
        ...historyVideos.filter(v => !existingIds.has(v.id)),
        ...prev,
      ];
      return merged;
    });
  }, [isInitialized]);

  const addVideo = useCallback((video: GeneratedVideo) => {
    setVideoHistory(prev => [video, ...prev]);
  }, []);

  const updateVideo = useCallback(
    (id: string, updates: Partial<GeneratedVideo>) => {
      setVideoHistory(prev =>
        prev.map(v => (v.id === id ? { ...v, ...updates } : v))
      );
    },
    []
  );

  const removeVideo = useCallback((id: string) => {
    setVideoHistory(prev => prev.filter(v => v.id !== id));
    videoHistoryStorage.remove(id);
    videoOperationsStorage.remove(id);
  }, []);

  return {
    videoHistory,
    isInitialized,
    addVideo,
    updateVideo,
    removeVideo,
  };
}
