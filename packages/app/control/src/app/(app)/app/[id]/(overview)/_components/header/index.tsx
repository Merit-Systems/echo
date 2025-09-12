'use client';

import React, { useMemo } from 'react';

import Link from 'next/link';

import { Code, Plus, Lock, Zap } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { OverallAppStats, LoadingOverallAppStats } from './stats';
import { VisibilityButton } from './visibility-button';

import { cn } from '@/lib/utils';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const HeaderCard: React.FC<Props> = ({ appId }) => {
  const [app] = api.apps.app.get.useSuspenseQuery({ appId: appId });
  const [isOwner] = api.apps.app.isOwner.useSuspenseQuery(appId);
  const [githubLink] = api.apps.app.githubLink.get.useSuspenseQuery(appId);
  const [numTokens] = api.apps.app.getNumTokens.useSuspenseQuery({ appId });
  const [numTransactions] = api.apps.app.transactions.count.useSuspenseQuery({
    appId,
  });

  const isSetupComplete = useMemo(() => {
    return (
      githubLink !== null &&
      numTokens > 0 &&
      numTransactions > 0 &&
      app.description !== null &&
      app.profilePictureUrl !== null
    );
  }, [
    githubLink,
    numTokens,
    numTransactions,
    app.description,
    app.profilePictureUrl,
  ]);

  return (
    <Card className={cn('relative mt-10 md:mt-12 mb-12')}>
      <div className="absolute top-0 left-4 -translate-y-1/2 size-16 md:size-20 flex items-center justify-center">
        <UserAvatar
          src={app.profilePictureUrl ?? undefined}
          className="size-full"
          fallback={<Code className="size-8" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7">
        <div className="flex flex-col gap-4 p-4 pt-12 md:pt-14 col-span-5">
          <div className="">
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <p
              className={
                app.description
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/40'
              }
            >
              {app.description ?? 'No description'}
            </p>
          </div>
          {isSetupComplete && (
            <div className="flex items-center gap-2">
              {app.homepageUrl ? (
                <a href={app.homepageUrl} target="_blank">
                  <Button variant="turbo">
                    <Zap className="size-4" />
                    Use App
                  </Button>
                </a>
              ) : isOwner ? (
                <Link href={`/app/${appId}/settings/general`}>
                  <Button variant="turbo">
                    <Plus className="size-4" />
                    Add Homepage URL
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled>
                  No App Url
                </Button>
              )}
              {isOwner && <VisibilityButton appId={appId} />}
            </div>
          )}
        </div>
        <div className="col-span-2 relative rounded-b rounded-t-none md:rounded-bl-none md:rounded-r-lg overflow-hidden">
          <OverallAppStats appId={appId} />
          {!isSetupComplete && (
            <div className="absolute inset-0 top-[1px] md:top-0 md:left-[1px] backdrop-blur-xs flex md:flex-col items-center justify-center text-muted-foreground gap-2">
              <Lock className="size-4 md:size-8" />
              <p className="text-sm max-w-[200px] text-center">
                {isOwner
                  ? 'Complete setup to unlock'
                  : 'The owner of this app has not completed setup'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const LoadingHeaderCard = () => {
  return (
    <Card className={cn('relative mt-10 md:mt-12 mb-12')}>
      <div className="absolute top-0 left-4 -translate-y-1/2 size-16 md:size-20 flex items-center justify-center">
        <UserAvatar
          src={undefined}
          className="size-full"
          fallback={<Code className="size-8" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
        <div className="flex flex-col gap-4 p-4 pt-12 md:pt-14 col-span-5">
          <div className="">
            <Skeleton className="w-36 h-[30px] my-[3px]" />
            <Skeleton className="w-64 h-[16px] my-[4px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9" />
          </div>
        </div>
        <div className="col-span-2">
          <LoadingOverallAppStats />
        </div>
      </div>
    </Card>
  );
};
