'use client';

import React from 'react';

import { UsersIcon } from 'lucide-react';

import { LoadingMetric, Metric } from './metric';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const Users: React.FC<Props> = ({ appId }) => {
  const { data: users, isLoading } = api.apps.app.users.count.useQuery({
    appId,
  });

  return (
    <Metric
      isLoading={isLoading}
      value={(users ?? 0).toString()}
      Icon={UsersIcon}
    />
  );
};

export const LoadingUsers = () => {
  return <LoadingMetric Icon={UsersIcon} />;
};
