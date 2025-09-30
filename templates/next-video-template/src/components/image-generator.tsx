'use client';

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
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
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fileToDataUrl } from '@/lib/image-utils';
import type {
  EditImageRequest,
  GeneratedImage,
  GenerateImageRequest,
  ImageResponse,
  ModelConfig,
  ModelOption,
} from '@/lib/types';
import { ImageHistory } from './image-history';

declare global {
  interface Window {
    __promptInputActions?: {
      addFiles: (files: File[] | FileList) => void;
      clear: () => void;
    };
  }
}

/**
 * Available AI models for image generation
 * These models integrate with the Echo SDK to provide different image generation capabilities
 */
const models: ModelConfig[] = [
  { id: 'openai', name: 'GPT Image' },
  { id: 'gemini', name: 'Gemini Flash Image' },
];

/**
 * API functions for image generation and editing
 * These functions communicate with the Echo SDK backend routes
 */

// ===== API FUNCTIONS =====
async function generateImage(
  request: GenerateImageRequest
): Promise<ImageResponse> {
  const response = await fetch('/api/generate-image', {
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

async function editImage(request: EditImageRequest): Promise<ImageResponse> {
  const response = await fetch('/api/edit-image', {
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

/**
 * Main ImageGenerator component
 *
 * This component demonstrates how to integrate Echo SDK with AI image generation:
 * - Uses PromptInput for unified input handling with attachments
 * - Supports both text-to-image generation and image editing
 * - Maintains history of all generated/edited images
 * - Provides seamless model switching between OpenAI and Gemini
 */
export default function ImageGenerator() {
  const [model, setModel] = useState<ModelOption>('gemini');
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const promptInputRef = useRef<HTMLFormElement>(null);

  // Handle adding files to the input from external triggers (like from image history)
  const handleAddToInput = useCallback((files: File[]) => {
    const actions = window.__promptInputActions;
    if (actions) {
      actions.addFiles(files);
    }
  }, []);

  const clearForm = useCallback(() => {
    promptInputRef.current?.reset();
    const actions = window.__promptInputActions;
    if (actions) {
      actions.clear();
    }
  }, []);

  // Component to bridge PromptInput context with external file operations
  function FileInputManager() {
    const attachments = usePromptInputAttachments();

    // Store reference to attachment actions for external use
    useEffect(() => {
      window.__promptInputActions = {
        addFiles: attachments.add,
        clear: attachments.clear,
      };

      return () => {
        delete window.__promptInputActions;
      };
    }, [attachments]);

    return null;
  }

  /**
   * Handles form submission for both image generation and editing
   * - Text-only: generates new image using selected model
   * - Text + attachments: edits uploaded images using Gemini
   */
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      // Require either text prompt or attachments
      if (!(hasText || hasAttachments)) {
        return;
      }

      const isEdit = hasAttachments;
      const prompt = message.text?.trim() || '';

      // Generate unique ID for this request
      const imageId = `img_${Date.now()}`;

      // Convert attachment blob URLs to permanent data URLs for persistent display
      const attachmentDataUrls =
        message.files && message.files.length > 0
          ? await Promise.all(
              message.files
                .filter(f => f.mediaType?.startsWith('image/'))
                .map(async f => {
                  try {
                    const response = await fetch(f.url);
                    const blob = await response.blob();
                    return await fileToDataUrl(
                      new File([blob], f.filename || 'image', {
                        type: f.mediaType,
                      })
                    );
                  } catch (error) {
                    console.error(
                      'Failed to convert attachment to data URL:',
                      error
                    );
                    return f.url; // fallback
                  }
                })
            )
          : undefined;

      // Create placeholder entry immediately for optimistic UI
      const placeholderImage: GeneratedImage = {
        id: imageId,
        prompt,
        model: model,
        timestamp: new Date(),
        attachments: attachmentDataUrls,
        isEdit,
        isLoading: true,
      };

      // Add to history immediately for responsive UI
      setImageHistory(prev => [placeholderImage, ...prev]);

      try {
        let imageUrl: ImageResponse['imageUrl'];

        if (isEdit) {
          const imageFiles =
            message.files?.filter(
              file =>
                file.mediaType?.startsWith('image/') || file.type === 'file'
            ) || [];

          if (imageFiles.length === 0) {
            throw new Error('No image files found in attachments');
          }

          try {
            const imageUrls = await Promise.all(
              imageFiles.map(async imageFile => {
                // Convert blob URL to data URL for API
                const response = await fetch(imageFile.url);
                const blob = await response.blob();
                return await fileToDataUrl(
                  new File([blob], 'image', { type: imageFile.mediaType })
                );
              })
            );

            const result = await editImage({
              prompt,
              imageUrls,
              provider: model,
            });
            imageUrl = result.imageUrl;
          } catch (error) {
            console.error('Error processing image files:', error);
            throw error;
          }
        } else {
          const result = await generateImage({ prompt, model });
          imageUrl = result.imageUrl;
        }

        // Update the existing placeholder entry with the result
        setImageHistory(prev =>
          prev.map(img =>
            img.id === imageId ? { ...img, imageUrl, isLoading: false } : img
          )
        );
      } catch (error) {
        console.error(
          `Error ${isEdit ? 'editing' : 'generating'} image:`,
          error
        );

        // Update the placeholder entry with error state
        setImageHistory(prev =>
          prev.map(img =>
            img.id === imageId
              ? {
                  ...img,
                  isLoading: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Failed to generate image',
                }
              : img
          )
        );
      }
    },
    [model]
  );

  return (
    <div className="space-y-6">
      <PromptInput
        ref={promptInputRef}
        onSubmit={handleSubmit}
        className="relative"
        globalDrop
        multiple
        accept="image/*"
      >
        <FileInputManager />
        <PromptInputBody>
          <PromptInputAttachments>
            {attachment => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea placeholder="Describe the image you want to generate, or attach an image and describe how to edit it..." />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputModelSelect
              onValueChange={value => {
                setModel(value as ModelOption);
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

      <ImageHistory
        imageHistory={imageHistory}
        onAddToInput={handleAddToInput}
      />
    </div>
  );
}
