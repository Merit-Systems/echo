'use client';

import { BanknoteArrowUp, Brain, Hash, LucideIcon, Users } from 'lucide-react';

import { api } from '@/trpc/client';

import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  appId: string;
}

interface Stat {
  title: string;
  Icon: LucideIcon;
}

const stats: Stat[] = [
  { title: 'Profit', Icon: BanknoteArrowUp },
  { title: 'Tokens', Icon: Brain },
  { title: 'Users', Icon: Users },
  { title: 'Requests', Icon: Hash },
];

export const StatsCards = ({ appId }: Props) => {
  const [overallStats] = api.apps.app.stats.overall.useSuspenseQuery({ appId });

  const values = [
    formatCurrency(overallStats.totalProfit),
    overallStats.totalTokens.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      notation: 'compact',
    }),
    overallStats.numUsers.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      notation: 'compact',
    }),
    overallStats.transactionCount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      notation: 'compact',
    }),
  ];

  return stats.map((stat, index) => (
    <StatCard key={stat.title} {...stat} value={values[index]} />
  ));
};

export const LoadingStatsCards = () => {
  return stats.map(stat => <LoadingStatCard {...stat} key={stat.title} />);
};

interface StatsCardProps extends Stat {
  value: string;
}

const StatCard = ({ value, ...stat }: StatsCardProps) => {
  return (
    <BaseStatCard {...stat}>
      <div className="text-xl font-bold">{value}</div>
    </BaseStatCard>
  );
};

const LoadingStatCard = (stat: Stat) => {
  return (
    <BaseStatCard {...stat}>
      <Skeleton className="w-16 h-[28px]" />
    </BaseStatCard>
  );
};

const BaseStatCard = ({
  title,
  Icon,
  children,
}: Stat & {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between flex-1 px-4 gap-2 py-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="text-xs font-medium tracking-wider">{title}</span>
      </div>
      <div className="gap-1 flex items-center">{children}</div>
    </div>
  );
};
