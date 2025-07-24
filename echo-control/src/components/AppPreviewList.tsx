'use client';

import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import AppCard from './AppCard';
import { Skeleton } from './skeleton';
import {
  CustomerEchoApp,
  PublicEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';

interface AppPreviewListProps {
  title: string;
  description: string;
  apps: CustomerEchoApp[] | PublicEchoApp[] | OwnerEchoApp[];
  href: string;
  loading: boolean;
  error?: string | null;
  maxApps?: number;
  emptyStateMessage?: string;
}

export const AppPreviewList: React.FC<AppPreviewListProps> = ({
  title,
  description,
  apps,
  href,
  loading,
  error,
  maxApps = 3,
  emptyStateMessage = 'No apps found.',
}) => {
  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-4">
          {[...Array(maxApps)].map((_, index) => (
            <div key={index}>
              <Skeleton className="h-[100px] w-full" />
              {index < maxApps - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Link href={href}>
            <h2 className="text-2xl font-bold mb-2 hover:underline">{title}</h2>
          </Link>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Link href={href}>
            <h2 className="text-2xl font-bold mb-2 hover:underline">{title}</h2>
          </Link>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
        </div>
      </div>
    );
  }

  const appsToShow = apps.slice(0, maxApps);

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link href={href}>
          <h2 className="text-2xl font-bold mb-2 hover:underline">{title}</h2>
        </Link>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        {appsToShow.map((app, index) => {
          return (
            <div key={app.id}>
              <AppCard
                app={app}
                href={`/apps/${app.id}`}
                size="small"
                showChart={false}
              />
              {index < appsToShow.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppPreviewList;
