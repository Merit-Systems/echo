import { Skeleton } from '@/components/ui/skeleton';
import { CopyButton } from '@/components/ui/copy-button';

import { FormCard } from '../../_components/form/card';

export const LoadingGeneralAppSettings = () => {
  return (
    <div className="flex flex-col gap-6">
      <FormCard
        title="App ID"
        description="Use this ID when authenticating users in your app."
        hideSaveButton
      >
        <div className="flex items-center w-full border border-primary rounded-md overflow-hidden pl-2 pr-1 py-1 bg-muted">
          <div className="flex-1">
            <Skeleton className="h-5 w-64" />
          </div>
          <CopyButton text={''} />
        </div>
      </FormCard>
      <FormCard
        title="Name"
        description="The public-facing name of your app. This is shown to users when they are connecting to your app."
        isLoading
      >
        <Skeleton className="h-9 w-full" />
      </FormCard>

      <FormCard
        title="Description"
        description="The description of your app. This is shown to users when they are connecting to your app."
        isLoading
      >
        <Skeleton className="h-16 w-full" />
      </FormCard>

      <FormCard
        title="Profile Picture"
        description="The profile picture of your app. This is shown to users when they are connecting to your app."
        isLoading
      >
        <Skeleton className="size-24" />
      </FormCard>

      <FormCard
        title="Deployed App URL"
        description="The URL of your deployed app. This will aid in the discovery of your app."
        isLoading
      >
        <Skeleton className="h-9 w-full" />
      </FormCard>
    </div>
  );
};
