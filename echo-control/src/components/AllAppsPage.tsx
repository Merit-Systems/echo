'use client';

import React from 'react';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';
import AppCard from '@/components/AppCard';
import { Skeleton } from '@/components/skeleton';
import { useAllApps } from '@/hooks/useAllApps';

type AppUnion = PublicEchoApp | CustomerEchoApp | OwnerEchoApp;

interface AllAppsPageProps {
  title: string;
  description: string;
  fetchApps: () => Promise<AppUnion[]>;
  emptyStateMessage?: string;
}

export const AllAppsPage: React.FC<AllAppsPageProps> = ({
  title,
  description,
  fetchApps,
  emptyStateMessage = 'No apps found.',
}) => {
  const { apps, loading, error } = useAllApps(fetchApps);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <Skeleton key={index} className="h-[250px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-8">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            href={`/apps/${app.id}`}
            size="medium"
            showChart={true}
          />
        ))}
      </div>
    </div>
  );
};

export default AllAppsPage;
