'use client';

import React from 'react';

import { DollarSignIcon } from 'lucide-react';

import { LoadingMetric, Metric } from './metric';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const Earnings: React.FC<Props> = ({ appId }) => {
  const { data: earnings, isLoading } = api.apps.app.earnings.get.useQuery({
    appId,
  });

  return (
    <Metric
      isLoading={isLoading}
      value={(earnings ?? 0).toFixed(2)}
      Icon={DollarSignIcon}
      className="text-primary"
    />
  );
};

export const LoadingEarningsAmount = () => {
  return <LoadingMetric Icon={DollarSignIcon} className="text-primary" />;
};
