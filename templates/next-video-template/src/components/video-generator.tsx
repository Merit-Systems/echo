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
} from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useVideoGeneration } from '@/lib/hooks/useVideoGeneration';
import { useVideoHistory } from '@/lib/hooks/useVideoHistory';
import { useVideoOperations } from '@/lib/hooks/useVideoOperations';
import type { VideoModelConfig, VideoModelOption } from '@/lib/types';
import { Settings, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { FileInputManager } from './FileInputManager';
import { VideoHistory } from './video-history';

const models: VideoModelConfig[] = [
  { id: 'veo-3.0-fast-generate-preview', name: 'Veo 3 Fast' },
  { id: 'veo-3.0-generate-preview', name: 'Veo 3' },
];

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
  const [model, setModel] = useState<VideoModelOption>(
    'veo-3.0-fast-generate-preview'
  );
  const [durationSeconds, setDurationSeconds] = useState<4 | 6 | 8>(4);
  const [generateAudio, setGenerateAudio] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState(false);
  const promptInputRef = useRef<HTMLFormElement>(null);

  const allowedDurations = [4, 6, 8] as const;

  const { videoHistory, isInitialized, addVideo, updateVideo, removeVideo } =
    useVideoHistory();

  useVideoOperations({
    isInitialized,
    onOperationComplete: updateVideo,
  });

  const { handleSubmit: generateVideo } = useVideoGeneration({
    model,
    durationSeconds,
    generateAudio,
    onVideoAdded: addVideo,
    onVideoUpdated: updateVideo,
  });

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      await generateVideo(message);
      setHasContent(false);
    },
    [generateVideo]
  );

  const clearForm = useCallback(() => {
    promptInputRef.current?.reset();
    window.__promptInputActions?.clear();
    setHasContent(false);
  }, []);

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
            {attachment => {
              setHasContent(true);
              return <PromptInputAttachment data={attachment} />;
            }}
          </PromptInputAttachments>
          <PromptInputTextarea
            placeholder="Describe the video you want to generate, or attach an image..."
            onChange={e => setHasContent(e.target.value.length > 0 || false)}
          />
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
              onValueChange={value => setModel(value as VideoModelOption)}
              value={model}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map(m => (
                  <PromptInputModelSelectItem key={m.id} value={m.id}>
                    {m.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            {/* Mobile: Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Video Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <div className="flex items-center justify-between w-full">
                    <Label
                      htmlFor="audio-toggle-mobile"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Audio
                    </Label>
                    <Switch
                      id="audio-toggle-mobile"
                      checked={generateAudio}
                      onCheckedChange={setGenerateAudio}
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <div className="w-full space-y-2">
                    <Label
                      htmlFor="duration-slider-mobile"
                      className="text-sm font-medium pb-2"
                    >
                      Duration: {durationSeconds}s
                    </Label>
                    <Slider
                      id="duration-slider-mobile"
                      value={[allowedDurations.indexOf(durationSeconds)]}
                      onValueChange={([index]) =>
                        setDurationSeconds(allowedDurations[index])
                      }
                      min={0}
                      max={allowedDurations.length - 1}
                      step={1}
                      className="w-full py-2"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop: Inline Settings */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <Label
                htmlFor="audio-toggle"
                className="text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                Audio
              </Label>
              <Switch
                id="audio-toggle"
                checked={generateAudio}
                onCheckedChange={setGenerateAudio}
              />
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <Label
                htmlFor="duration-slider"
                className="text-sm font-medium whitespace-nowrap"
              >
                Duration: {durationSeconds}s
              </Label>
              <Slider
                id="duration-slider"
                value={[allowedDurations.indexOf(durationSeconds)]}
                onValueChange={([index]) =>
                  setDurationSeconds(allowedDurations[index])
                }
                min={0}
                max={allowedDurations.length - 1}
                step={1}
                className="w-20"
              />
            </div>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            {hasContent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearForm}
                className="h-9 w-9 p-0"
                title="Clear input"
              >
                <X size={16} />
              </Button>
            )}
            <PromptInputSubmit />
          </div>
        </PromptInputToolbar>
      </PromptInput>

      <VideoHistory videoHistory={videoHistory} onRemoveVideo={removeVideo} />
    </div>
  );
}
