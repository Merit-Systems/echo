import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/trpc/server';
import { BanknoteArrowUp, Brain, Hash, LucideIcon, Users } from 'lucide-react';
import { Suspense } from 'react';

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

export const StatsCards = async ({ appId }: Props) => {
  const overallStatsPromise = api.apps.app.stats.overall({ appId });

  const values = [
    overallStatsPromise.then(({ totalProfit }) => formatCurrency(totalProfit)),
    overallStatsPromise.then(({ totalTokens }) =>
      totalTokens.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        notation: 'compact',
      })
    ),
    overallStatsPromise.then(({ numUsers }) =>
      numUsers.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        notation: 'compact',
      })
    ),
    overallStatsPromise.then(({ transactionCount }) =>
      transactionCount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        notation: 'compact',
      })
    ),
  ];

  return stats.map((stat, index) => (
    <StatCard key={stat.title} {...stat} value={values[index]} />
  ));
};

export const LoadingStatsCards = () => {
  return stats.map(stat => <LoadingStatCard {...stat} key={stat.title} />);
};

interface StatsCardProps extends Stat {
  value: Promise<string>;
}

const StatCard = ({ value, ...stat }: StatsCardProps) => {
  return (
    <BaseStatCard {...stat}>
      <Suspense fallback={<LoadingStatContent />}>
        <StatContent value={value} />
      </Suspense>
    </BaseStatCard>
  );
};

const StatContent = async ({ value }: { value: Promise<string> }) => {
  return <div className="text-4xl font-bold">{await value}</div>;
};

const LoadingStatCard = (stat: Stat) => {
  return (
    <BaseStatCard {...stat}>
      <LoadingStatContent />
    </BaseStatCard>
  );
};

const LoadingStatContent = () => {
  return <div className="text-xl font-bold">Loading...</div>;
};

const BaseStatCard = ({
  title,
  Icon,
  children,
}: Stat & {
  children: React.ReactNode;
}) => {
  return (
    <Card className="p-4 gap-2 flex flex-col">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      {children}
    </Card>
  );
};
