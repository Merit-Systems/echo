'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { GeneratedVideo } from '@/lib/types';
import { Copy, Download } from 'lucide-react';
import { useCallback } from 'react';

interface VideoDetailsDialogProps {
  video: GeneratedVideo | null;
  onClose: () => void;
}

export function VideoDetailsDialog({
  video,
  onClose,
}: VideoDetailsDialogProps) {
  const handleDownload = useCallback(() => {
    if (!video?.videoUrl) return;

    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `video_${video.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [video]);

  const handleCopyUrl = useCallback(async () => {
    if (!video?.videoUrl) return;

    try {
      await navigator.clipboard.writeText(video.videoUrl);
    } catch (error) {
      console.error('Failed to copy video URL:', error);
    }
  }, [video]);

  if (!video) return null;

  const isActionable = Boolean(
    video.videoUrl && !video.isLoading && !video.error
  );

  return (
    <Dialog open={Boolean(video)} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Video Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Display */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {video.isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-sm text-gray-600">
                  Generating {video.durationSeconds}s video...
                </div>
              </div>
            ) : video.error ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="text-red-500 text-lg">⚠️ Generation Failed</div>
                <div className="text-sm text-gray-600 text-center max-w-md">
                  {video.error}
                </div>
              </div>
            ) : video.videoUrl ? (
              <video
                src={video.videoUrl}
                controls
                className="w-full h-full object-cover"
                autoPlay
                loop
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No video available
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Prompt</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {video.prompt}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Model</h4>
                <Badge variant="secondary">{video.model}</Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                <p className="text-gray-700">{video.durationSeconds}s</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Generated</h4>
                <p className="text-gray-700">
                  {video.timestamp.toLocaleDateString()}{' '}
                  {video.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {video.operationName && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Operation</h4>
                  <p className="text-xs text-gray-500 font-mono">
                    {video.operationName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isActionable && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button onClick={handleCopyUrl} variant="outline" size="sm">
                <Copy size={16} className="mr-2" />
                Copy URL
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
