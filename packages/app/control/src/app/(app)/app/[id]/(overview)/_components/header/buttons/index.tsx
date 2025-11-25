import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { ViewerButtons } from './viewer';
import { OwnerButtons } from './owner';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const HeaderButtons: React.FC<Props> = ({ appId }) => {
  const { data: isOwner, isLoading } = api.apps.app.isOwner.useQuery(appId);

  if (isLoading || isOwner === undefined) {
    return <LoadingHeaderButtons />;
  }

  return (
    <div className="flex items-center gap-2">
      {isOwner ? (
        <OwnerButtons appId={appId} />
      ) : (
        <ViewerButtons appId={appId} />
      )}
    </div>
  );
};

export const LoadingHeaderButtons = () => {
  return <Skeleton className="w-24 h-9" />;
};
