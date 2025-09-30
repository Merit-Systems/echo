'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getModelDisplayName,
  handleImageCopy,
  handleImageDownload,
  handleImageToFile,
  isImageActionable,
} from '@/lib/image-actions';
import type { GeneratedImage, ImageActionHandlers } from '@/lib/types';
import { Copy, Download, Edit } from 'lucide-react';
import NextImage from 'next/image';
import { useCallback } from 'react';

interface ImageDetailsDialogProps extends ImageActionHandlers {
  image: GeneratedImage | null;
  onClose: () => void;
}

export function ImageDetailsDialog({
  image,
  onClose,
  onAddToInput,
}: ImageDetailsDialogProps) {
  const handleAddToInput = useCallback(() => {
    if (!image || !isImageActionable(image)) return;

    const file = handleImageToFile(image.imageUrl!, image.id);
    onAddToInput([file]);
    onClose();
  }, [image, onAddToInput, onClose]);

  const handleDownload = useCallback(() => {
    if (!image || !isImageActionable(image)) return;

    handleImageDownload(image.imageUrl!, image.id);
  }, [image]);

  const handleCopy = useCallback(async () => {
    if (!image || !isImageActionable(image)) return;
    await handleImageCopy(image.imageUrl!);
  }, [image]);

  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {image.isEdit ? 'Edited Image' : 'Generated Image'}
          </DialogTitle>
          <DialogDescription>
            View and interact with the generated image and its details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Full size image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {image.error ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 p-6">
                <div className="text-red-500 text-lg">⚠️ Generation failed</div>
                <div className="text-sm text-gray-500 text-center">
                  {image.error}
                </div>
              </div>
            ) : image.imageUrl ? (
              <NextImage
                src={image.imageUrl}
                alt={image.prompt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-900">
              &quot;{image.prompt}&quot;
            </p>
            <div className="text-sm text-gray-500">
              {getModelDisplayName(image.model)} •{' '}
              {image.timestamp.toLocaleString()} •{' '}
              {image.isEdit ? 'Edited Image' : 'Generated Image'}
            </div>

            {/* Attachment previews */}
            {image.attachments && image.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Source Images
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {image.attachments.map((dataUrl, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 rounded border overflow-hidden bg-gray-100"
                    >
                      <NextImage
                        src={dataUrl}
                        alt={`Source image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {image.attachments.length} source image
                  {image.attachments.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleCopy}
              disabled={!isImageActionable(image)}
              className="flex items-center gap-2 justify-center"
              aria-label="Copy image to clipboard"
            >
              <Copy size={16} />
              Copy
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!isImageActionable(image)}
              className="flex items-center gap-2 justify-center"
              aria-label="Download image"
            >
              <Download size={16} />
              Download
            </Button>
            <Button
              onClick={handleAddToInput}
              disabled={!isImageActionable(image)}
              className="flex items-center gap-2 justify-center"
              aria-label="Edit this image"
            >
              <Edit size={16} />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
