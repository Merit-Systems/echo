'use client';

import React from 'react';

import { DollarSign } from 'lucide-react';

import { LoadingMetric, Metric } from './metric';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const TotalCost: React.FC<Props> = ({ appId }) => {
  const { data: stats, isLoading } = api.apps.app.stats.overall.useQuery({
    appId,
  });

  return (
    <Metric
      isLoading={isLoading}
      value={(stats?.totalCost ?? 0).toFixed(2)}
      Icon={DollarSign}
      className="text-muted-foreground"
    />
  );
};

export const LoadingTotalCost = () => {
  return <LoadingMetric Icon={DollarSign} className="text-muted-foreground" />;
};
