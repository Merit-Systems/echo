'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GeneratedVideo, VideoResponse } from '@/lib/types';
import { Copy, Download, Play } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VideoDetailsDialog } from './video-details-dialog';
import { Input } from '@/components/ui/input';

/**
 * Self-contained loading timer component
 * Only this component re-renders every 100ms, preventing parent re-renders
 */
const LoadingTimer = React.memo(function LoadingTimer({
  startTime,
}: {
  startTime: Date;
}) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(timer);
  }, []);

  const elapsed = (Date.now() - startTime.getTime()) / 1000;
  return (
    <div className="text-xs text-gray-500 font-mono">{elapsed.toFixed(1)}s</div>
  );
});

interface VideoHistoryItemProps {
  video: GeneratedVideo;
  onVideoClick: (video: GeneratedVideo) => void;
}

const VideoHistoryItem = React.memo(function VideoHistoryItem({
  video,
  onVideoClick,
}: VideoHistoryItemProps) {
  const handleVideoClick = useCallback(() => {
    onVideoClick(video);
  }, [video, onVideoClick]);

  const handleDownload = useCallback(() => {
    if (!video.videoUrl) return;

    // Always proxy through server to add auth and rewrite host
    const proxied = `/api/proxy-video?uri=${encodeURIComponent(
      video.videoUrl
    )}&download=1`;

    const link = document.createElement('a');
    link.href = proxied;
    link.download = `video_${video.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [video]);

  const handleCopy = useCallback(async () => {
    if (!video.videoUrl) return;

    try {
      await navigator.clipboard.writeText(video.videoUrl);
    } catch (error) {
      console.error('Failed to copy video URL:', error);
    }
  }, [video]);

  const isActionable = Boolean(
    video.videoUrl && !video.isLoading && !video.error
  );

  return (
    <div
      onClick={handleVideoClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleVideoClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for video: ${video.prompt.slice(0, 50)}${video.prompt.length > 50 ? '...' : ''}`}
      className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group cursor-pointer hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all animate-in fade-in slide-in-from-left-4 duration-500"
    >
      {video.isLoading ? (
        <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <LoadingTimer startTime={video.timestamp} />
          <div className="text-xs text-gray-600 text-center">
            Generating {video.durationSeconds}s video...
          </div>
        </div>
      ) : video.error ? (
        <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
          <div className="text-red-500 text-sm">⚠️ Failed</div>
          <div className="text-xs text-gray-500 text-center">{video.error}</div>
        </div>
      ) : video.videoUrl ? (
        <>
          <video
            src={video.videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            preload="metadata"
            poster=""
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Play size={24} className="text-white" />
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleCopy();
              }}
              aria-label="Copy video URL to clipboard"
              title="Copy video URL"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-blue-500"
              disabled={!isActionable}
            >
              <Copy size={14} />
            </Button>
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleDownload();
              }}
              aria-label="Download video"
              title="Download video"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-blue-500"
              disabled={!isActionable}
            >
              <Download size={14} />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.durationSeconds}s
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No video
        </div>
      )}
    </div>
  );
});

interface VideoHistoryProps {
  videoHistory: GeneratedVideo[];
  onAppendVideo?: (video: GeneratedVideo) => void;
  onUpdateVideo?: (id: string, updates: Partial<GeneratedVideo>) => void;
}

export const VideoHistory = React.memo(function VideoHistory({
  videoHistory,
  onAppendVideo,
  onUpdateVideo,
}: VideoHistoryProps) {
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(
    null
  );
  const [opName, setOpName] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleVideoClick = useCallback((video: GeneratedVideo) => {
    setSelectedVideo(video);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const canRestore = useMemo(() => opName.trim().length > 0, [opName]);

  const handleRestore = useCallback(async () => {
    if (!canRestore) return;
    setIsRestoring(true);
    try {
      const res = await fetch('/api/check-video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName.trim() }),
      });
      const data: VideoResponse = await res.json();
      if (res.ok && data.status === 'completed' && data.videoUrl) {
        const restored: GeneratedVideo = {
          id: `restored_${Date.now()}`,
          prompt: '(restored from operation)',
          model: 'veo-3',
          durationSeconds: 0,
          timestamp: new Date(),
          isLoading: false,
          videoUrl: data.videoUrl,
          operationName: opName.trim(),
        };
        onAppendVideo?.(restored);
        setOpName('');
      } else if (data.status === 'processing') {
        // Add placeholder and let polling (if any) handle update; otherwise just show loading card
        const placeholder: GeneratedVideo = {
          id: `restoring_${Date.now()}`,
          prompt: '(restoring) ' + opName.trim(),
          model: 'veo-3',
          durationSeconds: 0,
          timestamp: new Date(),
          isLoading: true,
          operationName: opName.trim(),
        };
        onAppendVideo?.(placeholder);
        setOpName('');
      }
    } catch (e) {
      console.error('Failed to restore operation by name', e);
    } finally {
      setIsRestoring(false);
    }
  }, [canRestore, opName, onAppendVideo]);

  if (videoHistory.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Generated Videos</h3>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Paste operationName to restore"
            value={opName}
            onChange={e => setOpName(e.target.value)}
          />
          <Button onClick={handleRestore} disabled={!canRestore || isRestoring}>
            {isRestoring ? 'Restoring…' : 'Restore'}
          </Button>
        </div>
        <div className="text-sm text-gray-500">No videos yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Generated Videos</h3>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Paste operationName to restore"
          value={opName}
          onChange={e => setOpName(e.target.value)}
        />
        <Button onClick={handleRestore} disabled={!canRestore || isRestoring}>
          {isRestoring ? 'Restoring…' : 'Restore'}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-300 ease-out">
        {videoHistory.map(video => (
          <VideoHistoryItem
            key={video.id}
            video={video}
            onVideoClick={handleVideoClick}
          />
        ))}
      </div>

      <VideoDetailsDialog video={selectedVideo} onClose={handleCloseDialog} />
    </div>
  );
});
