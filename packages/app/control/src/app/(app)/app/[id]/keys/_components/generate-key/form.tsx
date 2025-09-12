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

  const {
    mutateAsync: generateApiKey,
    data: apiKey,
    isPending: isGenerating,
  } = api.user.apiKeys.create.useMutation();

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
