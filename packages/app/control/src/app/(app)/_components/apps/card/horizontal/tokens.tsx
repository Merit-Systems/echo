'use client';

import React from 'react';

import { Braces } from 'lucide-react';

import { LoadingMetric, Metric } from './metric';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const TotalTokens: React.FC<Props> = ({ appId }) => {
  const { data: stats, isLoading } = api.apps.app.stats.overall.useQuery({
    appId,
  });

  const totalTokens = stats?.totalTokens ?? 0;
  const formattedTokens =
    totalTokens >= 1_000_000
      ? `${(totalTokens / 1_000_000).toFixed(1)}M`
      : totalTokens >= 1_000
        ? `${(totalTokens / 1_000).toFixed(1)}K`
        : totalTokens.toString();

  return <Metric isLoading={isLoading} value={formattedTokens} Icon={Braces} />;
};

export const LoadingTotalTokens = () => {
  return <LoadingMetric Icon={Braces} />;
};
