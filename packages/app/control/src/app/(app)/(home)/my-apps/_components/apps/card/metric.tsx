'use client';

import React from 'react';

import { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

interface Props {
  isLoading: boolean;
  value: string;
  Icon: LucideIcon;
  className?: string;
}

export const Metric: React.FC<Props> = ({
  isLoading,
  value,
  Icon,
  className,
}) => {
  return (
    <MetricContainer Icon={Icon} className={className}>
      {isLoading ? (
        <MetricSkeleton />
      ) : (
        <span className="text-lg">{value}</span>
      )}
    </MetricContainer>
  );
};

export const LoadingMetric = ({
  Icon,
  className,
}: {
  Icon: LucideIcon;
  className?: string;
}) => {
  return (
    <MetricContainer Icon={Icon} className={className}>
      <MetricSkeleton />
    </MetricContainer>
  );
};

const MetricSkeleton = () => {
  return <Skeleton className="h-[16px] w-8" />;
};

const MetricContainer = ({
  children,
  Icon,
  className,
}: {
  children: React.ReactNode;
  Icon: LucideIcon;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-semibold text-muted-foreground',
        className
      )}
    >
      <Icon className="size-5" />
      {children}
    </div>
  );
};
