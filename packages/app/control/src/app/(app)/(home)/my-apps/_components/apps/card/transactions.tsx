'use client';

import React from 'react';

import { Activity } from 'lucide-react';

import { LoadingMetric, Metric } from './metric';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const Transactions: React.FC<Props> = ({ appId }) => {
  const { data: users, isLoading } = api.apps.app.transactions.count.useQuery({
    appId,
  });

  return (
    <Metric
      isLoading={isLoading}
      value={(users ?? 0).toString()}
      Icon={Activity}
    />
  );
};

export const LoadingTransactions = () => {
  return <LoadingMetric Icon={Activity} />;
};
