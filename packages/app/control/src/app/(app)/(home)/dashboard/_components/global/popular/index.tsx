import React, { Suspense } from 'react';

import { AppCard, LoadingAppCard } from '@/app/(app)/_components/apps/card';

import { api } from '@/trpc/server';
import { SubSection } from '../../utils';

const PopularAppsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SubSection title="Popular Apps">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        {children}
      </div>
    </SubSection>
  );
};

export const PopularApps = () => {
  return (
    <PopularAppsContainer>
      <Suspense fallback={<LoadingPopularAppsGrid />}>
        <PopularAppsGrid />
      </Suspense>
    </PopularAppsContainer>
  );
};

export const LoadingPopularApps = () => {
  return (
    <PopularAppsContainer>
      <LoadingPopularAppsGrid />
    </PopularAppsContainer>
  );
};

const PopularAppsGrid = async () => {
  const { items } = await api.apps.list.public({
    cursor: 0,
    page_size: 6,
  });

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No popular apps found</div>
    );
  }

  return items.map(app => <AppCard key={app.id} {...app} />);
};

const LoadingPopularAppsGrid = () => {
  return Array.from({ length: 6 }).map((_, index) => (
    <LoadingAppCard key={index} />
  ));
};
