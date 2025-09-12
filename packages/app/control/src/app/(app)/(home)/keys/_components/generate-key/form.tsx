'use client';

import { useState } from 'react';

import { Label } from '@/components/ui/label';

import { GenerateApiKey } from '../../../../_components/keys/generate-key';

import { api } from '@/trpc/client';
import { AppSelect } from '@/app/(app)/_components/apps/select';

export const GenerateKeyWithSelect = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    mutateAsync: generateApiKey,
    isPending: isGenerating,
    data: apiKey,
  } = api.user.apiKeys.create.useMutation({
    onSuccess: () => {
      setIsCompleted(true);
    },
  });

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      <div className="flex flex-col gap-1 w-full">
        <Label
          htmlFor="app-select"
          className="block text-sm font-medium text-card-foreground"
        >
          Select Echo App <span className="text-red-500">*</span>
        </Label>
        <AppSelect
          selectedAppId={selectedAppId}
          setSelectedAppId={appId => {
            if (appId) {
              setSelectedAppId(appId);
            }
          }}
          disabled={isCompleted}
          className="w-full"
          placeholder="Choose an App"
          role="member"
        />
        <p className="text-xs text-muted-foreground">
          Your API key will only be valid for this app.
        </p>
      </div>
      <GenerateApiKey
        generateApiKey={async name =>
          (await generateApiKey({ echoAppId: selectedAppId, name })).key
        }
        isPending={isGenerating}
        apiKey={apiKey?.key}
        disabled={!selectedAppId}
      />
    </div>
  );
};
