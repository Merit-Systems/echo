'use client';

import { api } from '@/trpc/client';

import { GenerateApiKey as GenerateApiKeyComponent } from '@/app/(app)/_components/keys/generate-key';

interface Props {
  appId: string;
}

export const GenerateKeyForm: React.FC<Props> = ({ appId }) => {
  const { data: member, isLoading } = api.apps.app.memberships.get.useQuery({
    appId,
  });

  const utils = api.useUtils();

  const {
    mutateAsync: generateApiKey,
    data: apiKey,
    isPending: isGenerating,
  } = api.user.apiKeys.create.useMutation({
    onSuccess: () => {
      // Invalidate API key count query to immediately update the dashboard
      // This allows the dashboard to unlock as soon as an API key is created
      void utils.user.apiKeys.count.invalidate({ appId });
      void utils.user.apiKeys.list.invalidate();
    },
  });

  const { mutateAsync: createMembership, isPending: isJoining } =
    api.apps.app.memberships.create.useMutation();

  const handleGenerateApiKey = async (name?: string) => {
    if (isLoading) throw new Error('Loading...');
    if (!member) {
      await createMembership({ appId });
    }
    return (await generateApiKey({ echoAppId: appId, name })).key;
  };

  return (
    <GenerateApiKeyComponent
      apiKey={apiKey?.key}
      isPending={isGenerating || isJoining}
      generateApiKey={handleGenerateApiKey}
      disabled={isLoading}
    />
  );
};
